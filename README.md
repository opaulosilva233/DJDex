# RaveDex 🎧

RaveDex é uma SPA interativa de gestão e estatísticas de DJ Sets ao vivo, concebida como evolução de uma solução anterior baseada em Google Sheets para uma experiência moderna, visual e centralizada no browser.

## Funcionalidades Principais

- CRUD completo para gerir sets, registos e dados associados.
- Persistência local com LocalStorage, garantindo uma experiência rápida e sem dependências externas.
- Importação e exportação de backups com confirmação de segurança antes de ações sensíveis.
- Navegação organizada por Sidebar para acesso fluido às principais secções da aplicação.
- Dark Mode nativo com suporte a View Transitions API para transições visuais mais suaves.
- Dashboard analítico com gráficos e métricas construídos com Recharts.

## Tecnologias Utilizadas

- React
- Vite
- Tailwind CSS
- Lucide React
- Recharts
- React Router DOM
- Docker

## Como Executar o Projeto

1. Instala o Docker Desktop no teu computador, caso ainda não esteja instalado.
2. Abre o terminal na raiz do projeto.
3. Executa o comando:

```bash
docker-compose up --build
```

4. Quando o container arrancar, abre a aplicação em http://localhost:5173.

## Nota Sobre os Dados

Este projeto cumpre o requisito de ser 100% frontend. Os dados são guardados no LocalStorage do browser, simulando uma base de dados local sem necessidade de configurações adicionais de serviços externos. Isto simplifica a avaliação e permite executar a aplicação imediatamente após iniciar o container.
