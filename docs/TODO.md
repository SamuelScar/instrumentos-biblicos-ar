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
- [x] Adicionar demonstrações sonoras em MP3 para os nove instrumentos.
- [x] Criar um player de áudio próprio e integrado aos temas.
- [x] Implementar temas do sistema, claro e escuro.
- [x] Criar layout responsivo do catálogo e páginas internas.
- [x] Adicionar ordenação ao catálogo.
- [x] Adicionar retorno flutuante ao topo em páginas longas.
- [x] Preparar execução local, Docker, Nginx e deploy estático na Vercel.

## Próxima entrega: conclusão do MVP

- [ ] Validar todos os campos dos JSONs com um esquema de dados, além das verificações atuais de id e RA.
- [ ] Confirmar enquadramento, orientação, materiais e controles de cada modelo.
- [x] Definir um estado visual consistente para carregamento e falha dos modelos.
- [x] Gerar uma imagem de capa ou pôster para cada instrumento.
- [x] Exibir capas no catálogo quando `coverImageUrl` estiver preenchido.
- [x] Usar a capa como pôster do visualizador quando estiver disponível.
- [ ] Revisar visualmente as nove páginas com capa, modelo, conteúdo e áudio.
- [ ] Validar o fluxo principal em celulares e computadores reais.

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
- [x] Adicionar um áudio demonstrativo para cada instrumento.
- [x] Exibir o reprodutor somente quando `audioUrl` estiver preenchido.
- [ ] Registrar origem, autoria e licença de cada áudio.
- [ ] Revisar se cada gravação demonstra adequadamente o instrumento apresentado.
- [ ] Avaliar compressão dos arquivos de áudio mais pesados para uso na web.
- [ ] Avaliar pequenas atividades ou perguntas educativas para cada instrumento.

## Design, acessibilidade e dispositivos

- [ ] Validar contraste nos temas claro e escuro.
- [ ] Percorrer todo o fluxo usando somente teclado.
- [ ] Verificar rótulos e leitura por tecnologia assistiva.
- [ ] Validar catálogo, páginas internas e visualizador em celular, tablet, notebook e tela ampla.
- [ ] Testar o visualizador 3D em navegadores reais com diferentes capacidades gráficas.
- [x] Manter o diagnóstico acessível por rota direta e ocultar seu atalho no catálogo público.

## Realidade aumentada: MVP e expansão

- [x] Retomar **Ver no meu espaço** com a Harpa como instrumento-piloto do MVP.
- [x] Preparar o piloto de RA por card da Harpa com rastreamento de imagem pelo MindAR.
- [x] Integrar o botão **Usar card com a câmera** e os estados de preparação, busca, reconhecimento
  e falha.
- [x] Permitir a escolha da câmera quando o dispositivo disponibilizar mais de uma opção.
- [x] Manter o núcleo necessário do MindAR como ativo estático vendorizado, sem dependência npm.
- [x] Organizar a imagem-alvo e o arquivo compilado do piloto em `public/ar/harpa`.
- [ ] Definir dimensões e escala física de cada modelo:
  - [x] Harpa normalizada para aproximadamente 1,80 m, centralizada, apoiada no chão e
    com escala fixa durante o piloto;
  - [ ] demais instrumentos.
- [ ] Validar posicionamento em aparelhos Android compatíveis.
- [ ] Validar a geração automática do USDZ em iOS e criar um arquivo dedicado somente se necessário.
- [x] Criar orientação para localização do chão e mensagem para falha ao iniciar a RA.
- [x] Orientar o usuário quando o rastreamento do ambiente for interrompido no WebXR.
- [ ] Validar manualmente o rastreamento do card da Harpa com webcam em computador.
- [ ] Validar manualmente o rastreamento do card da Harpa em Android e iOS.
- [ ] Confirmar o acesso à câmera em produção por HTTPS e documentar as limitações de acesso local
  pelo celular fora de um contexto seguro.
- [ ] Substituir o card provisório do PS Vita por uma arte própria antes da publicação.
- [ ] Habilitar **Ver no meu espaço** nos demais instrumentos depois de normalizar suas escalas.
- [ ] Expandir o rastreamento por imagem para outros instrumentos somente depois de validar o fluxo
  completo com a Harpa.

## Evoluções sem prioridade atual

- [ ] Auditar peso, quantidade de polígonos e resolução das texturas dos nove modelos.
- [ ] Otimizar os modelos 3D quando o desempenho se tornar uma prioridade.
- [ ] Avaliar tempo de carregamento e consumo de memória em aparelhos mais simples.
- [ ] Avaliar funcionamento offline como PWA.
- [ ] Avaliar atividades conduzidas por professores ou responsáveis.
- [ ] Considerar busca e filtros quando o catálogo crescer além da coleção atual.
