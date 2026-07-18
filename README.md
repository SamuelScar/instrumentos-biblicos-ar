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

- catálogo com nove instrumentos, ordenação e layout responsivo;
- páginas com contexto bíblico, histórico e científico;
- referências, curiosidades e fontes consultadas;
- visualização e manipulação de modelos 3D de Alaúde, Flauta, Harpa, Lira, Saltério,
  Shofar, Sinos, Tamborim e Trombeta;
- demonstrações sonoras com player próprio para os nove instrumentos;
- estrutura de dados independente da interface;
- temas do sistema, claro e escuro;
- layout fluido para diferentes tamanhos de tela e retorno rápido ao topo;
- execução local com Node.js ou Docker;
- publicação estática compatível com a Vercel.

Todos os instrumentos cadastrados possuem conteúdo educacional, modelo 3D, imagem de capa e áudio
demonstrativo. Para concluir o MVP, as próximas etapas são revisar textos e fontes, validar
acessibilidade e dispositivos reais e registrar a procedência dos modelos e áudios.

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

O código e o conteúdo autoral deste repositório estão licenciados sob a **Creative Commons
Attribution–NonCommercial 4.0 International (CC BY-NC 4.0)**. Ativos obtidos de terceiros devem
respeitar também suas licenças de origem, que precisam ser registradas antes da publicação definitiva.

- uso permitido para fins educacionais e não comerciais;
- crédito obrigatório aos autores;
- uso comercial somente mediante autorização prévia.

Mais informações em [creativecommons.org/licenses/by-nc/4.0](https://creativecommons.org/licenses/by-nc/4.0/).

## Autoria

Projeto idealizado e desenvolvido no contexto do programa **Ciência e Fé**.
