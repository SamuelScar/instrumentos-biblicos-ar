# Instrumentos do Mundo Bíblico

Aplicação web educacional para explorar instrumentos mencionados em contextos bíblicos por meio de conteúdo histórico, referências, ciência do som e modelos 3D.

O conteúdo e a exploração 3D formam a experiência principal. A realidade aumentada está sendo
validada como uma extensão opcional, sem impedir o acesso às informações em dispositivos
incompatíveis.

## Objetivo

O projeto busca:

- tornar o estudo dos instrumentos do mundo bíblico mais visual e interativo;
- relacionar Bíblia, história, música e ciência em linguagem acessível;
- explicar como diferentes instrumentos produzem som;
- estimular curiosidade e aprendizado ativo;
- oferecer uma experiência funcional em computadores, tablets e celulares.

## Experiência atual

A aplicação possui:

- catálogo com nove instrumentos, ordenação e layout responsivo;
- páginas com contexto bíblico, histórico e científico;
- referências, curiosidades e fontes consultadas;
- visualização e manipulação de modelos 3D de Alaúde, Flauta, Harpa, Lira, Saltério,
  Shofar, Sinos, Tamborim e Trombeta;
- demonstrações sonoras com player próprio para os nove instrumentos;
- realidade aumentada no ambiente para os nove instrumentos em dispositivos compatíveis;
- rastreamento por cards próprios para os nove instrumentos, disponível com webcam ou câmera do
  celular;
- estrutura de dados independente da interface;
- temas do sistema, claro e escuro;
- layout fluido para diferentes tamanhos de tela e retorno rápido ao topo;
- execução local com Node.js ou Docker;
- publicação estática compatível com a Vercel.

Todos os instrumentos cadastrados possuem conteúdo educacional, modelo 3D, imagem de capa, áudio
demonstrativo e configuração para os dois modos de realidade aumentada. Para concluir o MVP, as
próximas etapas são revisar textos e fontes, validar acessibilidade, testar sistematicamente os dois
modos de RA em dispositivos reais, preparar os cards para impressão e registrar a procedência dos
modelos e áudios.

## Tecnologias

- Vue 3 e Vue Router;
- TypeScript e Vite;
- `<model-viewer>`, Three.js e núcleo web do MindAR;
- Lucide para ícones;
- JSON para o conteúdo dos instrumentos;
- CSS com temas e layout responsivo;
- Docker e Nginx;
- Vercel para hospedagem estática.

## Execução local

Com Node.js:

Use Node.js 24. O Corepack utiliza automaticamente a versão do pnpm fixada no projeto.

```bash
corepack enable pnpm
pnpm install
pnpm run dev
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

O licenciamento é separado conforme o tipo de material:

- o código autoral usa a **PolyForm Noncommercial License 1.0.0**;
- textos, dados educacionais e artes autorais usam a **CC BY-NC 4.0**;
- bibliotecas e ativos de terceiros permanecem sob suas licenças de origem.

Consulte [LICENSE.md](LICENSE.md) para os termos, [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
para as bibliotecas utilizadas e [ASSET_CREDITS.md](ASSET_CREDITS.md) para a autoria, origem,
licença e situação dos modelos 3D, imagens e áudios. Ativos de terceiros não são automaticamente
cobertos pela licença do projeto.

## Autoria

Projeto idealizado e desenvolvido no contexto do programa **Ciência e Fé**.
