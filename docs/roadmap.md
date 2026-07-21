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
12. [x] posicionamento no ambiente habilitado para os nove instrumentos;
13. [x] estados consistentes de preparação, carregamento, falha e nova tentativa no visualizador 3D;
14. [x] RA por cards próprios para os nove instrumentos com o núcleo vendorizado do MindAR;
15. [x] escalas físicas fixas configuradas, incluindo a recalibração de Alaúde, Saltério, Shofar e
    Tamborim após testes iniciais no Android.

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
8. definir o tamanho de impressão e preparar um kit dos nove cards;
9. adicionar validação completa dos JSONs e cobertura automatizada dos fluxos principais;
10. atualizar a documentação sempre que a coleção ou o estado dos ativos mudar.

## Realidade aumentada

Os nove instrumentos estão habilitados para posicionamento no ambiente pelo `<model-viewer>`, com
escala fixa. A Harpa foi normalizada para aproximadamente 1,80 m, e os demais instrumentos possuem
configurações físicas próprias. Testes iniciais no Android levaram à recalibração de Alaúde,
Saltério, Shofar e Tamborim. Ainda é necessária uma rodada sistemática para confirmar dimensões,
orientação, apoio no chão e estabilidade de todos os modelos em Android e iOS.

O rastreamento por imagem também está disponível para os nove instrumentos. Cada um possui arte
própria em `public/ar/<instrumento>` e uma configuração que relaciona o card ao modelo 3D. O núcleo
do MindAR é servido a partir de `public/vendor/mindar/1.2.5`, sem dependência do projeto. Esse modo
funciona com webcam em computadores e câmera em Android e iOS, desde que a aplicação esteja em um
contexto seguro, como `localhost` ou HTTPS.

As artes provisórias foram substituídas, mas a validação manual do reconhecimento, da estabilidade e
do enquadramento dos nove cards ainda está pendente nas três plataformas. Também falta definir um
tamanho físico padronizado e preparar um kit para impressão, pois alterar o tamanho impresso muda a
escala percebida do modelo associado ao card.

Para ampliar a experiência, será necessário:

- confirmar as dimensões físicas dos nove modelos;
- validar posicionamento em Android e iOS compatíveis;
- validar os nove cards em PC, Android e iOS;
- definir o tamanho de impressão e disponibilizar um kit dos cards;
- garantir HTTPS no ambiente publicado para liberar o acesso à câmera;
- preparar os formatos e ativos exigidos por cada plataforma;
- decidir, depois dos testes, se as duas experiências podem ser apresentadas como recursos estáveis.

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
- o `<model-viewer>` atende à RA livre em dispositivos móveis e o MindAR atende ao modo por card;
- o núcleo do MindAR permanece vendorizado como ativo estático, sem dependência do projeto;
- a aplicação permanece totalmente frontend, sem API ou banco de dados;
- a Vercel é a hospedagem principal e o Docker oferece portabilidade;
- Vue 3 e Vue Router formam a camada de interface;
- Pinia não é necessário enquanto não houver estado global complexo;
- os dados de cada instrumento permanecem em arquivos JSON próprios.
