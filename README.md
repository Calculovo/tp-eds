# tp-eds

## Como executar

Com o Docker Desktop instalado e em execução, inicie o banco de dados, a API e o site de uma vez:

```sh
docker compose up --build
```

Quando os serviços estiverem prontos, acesse o site em <http://localhost:5173>. A API fica disponível em <http://localhost:8000>.
Os dados de exemplo de `backend/seed.py` são inseridos automaticamente na inicialização, sem duplicação ao reiniciar.

Para encerrar os serviços, pressione `Ctrl+C`. Para também remover os containers, execute `docker compose down`.

## Membros
- Camila de Almeida Ribeiro (backend)
- Emerson Araújo Simões (full)
- Gabriel Wilson Dos Santos Da Silva (frontend)
- Pedro Lucas Garcia Calais (backend)

## Objetivo do Sistema
O sistema (restaurank) é um fórum de reviews de restaurantes. Usuários podem buscar restaurantes baseado em seu placar médio, comentar sobre os restaurantes listados, ler as reviews deixadas por outros usuários, e avaliar de reviews são úteis ou não.

## Tecnologias

### Linguagem
TypeScript
​Python

### Frameworks
React
Django
FastAPI

### Banco de Dados
PostgreSQL

### Agentes de IA
Cursor 
GitHub Copilot
Gemini Pro chat e Notebooks

## Histórias de Usuário
1. Como usuário, quero criar uma conta;
2. Como usuário, quero fazer login;
3. Como usuário, quero buscar restaurantes;
4. Como usuário, quero avaliar um restaurante;
5. Como usuário, quero visualizar a página de um restaurante;
6. Como usuário, quero avaliar reviews de outros usuários;
7. Como usuário, quero visualizar o perfil de outros usuários;
8. Como usuário, quero ver o histórico de reviews de outros usuários.


# UML Diagram

## System Overview

```mermaid
classDiagram
    class ReactApp {
        +tela
        +emailLogado
        +viewerId
        +usuarioSelecionado
        +restauranteSelecionado
        +buscarRestaurante()
        +abrirRestaurante()
        +selecionarUsuario()
        +sair()
    }

    class Login
    class Cadastro
    class ListaRestaurantes
    class PerfilUsuario
    class AvaliarRestaurante
    class TopReviews
    class BotoesVotoReview
    class NavegacaoLogada

    class FastAPIApp {
        +search_restaurants(name)
        +get_restaurant(id)
        +create_review(restaurant_id, review)
        +vote_review(review_id, vote)
        +list_restaurant_reviews(restaurant_id, viewer_id)
        +list_top_reviews(viewer_id)
        +search_users(name, email)
        +create_or_get_user(user)
        +get_user_profile(user_id, viewer_id)
        +follow_user(user_id, follower_id)
        +unfollow_user(user_id, follower_id)
        +reset_password(payload)
        +update_username(user_id, payload)
    }

    class User {
        +int id
        +string email
        +string username
        +string password
        +createOrGetUser()
        +resetPassword()
        +updateUsername()
    }

    class Restaurant {
        +int id
        +string name
        +string category
        +string image_url
    }

    class Review {
        +int id
        +int user_id
        +int restaurant_id
        +float rating
        +string comment
    }

    class ReviewVote {
        +int id
        +int review_id
        +int user_id
        +bool is_helpful
    }

    class Follow {
        +int follower_id
        +int followed_id
    }

    ReactApp --> Login
    ReactApp --> Cadastro
    ReactApp --> ListaRestaurantes
    ReactApp --> PerfilUsuario
    ReactApp --> AvaliarRestaurante
    ReactApp --> TopReviews
    ReactApp --> NavegacaoLogada
    ReactApp --> BotoesVotoReview

    FastAPIApp --> User
    FastAPIApp --> Restaurant
    FastAPIApp --> Review
    FastAPIApp --> ReviewVote
    FastAPIApp --> Follow

    User "1" --> "0..*" Review : writes
    Restaurant "1" --> "0..*" Review : receives
    Review "1" --> "0..*" ReviewVote : has
    User "1" --> "0..*" ReviewVote : votes
    User "1" --> "0..*" Follow : follows
    User "1" --> "0..*" Follow : is followed by
```

## Sequence Diagram: Leaving a Review

