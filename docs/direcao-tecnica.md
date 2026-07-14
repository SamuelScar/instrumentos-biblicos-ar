# Direção técnica

## Base da aplicação

- **Vue 3:** camada declarativa de componentes e ciclo de vida da interface.
- **Vue Router:** navegação da SPA e identificação do instrumento pela URL.
- **TypeScript e Vite:** tipagem, servidor de desenvolvimento e build estático.
- **HTML e CSS:** interface leve, priorizando celulares e acessibilidade.
- **Dados estruturados:** centralizar textos, referências, curiosidades e caminhos dos arquivos de cada instrumento em uma estrutura de domínio.

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

A evolução prevista possui duas experiências diferentes:

1. **Posicionamento no ambiente:** iniciado pelo `<model-viewer>`, usando os recursos disponíveis em cada plataforma, sem implementar WebXR manualmente na primeira versão.
2. **Rastreamento de imagem:** reavaliar o MindAR em uma etapa futura baseada em cartões, páginas ou pôsteres impressos.

O protótipo de `World Tracking`, que não fazia rastreamento espacial real, foi removido. O posicionamento no ambiente fica sob responsabilidade do `<model-viewer>`.

O MindAR também foi retirado do build ativo. O arquivo de marcadores foi preservado como ativo legado, mas a dependência só deverá voltar quando a experiência com materiais impressos for retomada e sua compatibilidade com as bibliotecas atuais for definida.

## Organização do código

```text
src/
├── components/      # componentes visuais reutilizáveis
├── composables/     # lógica de interface com ciclo de vida
├── domain/          # dados estruturados dos instrumentos
├── views/           # páginas associadas às rotas
├── ui/              # estilos compartilhados
├── App.vue          # raiz da aplicação
├── main.ts          # inicialização do Vue
└── router.ts        # definição das rotas
```

O instrumento é identificado na URL, como `/instrumentos/harpa`. Isso permite atualização da página e compartilhamento de links sem estado global.

O diagnóstico da câmera usa um composable. Recursos de navegador devem ser adquiridos e liberados dentro do ciclo de vida Vue, especialmente câmera, áudio e futuras sessões de realidade aumentada.

## Modelos e mídia

Os modelos deverão ser preparados para uso web, com atenção ao tamanho do arquivo, quantidade de polígonos e resolução das texturas.

Os arquivos públicos poderão ser organizados por tipo:

```text
public/
├── models/
├── images/
├── audio/
└── targets/
```

Os dados de domínio deverão relacionar cada instrumento aos seus arquivos e conteúdos, evitando caminhos e textos espalhados pelas telas.

## Backend

A aplicação não possui backend. Textos e configurações ficam no domínio TypeScript, enquanto modelos, imagens, áudios e marcadores são arquivos estáticos.

O build gerado pelo Vite pode ser publicado na Vercel ou servido pela imagem Docker sem alterar o código da aplicação.
