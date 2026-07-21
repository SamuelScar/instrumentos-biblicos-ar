# Execução e deploy

## Arquitetura de distribuição

A aplicação permanece totalmente frontend. O Vite gera arquivos estáticos em `dist`, sem API, banco de dados ou servidor de aplicação.

```text
Vue, TypeScript e ativos
        ↓
      Vite
        ↓
       dist
      ↙    ↘
  Vercel   Nginx no Docker
```

## Desenvolvimento local com Node.js

```bash
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`.

## Desenvolvimento com Docker

```bash
docker compose up --build
```

O Compose utiliza o estágio `development` de `docker/Dockerfile`, mantém as dependências dentro do container e disponibiliza o Vite em `http://localhost:5173`.

O acesso por outro aparelho através de um endereço IP local usa HTTP e pode ter a câmera bloqueada pelo navegador. Para testar câmera e realidade aumentada em celulares, deve-se usar HTTPS, como o endereço de preview da Vercel.

## Imagem Docker de produção

O estágio final de `docker/Dockerfile` gera o projeto e serve `dist` com Nginx. Ele permite executar a aplicação em um servidor ou rede local sem depender da Vercel.

O arquivo `docker/nginx.conf` redireciona rotas que não correspondem a arquivos para `index.html`, permitindo abrir diretamente endereços como `/instrumentos/harpa`.

```bash
docker build -f docker/Dockerfile -t instrumentos-mundo-biblico .
docker run --rm -p 8080:80 instrumentos-mundo-biblico
```

## Vercel

O deploy na Vercel deve continuar usando o suporte nativo ao Vite:

- comando de build: `npm run build`;
- diretório de saída: `dist`;
- instalação: `npm install` ou detecção automática.

O arquivo `docker/Dockerfile` não participa do deploy da Vercel. Não é necessário criar `Dockerfile.vercel` para esta aplicação estática.

O `vercel.json` reescreve as rotas da SPA para `index.html`. Essa configuração mantém URLs normais no Vue Router e deixa o fragmento da URL disponível para os mecanismos de fallback da realidade aumentada.
