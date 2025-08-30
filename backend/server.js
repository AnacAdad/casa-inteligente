const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Estado inicial dos dispositivos
let dispositivos = {
  arcondicionado: "desligado",
  tv: "desligada",
  luz: "apagada",
  som: "desligado"
};

// Rota para consultar todos os dispositivos
app.get("/dispositivos", (req, res) => {
  res.json(dispositivos);
});

// Rota para alterar status de um dispositivo
app.post("/dispositivos/:nome", (req, res) => {
  const nome = req.params.nome;
  const { status } = req.body;

  if (dispositivos.hasOwnProperty(nome)) {
    dispositivos[nome] = status;
    res.json({ mensagem: `Dispositivo ${nome} atualizado para ${status}` });
  } else {
    res.status(404).json({ erro: "Dispositivo não encontrado" });
  }
});

// Inicia servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});




