# Direção técnica

## Base da aplicação

- **Vue 3:** camada declarativa de componentes e ciclo de vida da interface.
- **Vue Router:** navegação da SPA e identificação do instrumento pela URL.
- **TypeScript e Vite:** tipagem, servidor de desenvolvimento e build estático.
- **HTML e CSS:** interface leve, priorizando celulares e acessibilidade.
- **Lucide:** ícones usados nos controles de tema.
- **Dados estruturados:** manter textos, referências, curiosidades, fontes e caminhos dos arquivos em um JSON próprio para cada instrumento.

Vue substitui a criação manual de elementos, listeners e rotas. A aplicação continua sendo compilada para arquivos estáticos e não depende de renderização no servidor.

Pinia não é necessário nesta fase. Parâmetros de rota, propriedades de componentes, estado local e composables atendem ao fluxo atual. Um gerenciador global só deverá ser considerado quando existir estado realmente compartilhado entre várias áreas.

## Visualização 3D

O componente **`<model-viewer>`** é usado como primeira opção para:

- carregar modelos no formato GLB/glTF;
- permitir rotação e zoom;
- apresentar animações e pontos de informação;
- oferecer uma experiência funcional mesmo sem acesso à câmera;
- disponibilizar a entrada para realidade aumentada em dispositivos compatíveis.

O Three.js permanece como dependência do `<model-viewer>`. Seu uso direto deve ocorrer apenas quando houver necessidade de uma experiência personalizada que o componente não atenda.

## Realidade aumentada

A aplicação mantém duas experiências complementares:

1. **Posicionamento no ambiente:** iniciado pelo `<model-viewer>`, usando os recursos disponíveis em cada plataforma, sem implementar WebXR manualmente na primeira versão.
2. **Rastreamento de imagem:** iniciado a partir de um card, com o núcleo do MindAR e uma cena Three.js própria para associar o modelo 3D à imagem reconhecida.

O protótipo de `World Tracking`, que não fazia rastreamento espacial real, foi removido. O posicionamento no ambiente fica sob responsabilidade do `<model-viewer>`.

O rastreamento por imagem está configurado para os nove instrumentos. As artes e os arquivos de
alvo ficam organizados em `public/ar/<instrumento>`, enquanto o núcleo do MindAR necessário em tempo
de execução é mantido como ativo estático em
`public/vendor/mindar/1.2.5`, sem adicionar o pacote como dependência npm. Isso evita trazer para o
build dependências nativas usadas pelas ferramentas de compilação do MindAR e preserva a versão
avaliada pelo projeto.

O modo por card pode usar webcam em computadores e a câmera traseira em Android e iOS. O acesso à
câmera exige um contexto seguro: `localhost` funciona durante o desenvolvimento no próprio
computador e a publicação deve usar HTTPS. O acesso pelo celular a um endereço HTTP da rede local
pode ser bloqueado pelo navegador mesmo que a página abra normalmente.

### RA do MVP

Os nove instrumentos estão habilitados para posicionamento no ambiente. A Harpa foi normalizada
para aproximadamente 1,80 m de altura, com centro horizontal na origem e base em `Y=0`. Os demais
modelos possuem configurações próprias, e Alaúde, Saltério, Shofar e Tamborim foram recalibrados
depois dos primeiros testes no Android. A opção `ar-scale="fixed"` preserva a escala física definida
e impede que o redimensionamento do usuário esconda problemas de normalização.

Durante uma sessão WebXR, a interface orienta o usuário a mover o celular até localizar o chão. O
evento `ar-status` também é observado para apresentar uma mensagem quando a RA não pode ser
iniciada, e `ar-tracking` orienta o usuário quando o reconhecimento do ambiente é interrompido.
Android pode usar WebXR ou Scene Viewer, enquanto o Quick Look do iOS pode receber o USDZ gerado
automaticamente pelo `<model-viewer>` nesta primeira versão. O funcionamento e a escala ainda devem
ser validados sistematicamente em aparelhos Android e iOS reais.

