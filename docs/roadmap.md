# Roadmap

## Estado atual

A Harpa é o primeiro piloto da experiência 3D porque seu modelo foi recuperado do projeto anterior.

Já foram concluídos:

1. [x] migração da interface para Vue 3 e Vue Router;
2. [x] catálogo e páginas individuais dos instrumentos;
3. [x] estrutura de dados em JSON separada da interface;
4. [x] conteúdo inicial de Shofar, Harpa e Tamborim;
5. [x] associação da Harpa ao modelo GLB;
6. [x] rotação e zoom do modelo no navegador;
7. [x] layout fluido e temas do sistema, claro e escuro;
8. [x] identidade visual inicial, favicon e ilustração do catálogo;
9. [x] execução estática compatível com Vercel e Docker.

## Próxima entrega

O objetivo da próxima entrega é consolidar conteúdo, mídia e experiência 3D antes de avançar na realidade aumentada:

1. revisar as referências, fontes e afirmações dos três instrumentos;
2. adicionar imagens de capa;
3. adicionar áudios demonstrativos;
4. encontrar modelos adequados para Shofar e Tamborim;
5. otimizar e padronizar os arquivos GLB;
6. validar enquadramento, controles e carregamento em diferentes telas;
7. revisar contraste, navegação por teclado e acessibilidade;
8. registrar origem, autoria e licença dos ativos usados na publicação.

## Realidade aumentada

O `<model-viewer>` já oferece uma entrada experimental para posicionamento no ambiente, mas essa capacidade não é o foco da entrega atual.

Depois que a experiência 3D estiver consolidada, será necessário:

- definir a escala física dos modelos;
- validar posicionamento em Android e iOS compatíveis;
- criar mensagens para dispositivos sem suporte;
- decidir se a entrada experimental pode ser apresentada como recurso estável;
- reavaliar o MindAR somente para atividades com cartões ou materiais impressos.

## Evoluções posteriores

- adicionar novos instrumentos ao catálogo;
- criar atividades conduzidas por educadores;
- avaliar funcionamento offline como aplicação web instalável;
- aprimorar desempenho e compatibilidade em dispositivos reais;
- avaliar recursos de apoio para famílias, professores e responsáveis.

## Decisões consolidadas

- o conteúdo educacional e a exploração 3D são o núcleo da aplicação;
- a realidade aumentada é uma extensão opcional;
- a aplicação permanece totalmente frontend, sem API ou banco de dados;
- a Vercel é a hospedagem principal e o Docker oferece portabilidade;
- Vue 3 e Vue Router formam a camada de interface;
- Pinia não é necessário enquanto não houver estado global complexo;
- os dados de cada instrumento permanecem em arquivos JSON próprios.
