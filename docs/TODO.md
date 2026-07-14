# TODO

## Prioridade atual: revisão de conteúdo e ativos

- [x] Criar uma estrutura de dados separada do código da interface.
- [x] Criar um arquivo de dados para cada instrumento:
  - [x] Shofar;
  - [x] Harpa;
  - [x] Tamborim.
- [x] Manter no TypeScript apenas os tipos e as funções usadas para consultar os dados.
- [x] Definir para todos os instrumentos os seguintes campos:
  - [x] identificador e nome;
  - [x] descrição curta em linguagem infantil;
  - [x] referências bíblicas;
  - [x] contexto bíblico;
  - [x] contexto histórico;
  - [x] explicação científica sobre a produção do som;
  - [x] curiosidades em linguagem infantil;
  - [x] caminho do modelo 3D;
  - [x] caminho da imagem de capa;
  - [x] caminho do áudio demonstrativo;
  - [x] fontes consultadas.
- [x] Produzir o conteúdo bíblico, histórico e científico do Shofar.
- [x] Produzir o conteúdo bíblico, histórico e científico da Harpa.
- [x] Produzir o conteúdo bíblico, histórico e científico do Tamborim.
- [ ] Revisar as referências, as afirmações e as fontes do Shofar.
- [ ] Revisar as referências, as afirmações e as fontes da Harpa.
- [ ] Revisar as referências, as afirmações e as fontes do Tamborim.
- [x] Adicionar curiosidades infantis para os três instrumentos.
- [x] Atualizar os componentes Vue para consumir somente a nova estrutura de dados.

## Ativos visuais e sonoros

- [ ] Adicionar uma imagem de capa para a Harpa.
- [ ] Adicionar uma imagem de capa para o Shofar.
- [ ] Adicionar uma imagem de capa para o Tamborim.
- [ ] Adicionar um áudio demonstrativo da Harpa.
- [ ] Adicionar um áudio demonstrativo do Shofar.
- [ ] Adicionar um áudio demonstrativo do Tamborim.
- [ ] Exibir as imagens de capa no catálogo e na página do instrumento.
- [x] Exibir o reprodutor de áudio somente quando o arquivo estiver disponível.

## Design e temas

- [x] Criar tokens semânticos para cores, superfícies, bordas e sombras.
- [x] Implementar as preferências de tema do sistema, claro e escuro.
- [x] Salvar a preferência de tema no navegador.
- [x] Criar um cabeçalho compartilhado com o seletor de tema.
- [x] Tornar a grade do catálogo fluida.
- [x] Reorganizar a página do instrumento para separar exploração e leitura.
- [x] Exibir curiosidades e fontes na página do instrumento.
- [x] Respeitar a preferência por movimentos reduzidos.
- [x] Adicionar uma ilustração própria ao hero do catálogo.
- [x] Configurar o favicon da aplicação.
- [ ] Validar contraste e navegação por teclado nos dois temas.
- [ ] Validar o layout em diferentes tamanhos de tela.

## Experiência 3D

- [x] Adicionar o modelo 3D da Harpa.
- [x] Permitir rotação e zoom no modelo 3D.
- [ ] Encontrar e adicionar um modelo 3D do Shofar.
- [ ] Encontrar e adicionar um modelo 3D do Tamborim.
- [ ] Otimizar os modelos para carregamento em celulares quando necessário.
- [ ] Padronizar nomes, pastas e formato GLB dos modelos publicados.
- [ ] Confirmar visualmente o enquadramento e a orientação de cada modelo.
- [ ] Validar a interface 3D em telas menores e celulares.

> A adequação histórica dos modelos será verificada durante a escolha de cada arquivo antes de ele ser adicionado ao projeto.

## Realidade aumentada: etapa futura

- [ ] Retomar a experiência **Ver no meu espaço** depois que a experiência 3D estiver completa.
- [ ] Ajustar a escala física de cada modelo para uso em realidade aumentada.
- [ ] Validar o posicionamento dos modelos no ambiente.
- [ ] Testar a experiência em aparelhos Android compatíveis.
- [ ] Testar a experiência em aparelhos iOS compatíveis.
- [ ] Definir mensagens de indisponibilidade para aparelhos sem suporte.
- [ ] Reavaliar o MindAR para atividades com cartões ou materiais impressos.

## Pendências sem prioridade atual

- [ ] Registrar origem, autoria e licença dos modelos antes da publicação definitiva.
- [ ] Revisar acessibilidade da interface.
- [ ] Avaliar funcionamento offline como PWA.
- [ ] Avaliar atividades educacionais conduzidas por professores ou responsáveis.