```mermaid
sequenceDiagram
    actor User as Usuário
    participant App as React App
    participant API as FastAPI
    participant DB as PostgreSQL

    User->>App: Accesses restaurant page and clicks "Evaluate"
    App->>API: GET /api/restaurants/{restaurant_id}
    API->>DB: SELECT restaurant data and rating summary
    DB-->>API: Restaurant info + aggregate stats
    API-->>App: Restaurant details
    App->>User: Shows evaluation form

    User->>App: Enters email, rating and comment
    App->>API: POST /api/restaurants/{restaurant_id}/reviews
    API->>DB: Check if restaurant exists
    alt Restaurant not found
        DB-->>API: No row found
        API-->>App: 404 Not Found
        App->>User: Show error
    else Restaurant exists
        API->>DB: get_or_create_user(email)
        alt User exists
            DB-->>API: user_id
        else User does not exist
            DB->>DB: INSERT INTO users(email, username)
            DB-->>API: new user_id
        end

        API->>DB: INSERT INTO reviews(user_id, restaurant_id, rating, comment)
        Note over DB: ON CONFLICT (user_id, restaurant_id) updates rating/comment
        DB-->>API: review_id
        API-->>App: { id: review_id }
        App->>User: Shows success / refreshes restaurant data
        App->>API: GET /api/restaurants/{restaurant_id}
        API->>DB: Recalculate average rating and review count
        DB-->>API: Updated stats
        API-->>App: Updated restaurant info
        App->>App: Update list of reviews on the page
    end
```

## Como rodar os testes

### Backend

Os testes unitários usam pytest e `unittest.mock` para verificar a lógica da API, do banco e da carga inicial sem depender do PostgreSQL. Os testes de integração usam `TestClient` do FastAPI e um PostgreSQL isolado no Docker Compose. A cobertura de linhas e branches é medida por `pytest-cov`.

Na raiz do repositório, crie o ambiente virtual uma vez, se ainda não existir, e instale as dependências de teste:

```powershell
if (-not (Test-Path .\.venv\Scripts\python.exe)) { py -3 -m venv .venv }
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-test.txt
```

Testes unitários (não precisam do PostgreSQL):

```powershell
.\.venv\Scripts\python.exe -m pytest backend\test_backend.py backend\test_main.py
```

Testes de integração (requerem Docker Desktop):

```powershell
docker compose --profile test up -d test-db
$env:TEST_DATABASE_URL = "postgresql://restaurank_test:restaurank_test@localhost:5433/restaurank_test"
.\.venv\Scripts\python.exe -m pytest backend\test_integration.py
```

Coverage do backend (executa unitários e integração, mede linhas e branches, exige no mínimo 80% e gera HTML em `backend/htmlcov/`):

```powershell
docker compose --profile test up -d test-db
$env:TEST_DATABASE_URL = "postgresql://restaurank_test:restaurank_test@localhost:5433/restaurank_test"
.\.venv\Scripts\python.exe -m pytest backend\test_backend.py backend\test_main.py backend\test_integration.py `
  --cov=backend.main --cov=backend.db --cov=backend.seed `
  --cov-branch `
  --cov-report=term-missing --cov-report=html:backend/htmlcov `
  --cov-fail-under=80
```

O banco de testes é separado do banco de desenvolvimento. Ao terminar os testes de integração ou coverage, ele pode ser parado com `docker compose --profile test stop test-db`.

### Frontend

Os testes usam Vitest, React Testing Library e `user-event` em jsdom. Os unitários verificam componentes e utilitários isoladamente; os de integração exercitam o aplicativo completo com a API simulada.

Na raiz do repositório:

```powershell
cd frontend
npm.cmd install
```

Testes unitários:

```powershell
npm.cmd run test:unit
```

Testes de integração:

```powershell
npm.cmd run test:integration
```

Coverage do frontend (executa as duas suítes, exige 80% em linhas, instruções, funções e branches e gera HTML em `frontend/coverage/`):

```powershell
npm.cmd run test:coverage
```

### E2E

Os testes E2E usam pytest com Playwright para controlar o Chromium e validar fluxos reais no site com frontend, API e PostgreSQL iniciados pelo Docker Compose.

Na raiz do repositório, com o Docker Desktop instalado e em execução:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\run-e2e.ps1
```

O script prepara pytest/Playwright e Chromium quando necessário, inicia banco, API e frontend e executa os testes no navegador. Os serviços ficam ativos ao final; para encerrá-los, use `docker compose down`.
