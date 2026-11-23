$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$venvPath = Join-Path $repoRoot '.venv'
$python = Join-Path $venvPath 'Scripts\python.exe'

Push-Location $repoRoot
try {
    if (-not (Test-Path $python)) {
        $systemPython = Get-Command python -ErrorAction SilentlyContinue
        $pythonLauncher = Get-Command py -ErrorAction SilentlyContinue
        if ($systemPython) {
            & $systemPython.Source -m venv $venvPath
        }
        elseif ($pythonLauncher) {
            & $pythonLauncher.Source -3 -m venv $venvPath
        }
        else {
            throw 'Python is required. Install Python and make sure the "py" launcher is on PATH.'
        }
        if ($LASTEXITCODE -ne 0) {
            throw 'Could not create the project virtual environment.'
        }
    }

    & $python -c "import importlib.util, sys; sys.exit(0 if importlib.util.find_spec('pytest') and importlib.util.find_spec('playwright') else 1)"
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Installing E2E test dependencies...'
        & $python -m pip install -r backend\requirements-test.txt
        if ($LASTEXITCODE -ne 0) {
            throw 'Could not install E2E test dependencies.'
        }
    }

    $browserPath = & $python -c 'from playwright.sync_api import sync_playwright; p = sync_playwright().start(); print(p.chromium.executable_path); p.stop()'
    if ($LASTEXITCODE -ne 0) {
        throw 'Could not locate the Playwright Chromium browser.'
    }
    $browserPath = ($browserPath | Select-Object -Last 1).Trim()
    if (-not (Test-Path $browserPath)) {
        Write-Host 'Installing the Playwright Chromium browser...'
        & $python -m playwright install chromium
        if ($LASTEXITCODE -ne 0) {
            throw 'Could not install the Playwright Chromium browser.'
        }
    }

    $docker = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $docker) {
        throw 'Docker Desktop is required. Start Docker Desktop and try again.'
    }

    $env:E2E_BASE_URL = 'http://localhost:5173'
    & $docker.Source compose up --build -d
    if ($LASTEXITCODE -ne 0) {
        throw 'Could not start Docker Compose. Make sure Docker Desktop is running, then try again.'
    }

    Write-Host 'Waiting for the frontend and API to become ready...'
    $deadline = (Get-Date).AddMinutes(3)
    $ready = $false
    while ((Get-Date) -lt $deadline) {
        try {
            $null = Invoke-WebRequest -UseBasicParsing -Uri "$env:E2E_BASE_URL" -TimeoutSec 5
            $null = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:8000/openapi.json' -TimeoutSec 5
            $ready = $true
            break
        }
        catch {
            Start-Sleep -Seconds 2
        }
    }

    if (-not $ready) {
        & $docker.Source compose ps
        throw 'The frontend or API did not become ready within three minutes.'
    }

    & $python -m pytest -q backend\test_e2e.py
    if ($LASTEXITCODE -ne 0) {
        throw 'The E2E test suite failed.'
    }
}
finally {
    Pop-Location
}
