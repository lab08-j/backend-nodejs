# Lab08

## Tecnologias

- Node.js
- TypeScript
- Prisma 6
- MongoDB
- migrate-mongo

## Configuração

1. Instale as dependências:
   npm install

2. Configure o arquivo .env com a variável DATABASE_URL.

## Migrations

Consultar status:
npm run db:migrate:status

Executar migrations pendentes:
npm run db:migrate

Reverter última migration:
npm run db:migrate:down