Na página de cada instrumento, **Com card** abre uma experiência em tela cheia com instruções,
permissão explícita, escolha entre câmeras disponíveis, estados de busca e reconhecimento,
interação para girar o modelo e liberação dos recursos de câmera e WebGL ao fechar. Os nove cards
usam artes próprias. Ainda é necessário validar o reconhecimento nas três plataformas e definir um
tamanho padronizado para impressão, acompanhado por um PDF ou kit para download.

## Organização do código

```text
src/
├── components/      # componentes visuais reutilizáveis
├── composables/     # lógica de interface com ciclo de vida
├── data/            # conteúdo e configuração de cada instrumento em JSON
├── domain/          # tipos, validação e funções de consulta dos dados
├── views/           # páginas associadas às rotas
├── ui/              # estilos compartilhados
├── App.vue          # raiz da aplicação
├── main.ts          # inicialização do Vue
└── router.ts        # definição das rotas
```

O instrumento é identificado na URL, como `/instrumentos/harpa`. Isso permite atualização da página e compartilhamento de links sem estado global.

O diagnóstico da câmera usa um composable. Recursos de navegador devem ser adquiridos e liberados dentro do ciclo de vida Vue, especialmente câmera, áudio e futuras sessões de realidade aumentada.

A rota `/diagnostico` permanece disponível para suporte durante o desenvolvimento e em previews da
Vercel, mas seu atalho aparece no catálogo somente em modo de desenvolvimento. Assim, os dados
técnicos e logs não fazem parte da navegação pública do MVP. Depois que a permissão é concedida, o
diagnóstico também permite escolher entre as câmeras enumeradas pelo navegador e trocar o fluxo
ativo sem recarregar a página.

## Modelos e mídia

Os modelos deverão ser preparados para uso web, com atenção ao tamanho do arquivo, quantidade de polígonos e resolução das texturas.

Os modelos publicados seguem a convenção `public/models/<instrumento>/<instrumento>.glb`. Cada
JSON aponta para seu arquivo por meio de `assets.modelUrl`. O catálogo possui atualmente modelos
para Alaúde, Flauta, Harpa, Lira, Saltério, Shofar, Sinos, Tamborim e Trombeta.

Os arquivos públicos poderão ser organizados por tipo:

```text
public/
├── favicon.ico
├── ar/
│   └── <instrumento>/  # imagem do card e alvo compilado
├── models/
├── images/
├── audio/
└── vendor/
    └── mindar/1.2.5/ # núcleo estático usado pelo rastreamento de imagem
```

Os dados de cada instrumento relacionam seus arquivos e conteúdos, evitando caminhos e textos espalhados pelas telas. O TypeScript fica responsável apenas pelos tipos, pela validação básica dos JSONs e pelas funções de consulta.

Imagens compartilhadas pela interface, como a ilustração do catálogo, ficam em `public/images`.
As capas seguem a convenção `public/images/instruments/<instrumento>.png` e são associadas pelo
campo `assets.coverImageUrl` do respectivo JSON. Elas aparecem nos cards do catálogo e também são
usadas como pôster enquanto o modelo 3D ainda não foi apresentado.

O visualizador mantém estados explícitos de preparação, carregamento, sucesso e falha. A capa é
usada apenas como pôster durante o carregamento, sem permanecer atrás do modelo 3D. Em caso de erro,
a interface oferece uma nova tentativa, recriando o elemento responsável pelo modelo sem recarregar
a página inteira.

Os áudios seguem a convenção `public/audio/<instrumento>/<instrumento>.mp3` e são associados pelo
campo `assets.audioUrl`. O player visual fica isolado em um componente Vue, enquanto o elemento
HTML de áudio permanece responsável por carregamento e reprodução no navegador.

## Backend

A aplicação não possui backend. Textos e configurações ficam nos arquivos JSON em `src/data/instruments`, enquanto modelos, imagens, áudios e marcadores são arquivos estáticos.

O build gerado pelo Vite pode ser publicado na Vercel ou servido pela imagem Docker sem alterar o código da aplicação.
