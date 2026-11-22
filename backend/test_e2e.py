import os
import re
import uuid

import pytest

playwright_api = pytest.importorskip(
    "playwright.sync_api",
    reason="Install backend/requirements-test.txt to run the E2E tests",
)
expect = playwright_api.expect
sync_playwright = playwright_api.sync_playwright

BASE_URL = os.getenv("E2E_BASE_URL")


@pytest.fixture(scope="session")
def browser():
    if not BASE_URL:
        pytest.skip("Set E2E_BASE_URL to run the browser tests")

    with sync_playwright() as playwright:
        browser_instance = playwright.chromium.launch()
        yield browser_instance
        browser_instance.close()


@pytest.fixture
def page(browser):
    context = browser.new_context()
    page_instance = context.new_page()
    page_instance.set_default_timeout(10_000)
    yield page_instance
    context.close()


def _new_email():
    return f"e2e-{uuid.uuid4().hex}@example.com"


def _vote_count(button):
    match = re.search(r"\((\d+)\)", button.inner_text())
    assert match is not None
    return int(match.group(1))


def _register_and_login(page, email=None):
    email = email or _new_email()
    password = "e2e-password"

    page.goto(BASE_URL)
    page.get_by_role("button", name="Não tem conta? Cadastre-se").click()
    page.get_by_label("Nome").fill("E2E")
    page.get_by_label("Sobrenome").fill("Tester")
    page.get_by_label("E-mail").fill(email)
    page.get_by_label("Senha").fill(password)
    page.get_by_role("button", name="Cadastrar").click()

    page.get_by_label("E-mail").fill(email)
    page.get_by_label("Senha").fill(password)
    page.get_by_role("button", name="Entrar").click()
    expect(page.get_by_role("searchbox", name="Busque um restaurante")).to_be_visible()
    expect(page.get_by_role("button", name="Meu perfil")).to_be_enabled()
    return email


def test_signup_login_logout_and_duplicate_account(page):
    email = _new_email()
    page.goto(BASE_URL)

    page.get_by_label("E-mail").fill(email)
    page.get_by_label("Senha").fill("wrong-password")
    page.get_by_role("button", name="Entrar").click()
    expect(page.get_by_role("alert")).to_have_text(
        "E-mail ou senha inválidos. Cadastre-se primeiro."
    )

    page.get_by_role("button", name="Não tem conta? Cadastre-se").click()
    page.get_by_label("Nome").fill("E2E")
    page.get_by_label("Sobrenome").fill("Tester")
    page.get_by_label("E-mail").fill(email)
    page.get_by_label("Senha").fill("e2e-password")
    page.get_by_role("button", name="Cadastrar").click()

    page.get_by_label("E-mail").fill(email)
    page.get_by_label("Senha").fill("wrong-password")
    page.get_by_role("button", name="Entrar").click()
    expect(page.get_by_role("alert")).to_have_text(
        "E-mail ou senha inválidos. Cadastre-se primeiro."
    )

    page.get_by_label("Senha").fill("e2e-password")
    page.get_by_role("button", name="Entrar").click()
    expect(page.get_by_role("searchbox", name="Busque um restaurante")).to_be_visible()
    expect(page.get_by_role("button", name="Meu perfil")).to_be_enabled()

    page.get_by_role("button", name="Sair").click()
    expect(page.get_by_role("button", name="Entrar")).to_be_visible()

    page.get_by_role("button", name="Não tem conta? Cadastre-se").click()
    page.get_by_label("Nome").fill("E2E")
    page.get_by_label("Sobrenome").fill("Tester")
    page.get_by_label("E-mail").fill(email)
    page.get_by_label("Senha").fill("another-password")
    page.get_by_role("button", name="Cadastrar").click()
    expect(page.get_by_role("alert")).to_have_text("Este e-mail já está cadastrado.")


