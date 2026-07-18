# Roadmap

## Estado atual

A aplicação já possui uma primeira coleção funcional com nove instrumentos:

- Alaúde;
- Flauta;
- Harpa;
- Lira;
- Saltério;
- Shofar;
- Sinos;
- Tamborim;
- Trombeta.

Já foram concluídos:

1. [x] migração da interface para Vue 3 e Vue Router;
2. [x] catálogo responsivo com ordenação e páginas individuais;
3. [x] conteúdo de cada instrumento em um arquivo JSON próprio;
4. [x] conteúdo bíblico, histórico, científico, curiosidades e fontes para os nove instrumentos;
5. [x] associação de todos os instrumentos a modelos GLB padronizados;
6. [x] visualização, rotação e zoom no navegador;
7. [x] temas do sistema, claro e escuro;
8. [x] identidade visual, favicon e ilustração do catálogo;
9. [x] execução estática compatível com Vercel e Docker;
10. [x] demonstrações sonoras em MP3 com player próprio para os nove instrumentos;
11. [x] capas próprias para os nove instrumentos, usadas no catálogo e como pôster do visualizador;
12. [x] estrutura inicial para realidade aumentada opcional;
13. [x] estados consistentes de preparação, carregamento, falha e nova tentativa no visualizador 3D.

## Próxima entrega

O próximo marco é concluir um MVP adequado para avaliação editorial e testes com usuários. A
prioridade deixa de ser adicionar instrumentos e passa a ser tornar previsível e clara a experiência
que já existe.

1. fortalecer a validação estrutural dos arquivos JSON;
2. revisar enquadramento, materiais e interação dos nove modelos;
3. validar o fluxo completo em celulares e computadores reais;
4. revisar referências, fontes, termos originais e afirmações históricas;
5. registrar origem, autoria e licença de todos os ativos;
6. validar contraste, teclado e tecnologia assistiva;
7. revisar procedência, licença e adequação dos áudios adicionados;
8. atualizar a documentação sempre que a coleção ou o estado dos ativos mudar.

## Realidade aumentada

O `<model-viewer>` já oferece uma entrada experimental para posicionamento no ambiente, atualmente
habilitada apenas onde a configuração do instrumento permite. Essa capacidade continua fora do
foco da próxima entrega.

Depois da consolidação da experiência 3D, será necessário:

- definir dimensões e escala física dos modelos;
- validar posicionamento em Android e iOS compatíveis;
- preparar os formatos e ativos exigidos por cada plataforma;
- criar mensagens para dispositivos sem suporte;
- decidir se a experiência pode ser apresentada como recurso estável;
- reavaliar o MindAR somente para atividades com cartões ou materiais impressos.

## Evoluções posteriores

- adicionar busca, categorias e filtros quando o catálogo crescer;
- criar atividades conduzidas por educadores;
- avaliar funcionamento offline como aplicação web instalável;
- aprimorar desempenho e compatibilidade em dispositivos reais;
- auditar e otimizar os modelos 3D quando essa necessidade for confirmada após o MVP;
- avaliar recursos de apoio para famílias, professores e responsáveis.

## Decisões consolidadas

- o conteúdo educacional e a exploração 3D são o núcleo da aplicação;
- a realidade aumentada é uma extensão opcional;
- a aplicação permanece totalmente frontend, sem API ou banco de dados;
- a Vercel é a hospedagem principal e o Docker oferece portabilidade;
- Vue 3 e Vue Router formam a camada de interface;
- Pinia não é necessário enquanto não houver estado global complexo;
- os dados de cada instrumento permanecem em arquivos JSON próprios.
