# Instrumentos do Mundo Bíblico

Aplicação web educacional para explorar instrumentos mencionados em contextos bíblicos por meio de conteúdo histórico, referências, ciência do som e modelos 3D.

O conteúdo e a exploração 3D formam a experiência principal. A realidade aumentada será aprimorada posteriormente como uma extensão opcional, sem impedir o acesso às informações em dispositivos incompatíveis.

## Objetivo

O projeto busca:

- tornar o estudo dos instrumentos do mundo bíblico mais visual e interativo;
- relacionar Bíblia, história, música e ciência em linguagem acessível;
- explicar como diferentes instrumentos produzem som;
- estimular curiosidade e aprendizado ativo;
- oferecer uma experiência funcional em computadores, tablets e celulares.

## Experiência atual

A aplicação possui:

- catálogo de instrumentos;
- páginas com contexto bíblico, histórico e científico;
- referências, curiosidades e fontes consultadas;
- visualização e manipulação do modelo 3D da Harpa;
- estrutura de dados independente da interface;
- temas do sistema, claro e escuro;
- layout fluido para diferentes tamanhos de tela;
- execução local com Node.js ou Docker;
- publicação estática compatível com a Vercel.

Shofar e Tamborim já possuem conteúdo educacional, mas ainda aguardam modelos 3D, imagens de capa e áudios demonstrativos. Os textos e as fontes também precisam passar por revisão factual antes da publicação definitiva.

## Tecnologias

- Vue 3 e Vue Router;
- TypeScript e Vite;
- `<model-viewer>` e Three.js;
- Lucide para ícones;
- JSON para o conteúdo dos instrumentos;
- CSS com temas e layout responsivo;
- Docker e Nginx;
- Vercel para hospedagem estática.

## Execução local

Com Node.js:

```bash
npm install
npm run dev
```

Com Docker:

```bash
docker compose up --build
```

Consulte [Execução e deploy](./docs/execucao-e-deploy.md) para detalhes sobre desenvolvimento, imagem de produção e publicação na Vercel.

## Documentação

As decisões de produto, arquitetura, design, roadmap e tarefas estão organizadas em [`docs/`](./docs/README.md).

## Público

- crianças e adolescentes;
- famílias e educadores;
- projetos educacionais cristãos;
- igrejas e iniciativas do programa **Ciência e Fé**;
- pessoas interessadas em Bíblia, história, música e ciência.

Não é necessário conhecimento técnico para utilizar a aplicação.

## Licença

O conteúdo deste repositório — incluindo código-fonte, modelos 3D, textos, imagens e áudios — está licenciado sob a **Creative Commons Attribution–NonCommercial 4.0 International (CC BY-NC 4.0)**.

- uso permitido para fins educacionais e não comerciais;
- crédito obrigatório aos autores;
- uso comercial somente mediante autorização prévia.

Mais informações em [creativecommons.org/licenses/by-nc/4.0](https://creativecommons.org/licenses/by-nc/4.0/).

## Autoria

Projeto idealizado e desenvolvido no contexto do programa **Ciência e Fé**.
