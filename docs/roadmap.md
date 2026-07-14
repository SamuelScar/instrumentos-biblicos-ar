# Roadmap

## Primeira entrega

A **Harpa** foi adotada como primeiro piloto técnico por ser o modelo 3D recuperado do projeto anterior:

1. [x] estruturar o catálogo e a página de detalhes;
2. [x] relacionar a Harpa ao modelo GLB;
3. [x] adicionar manipulação do modelo no navegador;
4. [x] disponibilizar **Ver no meu espaço** nos dispositivos compatíveis;
5. [x] migrar a interface para Vue 3 e Vue Router;
6. [ ] confirmar origem, licença, escala e adequação histórica do modelo;
7. [ ] definir o conteúdo educacional completo;
8. [ ] adicionar imagem de capa e áudio;
9. [ ] validar a experiência antes de replicá-la para os demais instrumentos.

## Etapas posteriores

- Replicar a experiência validada para Shofar e Tamborim.
- Aprimorar identidade visual e navegação infantil.
- Adicionar atividades conduzidas por educadores.
- Preparar cartões ou material didático para rastreamento com MindAR.
- Avaliar funcionamento offline como aplicação web instalável.
- Revisar acessibilidade, desempenho e compatibilidade em dispositivos reais.

## Estado das decisões

- **Definido:** o conteúdo educacional e a exploração 3D são o núcleo da aplicação.
- **Implementado:** `<model-viewer>` para visualização 3D e entrada inicial em realidade aumentada.
- **Adiado:** rastreamento com MindAR para experiências com materiais impressos; o marcador legado foi preservado.
- **Definido:** aplicação totalmente frontend, com Vercel para hospedagem e Docker para portabilidade.
- **Definido:** Vue 3 e Vue Router como camada de interface, sem Pinia nesta fase.
- **Ainda não definido:** origem dos demais modelos e conteúdo educacional final.
