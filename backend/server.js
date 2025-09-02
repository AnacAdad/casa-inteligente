const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Estado inicial dos dispositivos
let dispositivos = {};
let cenas = {};

// Rota para consultar todos os dispositivos
app.get("/dispositivos", (req, res) => {
  res.json(dispositivos);
});

app.post("/dispositivos", (req, res) => {
  const { nome, status } = req.body;

  if (!nome || !status) {
    return res.status(400).json({ erro: "Nome e status são obrigatórios" });
  }
  if (dispositivos.hasOwnProperty(nome)) {
    return res.status(400).json({ erro: "Dispositivo já existe" });
  }
  dispositivos[nome] = status;
  res.status(201).json({ mensagem: `Dispositivo ${nome} adicionado com status ${status}` });
});

// Rota para alterar status de um dispositivo
// Alterar status de um dispositivo existente
app.post("/dispositivos/:nome", (req, res) => {
  const nome = req.params.nome;
  const { status } = req.body;

  if (!dispositivos.hasOwnProperty(nome)) {
    return res.status(404).json({ erro: "Dispositivo não encontrado" });
  }

  dispositivos[nome] = status;
  res.json({ mensagem: `Dispositivo ${nome} atualizado para ${status}` });
});

// Rota para consultar todas as cenas
app.get("/cenas", (req, res) => {
  res.json(cenas);
});

// Rota para criar cenas add cada dispositivo
app.post("/cenas", (req, res) => {
  const { nome, dispositivosCena } = req.body;

  if (!nome || !dispositivosCena || Object.keys(dispositivosCena).length === 0) {
    return res.status(400).json({ erro: "Nome e dispositivos são obrigatórios" });
  }

  
  // Verifica se todos os dispositivos existem
  let naoEncontrados = [];
  for (const d in dispositivosCena) {
    if (!dispositivos.hasOwnProperty(d)) {
      naoEncontrados.push(d);
    }
  }

  if (naoEncontrados.length > 0) {
    return res.status(404).json({ erro: `Dispositivos não encontrados: ${naoEncontrados.join(", ")}` });
  }

  cenas[nome] = dispositivosCena;
  res.status(201).json({ mensagem: `Cena '${nome}' criada!`, cena: cenas[nome] });
});


/* Criar nova cena (dispositivos são criados automaticamente se não existirem)
app.post("/cenas", (req, res) => {
  const { nome, dispositivosCena } = req.body;

  if (!nome || !dispositivosCena || Object.keys(dispositivosCena).length === 0) {
    return res.status(400).json({ erro: "Nome da cena e dispositivos são obrigatórios." });
  }

  // Cria dispositivos que não existem
  for (const d in dispositivosCena) {
    if (!dispositivos.hasOwnProperty(d)) {
      dispositivos[d] = dispositivosCena[d]; // cria com o status definido na cena
    }
  }

  cenas[nome] = dispositivosCena;
  res.status(201).json({ mensagem: `Cena '${nome}' criada!`, cena: cenas[nome] });
});
*/
//ATIVAR CENAS
app.post("/cenas/:nome/ativar", (req, res) => {
  const nome = req.params.nome;

  if (!cenas[nome]) {
    return res.status(404).json({ erro: `Cena '${nome}' não encontrada.` });
  }

  const dispositivosDaCena = cenas[nome];

  for (const d in dispositivosDaCena) {
    dispositivos[d] = dispositivosDaCena[d]; // atualiza status conforme definido na cena
  }

  res.json({ mensagem: `Cena '${nome}' ativada!`, dispositivos });
});

// DELETAR DISPOSITIVO
app.delete("/dispositivos/:nome", (req, res) => {
  const nome = req.params.nome;

  if (!dispositivos.hasOwnProperty(nome)) {
    return res.status(404).json({ erro: `Dispositivo '${nome}' não encontrado.` });
  }

  delete dispositivos[nome];

  // Também remove o dispositivo de todas as cenas
  for (const cena in cenas) {
    if (cenas[cena].hasOwnProperty(nome)) {
      delete cenas[cena][nome];
    }
  }

  res.json({ mensagem: `Dispositivo '${nome}' deletado com sucesso.` });
});



// Inicia servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});




