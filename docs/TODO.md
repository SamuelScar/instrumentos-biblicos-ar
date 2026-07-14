# TODO

## Estado atual

- [x] Manter a aplicação totalmente frontend, com dados em JSON e ativos estáticos.
- [x] Criar catálogo e páginas individuais em Vue 3 e Vue Router.
- [x] Separar conteúdo, tipos, componentes e estilos.
- [x] Criar arquivos de dados para:
  - [x] Alaúde;
  - [x] Flauta;
  - [x] Harpa;
  - [x] Lira;
  - [x] Saltério;
  - [x] Shofar;
  - [x] Sinos;
  - [x] Tamborim;
  - [x] Trombeta.
- [x] Preencher descrição, referências bíblicas, contextos, ciência do som, curiosidades e fontes.
- [x] Adicionar um modelo GLB para cada instrumento.
- [x] Padronizar modelos como `public/models/<instrumento>/<instrumento>.glb`.
- [x] Permitir rotação e zoom dos modelos.
- [x] Implementar temas do sistema, claro e escuro.
- [x] Criar layout responsivo do catálogo e páginas internas.
- [x] Adicionar ordenação ao catálogo.
- [x] Adicionar retorno flutuante ao topo em páginas longas.
- [x] Preparar execução local, Docker, Nginx e deploy estático na Vercel.

## Próxima entrega: consolidação do catálogo 3D

- [ ] Validar todos os campos dos JSONs com um esquema de dados, além das verificações atuais de id e RA.
- [ ] Auditar peso, quantidade de polígonos e resolução das texturas dos nove modelos.
- [ ] Otimizar primeiro os modelos acima de 10 MiB:
  - [ ] Trombeta, aproximadamente 14,6 MiB;
  - [ ] Saltério, aproximadamente 13,6 MiB;
  - [ ] Shofar, aproximadamente 12,1 MiB.
- [ ] Avaliar também a Flauta, aproximadamente 6,9 MiB, em aparelhos mais simples.
- [ ] Confirmar enquadramento, orientação, materiais e controles de cada modelo.
- [ ] Validar tempo de carregamento e consumo de memória em celulares.
- [ ] Definir um estado visual consistente para carregamento e falha dos modelos.
- [ ] Gerar uma imagem de capa ou pôster para cada instrumento.
- [x] Exibir capas no catálogo quando `coverImageUrl` estiver preenchido.
- [x] Usar a capa como pôster do visualizador quando estiver disponível.

## Revisão editorial e procedência

- [ ] Revisar referências bíblicas, afirmações históricas e explicações científicas dos nove instrumentos.
- [ ] Abrir e verificar todas as URLs registradas como fontes.
- [ ] Padronizar transliterações e o modo de apresentar termos hebraicos, aramaicos e gregos.
- [ ] Evitar que modelos comparativos sejam apresentados como reconstruções comprovadas.
- [ ] Registrar para cada modelo sua origem, autoria, URL, licença e alterações realizadas.
- [ ] Revisar a atribuição dos ativos antes da publicação definitiva.
- [ ] Deixar explícito quando um ativo de terceiro possuir termos diferentes da licença do projeto.

## Áudio e conteúdo complementar

- [ ] Definir critérios para escolher gravações demonstrativas historicamente cuidadosas.
- [ ] Adicionar um áudio demonstrativo para cada instrumento quando houver material adequado.
- [x] Exibir o reprodutor somente quando `audioUrl` estiver preenchido.
- [ ] Avaliar pequenas atividades ou perguntas educativas para cada instrumento.

## Design, acessibilidade e dispositivos

- [ ] Validar contraste nos temas claro e escuro.
- [ ] Percorrer todo o fluxo usando somente teclado.
- [ ] Verificar rótulos e leitura por tecnologia assistiva.
- [ ] Validar catálogo, páginas internas e visualizador em celular, tablet, notebook e tela ampla.
- [ ] Testar o visualizador 3D em navegadores reais com diferentes capacidades gráficas.
- [ ] Revisar o acesso às ferramentas técnicas para decidir se devem permanecer visíveis ao público.

## Realidade aumentada: etapa futura

- [ ] Retomar **Ver no meu espaço** depois que a experiência 3D estiver consolidada.
- [ ] Definir dimensões e escala física de cada modelo.
- [ ] Validar posicionamento em aparelhos Android compatíveis.
- [ ] Preparar os ativos necessários e validar a experiência em iOS compatível.
- [ ] Criar mensagens para dispositivos sem suporte.
- [ ] Reavaliar o MindAR somente para atividades com cartões ou materiais impressos.
- [ ] Remover `targets.mind` caso o rastreamento por imagem seja definitivamente descartado.

## Evoluções sem prioridade atual

- [ ] Avaliar funcionamento offline como PWA.
- [ ] Avaliar atividades conduzidas por professores ou responsáveis.
- [ ] Considerar busca e filtros quando o catálogo crescer além da coleção atual.
