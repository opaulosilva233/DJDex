# DJDex - O teu indexador pessoal de DJs, Festivais e Sets

O **DJDex** é uma aplicação web completa (SPA + API) concebida para gerir, indexar e analisar estatísticas de DJs, festivais de música e sets ao vivo. O ecossistema oferece uma interface moderna, visualmente rica e interativa para utilizadores convidados e administradores, suportada por um painel analítico dinâmico.

---

## 🛠️ Arquitetura do Projeto

O projeto está estruturado de forma desacoplada, separando as responsabilidades de cliente e servidor em dois diretórios autónomos, todos integrados e orquestrados num ambiente virtualizado via Docker.

### Estrutura de Diretórios e Stacks

| Diretório | Componente | Stack Tecnológica | Descrição |
| :--- | :--- | :--- | :--- |
| `/frontend` | Interface de Utilizador (SPA) | React, Vite, Tailwind CSS, Recharts | Aplicação frontend focada em usabilidade, com gráficos interativos, design responsivo e transições rápidas. |
| `/backend` | API Restful | Laravel 11, API Sanctum, MySQL | Servidor de backend responsável pelo armazenamento de dados, autenticação de utilizadores e validação de regras de negócio. |

### Orquestração com Docker

Toda a infraestrutura do projeto (servidor web frontend, API do backend e servidor de base de dados MySQL) é gerida de forma unificada através do Docker Compose, facilitando o arranque imediato do ambiente de desenvolvimento sem necessidade de instalar dependências locais de PHP ou Node.js.

---

## ✨ Funcionalidades Principais

*   **Gestão Completa (CRUD)**: Interface dedicada para criar, visualizar, atualizar e eliminar DJs, festivais e sets, permitindo gerir as suas informações detalhadas de forma simples.
*   **Upload Dinâmico de Imagens**: Processo automatizado e estruturado de upload de imagens associadas a DJs e festivais, mapeadas de forma segura de acordo com os IDs únicos dos registos.
*   **Painel Analítico de Estatísticas**: Dashboard dinâmico construído com Recharts que processa e apresenta métricas agregadas da base de dados, tais como a distribuição de géneros musicais, popularidade de festivais e duração acumulada de sets.
*   **Autenticação Híbrida**: Sistema de segurança que distingue utilizadores Administradores (com direitos de alteração e manipulação de dados) e Convidados (perfil de consulta e visualização de estatísticas).

---

## 🚀 Como Instalar e Rodar Localmente

Siga os passos abaixo para configurar e executar o projeto no seu ambiente de desenvolvimento.

### Pré-requisitos
*   [Docker](https://www.docker.com/) e Docker Compose instalados na máquina.

### Passo 1: Variáveis de Ambiente
Certifique-se de que os ficheiros `.env` estão configurados para estabelecer a ligação do backend com o MySQL e as credenciais necessárias. Caso precise de criar um ficheiro `.env` para o Laravel:
```bash
cp backend/.env.example backend/.env
```

### Passo 2: Construir e Iniciar os Containers
Na raiz do projeto, execute o comando abaixo para descarregar as imagens necessárias e iniciar todos os serviços em segundo plano:
```bash
docker compose up --build
```
Após o arranque dos containers, as aplicações estarão disponíveis em:
*   **Frontend (React/Vite)**: [http://localhost:5173](http://localhost:5173)
*   **Backend (Laravel API)**: [http://localhost:8000](http://localhost:8000)

### Passo 3: Executar Migrações e Seeders
Com os containers em execução, crie e povoe a base de dados MySQL executando as migrações e seeders do Artisan no container do backend:
```bash
docker compose exec backend php artisan migrate:fresh --seed
```

---

## 🔒 Segurança

O DJDex foi desenvolvido a pensar em boas práticas de segurança Web:
*   **Proteção de Endpoints**: A API do Laravel utiliza o Laravel Sanctum para autenticação segura baseada em tokens.
*   **Gestão de Sessões**: Mecanismo dinâmico de controlo de estado no Frontend baseado em tokens locais geridos de forma segura.