def test_create_and_edit_restaurant_review(page):
    _register_and_login(page)
    restaurant_card = page.get_by_role("region", name="Restaurantes").get_by_role(
        "button", name=re.compile("Pizzaria Bella Italia")
    )
    restaurant_card.click()

    page.get_by_role("button", name="Avaliar este restaurante").click()
    dialog = page.get_by_role("dialog")
    dialog.get_by_role("button", name="Salvar avaliação").click()
    expect(dialog.get_by_role("alert")).to_have_text(
        "Selecione uma nota de 1 a 5 estrelas."
    )

    original_comment = f"Review e2e original {uuid.uuid4().hex}"
    dialog.get_by_label("Sua avaliação").fill(original_comment)
    dialog.get_by_role("button", name="4 estrelas").click()
    dialog.get_by_role("button", name="Salvar avaliação").click()
    expect(page.get_by_text(original_comment, exact=True)).to_be_visible()

    review = page.get_by_role("article").filter(has_text=original_comment)
    review.get_by_role("button", name="Editar avaliação").click()
    dialog = page.get_by_role("dialog")
    expect(dialog.get_by_label("Sua avaliação")).to_have_value(original_comment)

    updated_comment = f"Review e2e atualizada {uuid.uuid4().hex}"
    dialog.get_by_label("Sua avaliação").fill(updated_comment)
    dialog.get_by_role("button", name="5 estrelas").click()
    dialog.get_by_role("button", name="Salvar avaliação").click()

    expect(page.get_by_text(updated_comment, exact=True)).to_be_visible()
    expect(page.get_by_text(original_comment, exact=True)).to_have_count(0)
    updated_review = page.get_by_role("article").filter(has_text=updated_comment)
    expect(updated_review.get_by_text("★ 5.0", exact=True)).to_be_visible()


def test_review_vote_can_be_changed_without_duplicate_counts(page):
    _register_and_login(page)

    top_reviews = page.get_by_role("region", name="Top 5 reviews")
    review = top_reviews.get_by_role("article").filter(
        has_text="Massa excelente e atendimento atencioso."
    )
    expect(review).to_be_visible()
    helpful = review.get_by_role("button", name="Marcar avaliação como útil")
    unhelpful = review.get_by_role("button", name="Marcar avaliação como não útil")

    helpful_before = _vote_count(helpful)
    unhelpful_before = _vote_count(unhelpful)
    with page.expect_response(re.compile(r"/api/reviews/\d+/votes$")):
        helpful.click()
    expect(helpful).to_have_attribute("aria-pressed", "true")
    expect(helpful).to_contain_text(f"({helpful_before + 1})")
    helpful_after = _vote_count(helpful)
    assert helpful_after == helpful_before + 1
    expect(unhelpful).to_contain_text(f"({unhelpful_before})")
    assert _vote_count(unhelpful) == unhelpful_before

    with page.expect_response(re.compile(r"/api/reviews/\d+/votes$")):
        helpful.click()
    expect(helpful).to_have_attribute("aria-pressed", "true")
    expect(helpful).to_contain_text(f"({helpful_after})")
    assert _vote_count(helpful) == helpful_after

    with page.expect_response(re.compile(r"/api/reviews/\d+/votes$")):
        unhelpful.click()
    expect(unhelpful).to_have_attribute("aria-pressed", "true")
    expect(helpful).to_have_attribute("aria-pressed", "false")
    expect(helpful).to_contain_text(f"({helpful_before})")
    expect(unhelpful).to_contain_text(f"({unhelpful_before + 1})")
    assert _vote_count(helpful) == helpful_before
    assert _vote_count(unhelpful) == unhelpful_before + 1


def test_follow_user_and_view_review_history(page):
    _register_and_login(page)

    page.get_by_role("searchbox", name="Busque um usuário").fill("ana")
    page.get_by_role("button", name="Buscar usuário").click()
    page.get_by_role("button", name=re.compile(r"^ana\b", re.IGNORECASE)).click()

    expect(page.get_by_role("heading", name="Histórico de reviews")).to_be_visible()
    expect(page.get_by_role("button", name="Pizzaria Bella Italia")).to_be_visible()

    followers = page.get_by_role("button", name=re.compile(r"^\d+ seguidores$"))
    followers_before = int(re.match(r"(\d+)", followers.inner_text()).group(1))
    page.get_by_role("button", name="Seguir").click()
    expect(page.get_by_role("button", name="Deixar de seguir")).to_be_visible()
    expect(followers).to_have_text(f"{followers_before + 1} seguidores")

    page.get_by_role("button", name="Deixar de seguir").click()
    expect(page.get_by_role("button", name="Seguir")).to_be_visible()
    expect(followers).to_have_text(f"{followers_before} seguidores")
