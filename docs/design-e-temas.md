# Design e temas

## Direção visual

A interface mantém uma identidade quente inspirada em madeira, pergaminho e instrumentos antigos, sem tentar reproduzir visualmente um documento histórico. A apresentação deve permanecer contemporânea, legível e adequada ao conteúdo educacional.

O layout não possui versões separadas por dispositivo. Grades fluidas, larguras máximas de leitura, tipografia responsiva e poucos pontos de quebra permitem que o conteúdo se reorganize conforme o espaço disponível.

## Organização das telas

O cabeçalho é compartilhado por toda a aplicação e reúne o nome do projeto, a navegação principal e a preferência de tema. Para evitar competição entre elementos, a marca textual aparece sem um ícone ao lado.

O catálogo possui uma ilustração própria com Shofar, lira e tambor de moldura. Essa arte apresenta visualmente o tema do projeto, enquanto o favicon permanece um ativo menor e independente.

Cada instrumento possui uma capa própria com a mesma direção visual em tons de madeira, âmbar e
dourado. Essas imagens substituem as letras provisórias nos cards e funcionam como pôsteres dos
visualizadores 3D.

No catálogo, os cards usam uma grade flexível que varia de uma coluna no celular até cinco colunas
em telas grandes. A largura ampliada de até 1500 pixels é exclusiva do catálogo; páginas de leitura
mantêm uma medida menor. Linhas incompletas ficam centralizadas e todo o card funciona como link
para evitar ações pequenas ou ambíguas.

O catálogo permite manter a ordem sugerida ou ordenar os instrumentos por nome, quantidade de
referências bíblicas e quantidade de fontes. Em páginas longas, um botão flutuante discreto aparece
depois da rolagem para permitir o retorno ao topo.

Na página de um instrumento, o conteúdo está dividido em quatro áreas:

1. apresentação e descrição;
2. experiência 3D acompanhada de referências e orientações rápidas;
3. conteúdo bíblico, histórico e científico;
4. curiosidades e fontes consultadas.

Os textos longos não ficam presos à coluna lateral do modelo. Em espaços menores, as áreas seguem a mesma ordem e ocupam a largura disponível.

Quando o dispositivo oferece suporte, o visualizador apresenta ações centralizadas para abrir o
instrumento no ambiente, iniciar o modo por card e reproduzir o áudio. O modo por card ocupa a tela
inteira, exibe a arte que deve ser reconhecida e orienta a escolha da câmera, o enquadramento e a
interação com o modelo.

## Temas

A preferência inicial é `system`, que acompanha o tema claro ou escuro do dispositivo. O usuário também pode escolher explicitamente `light` ou `dark` pelo cabeçalho.

A escolha é feita por um menu compacto com ícones da biblioteca Lucide, armazenada no navegador e aplicada pelo atributo `data-theme` do elemento HTML. Quando a preferência é `system`, mudanças feitas no sistema operacional são refletidas enquanto a aplicação está aberta.

As cores dos componentes são baseadas em tokens semânticos, como:

- plano de fundo;
- superfícies;
- texto principal e secundário;
- cor primária e destaque;
- bordas;
- foco;
- fundo do visualizador 3D;
- sombras.

O tema escuro utiliza marrons profundos em vez de preto puro para preservar a identidade visual da aplicação.

## Acessibilidade e movimento

Controles interativos possuem áreas mínimas adequadas para toque e indicadores de foco visíveis. A interface respeita `prefers-reduced-motion`, reduzindo transições para pessoas que configuraram essa preferência no dispositivo.

Contraste, navegação por teclado, comportamento do visualizador 3D e leitura em celulares ainda devem passar por validação manual antes da publicação.
