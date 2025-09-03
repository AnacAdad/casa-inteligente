// data.js

// Estrutura para armazenar os dispositivos agrupados por cômodo
// Exemplo:
// {
//   "Sala": [
//      { nome: "Luz", cod_dispositivo: 1, status: false },
//      { nome: "TV", cod_dispositivo: 2, status: true }
//   ],
//   "Quarto": [ ... ]
// }
export const dispositivosPorComodo = {};

// Estrutura para armazenar as cenas cadastradas
// Exemplo:
// {
//   "Cena de Noite": [
//      { comodo: "Sala", dispositivo: "Luz", estado: "Desligado", ordem: 1, intervalo: 0 },
//      { comodo: "Quarto", dispositivo: "Ar-condicionado", estado: "Ligado", ordem: 2, intervalo: 500 }
//   ]
// }
export const cenas = {};

// Estado atual dos dispositivos no front
// Chave: `${comodo}-${dispositivo}`, valor: estado como string (ex: "Ligado", "Desligado", "Aberto", "Fechado")
export const estadoDispositivos = {};

// Classes CSS para estilizar os cômodos na visualização
// Ajuste conforme seu CSS e cômodos existentes
export const comodoClasses = {
  "Sala": "sala-classe",
  "Quarto": "quarto-classe",
  "Cozinha": "cozinha-classe",
  "Banheiro": "banheiro-classe",
  "Área de Lazer": "area-lazer-classe",
  // Adicione mais cômodos conforme necessário
};
