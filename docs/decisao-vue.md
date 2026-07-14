# Decisão arquitetural: Vue como camada de interface

## Contexto

A primeira implementação utilizava TypeScript e manipulação direta do DOM. Com o crescimento do catálogo, da página de detalhes, do diagnóstico de câmera e da integração 3D, as telas passaram a concentrar criação de elementos, eventos, navegação e limpeza de recursos.

## Decisão

Adotar:

- Vue 3 com Composition API e `<script setup>`;
- Vue Router para navegação;
- componentes `.vue` para a interface;
- composables para lógica de interface com ciclo de vida;
- arquivos JSON para o conteúdo dos instrumentos;
- TypeScript para tipos, validação e funções de consulta.

Não adotar nesta fase:

- Pinia, porque não existe estado global complexo;
- Nuxt ou renderização no servidor;
- biblioteca completa de componentes visuais ou design system externo;
- backend ou banco de dados.

A biblioteca Lucide é usada somente para ícones e não determina a estrutura ou o estilo dos componentes.

## Consequências

- templates substituem a montagem manual do DOM;
- a troca de rotas desmonta componentes e libera recursos pelo ciclo de vida Vue;
- o instrumento permanece identificado na URL;
- `<model-viewer>` continua isolado como Web Component;
- câmera e futuras sessões de RA devem ser encapsuladas em componentes ou composables;
- o build permanece estático e compatível com Vercel e Nginx.

## Roteamento

Foi adotado histórico HTML em vez de hash routing. O fragmento da URL pode ser usado pelo fallback do Scene Viewer no Android, portanto não deve ser controlado simultaneamente pelo roteador.

Para suportar acesso direto às rotas:

- a Vercel usa o rewrite definido em `vercel.json`;
- o Nginx usa `try_files` com fallback para `index.html`.
