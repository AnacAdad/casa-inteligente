const express = require("express");
const cors = require("cors");
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'casaInteligente',
  password: 'samia',
  port: 5432,
});

// Rota teste
app.get('/', (req, res) => {
  res.send('API de Automação Residencial no ar!');
});

// -- CÔMODOS --
// Listar cômodos
app.get('/comodos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM comodo ORDER BY nome');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar cômodos.' });
  }
});

// Criar cômodo
app.post('/comodos', async (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ erro: 'O nome do cômodo é obrigatório.' });

  try {
    const { rows } = await pool.query('INSERT INTO comodo (nome) VALUES ($1) RETURNING *', [nome]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar cômodo.' });
  }
});

// Deletar cômodo
app.delete("/comodos/:nome", async (req, res) => {
  const { nome } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM comodo WHERE nome = $1", [nome]);
    if (rowCount === 0) return res.status(404).json({ erro: "Cômodo não encontrado." });
    res.json({ mensagem: "Cômodo deletado com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao deletar cômodo." });
  }
});

// Atualizar cômodo
app.put('/comodos/:nome', async (req, res) => {
  const nomeAtual = req.params.nome;
  const { novoNome } = req.body;
  if (!novoNome) return res.status(400).json({ erro: 'O novo nome do cômodo é obrigatório.' });

  try {
    const existe = await pool.query('SELECT cod_comodo FROM comodo WHERE nome = $1', [nomeAtual]);
    if (existe.rowCount === 0) return res.status(404).json({ erro: `Cômodo '${nomeAtual}' não encontrado.` });

    const duplicado = await pool.query('SELECT 1 FROM comodo WHERE nome = $1', [novoNome]);
    if (duplicado.rowCount > 0) return res.status(409).json({ erro: `Cômodo '${novoNome}' já existe.` });

    const { rows } = await pool.query(
      'UPDATE comodo SET nome = $1 WHERE nome = $2 RETURNING *',
      [novoNome, nomeAtual]
    );

    res.json({ mensagem: 'Cômodo atualizado com sucesso.', comodo: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar cômodo.' });
  }
});

// -- DISPOSITIVOS --
// Listar dispositivos (inclui nome do cômodo)
app.get("/dispositivos", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.cod_dispositivo, d.nome, d.status, c.nome as comodo
      FROM dispositivo d
      JOIN comodo c ON d.cod_comodo = c.cod_comodo
      ORDER BY d.nome
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar dispositivos." });
  }
});

// Buscar dispositivo pelo nome e cômodo (query params)
app.get("/dispositivos/detalhe", async (req, res) => {
  const { nome, comodo } = req.query;
  if (!nome || !comodo) {
    return res.status(400).json({ erro: "Parâmetros 'nome' e 'comodo' são obrigatórios." });
  }
  try {
    const { rows } = await pool.query(`
      SELECT d.cod_dispositivo FROM dispositivo d
      JOIN comodo c ON d.cod_comodo = c.cod_comodo
      WHERE d.nome = $1 AND c.nome = $2
      LIMIT 1
    `, [nome, comodo]);

    if (rows.length === 0) return res.status(404).json({ erro: "Dispositivo não encontrado." });

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar dispositivo." });
  }
});

// Criar dispositivo
app.post("/dispositivos", async (req, res) => {
  const { nome, nome_comodo } = req.body;
  const status = req.body.status === undefined ? false : req.body.status;

  if (!nome || !nome_comodo) return res.status(400).json({ erro: "Nome do dispositivo e nome do comodo são obrigatórios." });
  if (typeof status !== 'boolean') return res.status(400).json({ erro: "O campo status deve ser booleano." });

  try {
    const comodoRes = await pool.query('SELECT cod_comodo FROM comodo WHERE nome = $1', [nome_comodo]);
    if (comodoRes.rowCount === 0) return res.status(404).json({ erro: `Cômodo '${nome_comodo}' não encontrado.` });

    const cod_comodo = comodoRes.rows[0].cod_comodo;

    const { rows } = await pool.query(
      "INSERT INTO dispositivo (nome, status, cod_comodo) VALUES ($1, $2, $3) RETURNING *",
      [nome, status, cod_comodo]
    );
    res.status(201).json({ mensagem: `Dispositivo ${nome} adicionado ao cômodo ${nome_comodo}.`, dispositivo: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar dispositivo." });
  }
});

// Atualizar nome do dispositivo
app.put("/dispositivos/:nome", async (req, res) => {
  const nomeAntigo = req.params.nome;
  const { nome: nomeNovo } = req.body;
  if (!nomeNovo) return res.status(400).json({ erro: "Forneça o novo 'nome' para o dispositivo." });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const deviceRes = await client.query('SELECT cod_dispositivo FROM dispositivo WHERE nome = $1', [nomeAntigo]);
    if (deviceRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: "Dispositivo não encontrado." });
    }
    const { cod_dispositivo } = deviceRes.rows[0];

    const updatedDeviceRes = await client.query(
      "UPDATE dispositivo SET nome = $1 WHERE cod_dispositivo = $2 RETURNING *",
      [nomeNovo, cod_dispositivo]
    );

    await client.query('COMMIT');
    res.json({ mensagem: `Dispositivo atualizado com sucesso.`, dispositivo: updatedDeviceRes.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar dispositivo." });
  } finally {
    client.release();
  }
});

// Alterar status do dispositivo
app.patch("/dispositivos/:nome/status", async (req, res) => {
  const { nome } = req.params;
  const { status } = req.body;
  if (typeof status !== "boolean") return res.status(400).json({ erro: "O campo 'status' deve ser true ou false." });

  try {
    const result = await pool.query(
      "UPDATE dispositivo SET status = $1 WHERE nome = $2 RETURNING *",
      [status, nome]
    );

    if (result.rowCount === 0) return res.status(404).json({ erro: "Dispositivo não encontrado." });

    res.json({
      mensagem: `Status do dispositivo '${nome}' atualizado para ${status ? "Ligado/Aberto" : "Desligado/Fechado"}.`,
      dispositivo: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar status do dispositivo." });
  }
});

// Deletar dispositivo
app.delete("/dispositivos/:nome", async (req, res) => {
  const { nome } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const deviceRes = await client.query('SELECT cod_dispositivo FROM dispositivo WHERE nome = $1', [nome]);
    if (deviceRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: "Dispositivo não encontrado." });
    }
    const cod_dispositivo = deviceRes.rows[0].cod_dispositivo;

    const cenaCheckRes = await client.query(`
      SELECT 1 FROM acao_dispositivo ad
      JOIN acao_cena ac ON ad.cod_acao = ac.cod_acao
      WHERE ad.cod_dispositivo = $1 LIMIT 1
    `, [cod_dispositivo]);

    if (cenaCheckRes.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ erro: "Não é possível deletar o dispositivo, pois está vinculado a uma cena." });
    }

    const acoesRes = await client.query('SELECT cod_acao FROM acao_dispositivo WHERE cod_dispositivo = $1', [cod_dispositivo]);
    const codigosAcao = acoesRes.rows.map(r => r.cod_acao);

    await client.query("DELETE FROM dispositivo WHERE cod_dispositivo = $1", [cod_dispositivo]);
    if (codigosAcao.length > 0) {
      await client.query('DELETE FROM acao WHERE cod_acao = ANY($1::int[])', [codigosAcao]);
      await client.query('DELETE FROM acao_dispositivo WHERE cod_acao = ANY($1::int[])', [codigosAcao]);
    }

    await client.query('COMMIT');
    res.json({ mensagem: "Dispositivo deletado com sucesso." });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ erro: "Erro ao deletar dispositivo." });
  } finally {
    client.release();
  }
});


// -- CENAS --
// Listar cenas básicas
app.get("/cenas", async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM cena ORDER BY nome');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar cenas.' });
  }
});

// Listar cenas detalhadas (nome + ações com dispositivos)
// GET /cenas/detalhes - Retorna cenas com suas ações detalhadas
app.get('/cenas/detalhes', async (req, res) => {
  try {
    const cenasRes = await pool.query('SELECT cod_cena, nome FROM cena ORDER BY nome');
    const cenas = cenasRes.rows;

    const cenasComAcoes = [];

    for (const cena of cenas) {
      const acoesRes = await pool.query(`
        SELECT acao_cena.ordem, acao_cena.intervalo, dispositivo.nome AS dispositivo,
               dispositivo.status, comodo.nome AS comodo
        FROM acao_cena
        JOIN acao ON acao_cena.cod_acao = acao.cod_acao
        JOIN acao_dispositivo ON acao_dispositivo.cod_acao = acao.cod_acao
        JOIN dispositivo ON dispositivo.cod_dispositivo = acao_dispositivo.cod_dispositivo
        JOIN comodo ON dispositivo.cod_comodo = comodo.cod_comodo
        WHERE acao_cena.cod_cena = $1
        ORDER BY acao_cena.ordem
      `, [cena.cod_cena]);

      cenasComAcoes.push({
        nome: cena.nome,
        acoes: acoesRes.rows.map(acao => ({
          comodo: acao.comodo,
          dispositivo: acao.dispositivo,
          status: acao.status,
          ordem: acao.ordem,
          intervalo: acao.intervalo
        }))
      });
    }

    res.json(cenasComAcoes);

  } catch (error) {
    console.error('Erro ao buscar cenas detalhadas:', error);
    res.status(500).json({ erro: 'Erro ao buscar cenas detalhadas.' });
  }
});

// Criar cena
app.post("/cenas", async (req, res) => {
  const { nome, acoes } = req.body;
  if (!nome || !acoes || !Array.isArray(acoes) || acoes.length === 0) {
    return res.status(400).json({ erro: "Nome da cena e um array de ações são obrigatórios." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cenaRes = await client.query('INSERT INTO cena (nome) VALUES ($1) RETURNING cod_cena', [nome]);
    const cod_cena = cenaRes.rows[0].cod_cena;

    for (const acaoItem of acoes) {
      const { cod_dispositivo, status, ordem, intervalo } = acaoItem;
      if (cod_dispositivo === undefined || status === undefined || ordem === undefined || intervalo === undefined) {
        throw new Error(`Ação inválida.`);
      }

      const dispRes = await client.query('SELECT nome FROM dispositivo WHERE cod_dispositivo = $1', [cod_dispositivo]);
      if (dispRes.rowCount === 0) throw new Error(`Dispositivo não encontrado.`);

      const nomeDispositivo = dispRes.rows[0].nome;
      const nomeAcao = `${status ? 'Ligar' : 'Desligar'} ${nomeDispositivo}`;

      const acaoRes = await client.query('INSERT INTO acao (acao) VALUES ($1) RETURNING cod_acao', [nomeAcao]);
      const cod_acao = acaoRes.rows[0].cod_acao;

      await client.query('INSERT INTO acao_dispositivo (cod_acao, cod_dispositivo) VALUES ($1, $2)', [cod_acao, cod_dispositivo]);
      await client.query('INSERT INTO acao_cena (cod_cena, cod_acao, ordem, intervalo) VALUES ($1, $2, $3, $4)', [cod_cena, cod_acao, ordem, intervalo]);
    }

    await client.query('COMMIT');
    res.status(201).json({ mensagem: `Cena '${nome}' criada com sucesso!` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ erro: `Erro ao criar cena: ${error.message}` });
  } finally {
    client.release();
  }
});

// Deletar cena
app.delete("/cenas/:nome", async (req, res) => {
  const { nome } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cenaRes = await client.query('SELECT cod_cena FROM cena WHERE nome = $1', [nome]);
    if (cenaRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: "Cena não encontrada." });
    }
    const cod_cena = cenaRes.rows[0].cod_cena;

    const acoesRes = await client.query('SELECT cod_acao FROM acao_cena WHERE cod_cena = $1', [cod_cena]);
    const codigosAcao = acoesRes.rows.map(r => r.cod_acao);

    await client.query('DELETE FROM acao_cena WHERE cod_cena = $1', [cod_cena]);
    await client.query('DELETE FROM cena WHERE cod_cena = $1', [cod_cena]);
    if (codigosAcao.length > 0) {
      await client.query('DELETE FROM acao_dispositivo WHERE cod_acao = ANY($1::int[])', [codigosAcao]);
      await client.query('DELETE FROM acao WHERE cod_acao = ANY($1::int[])', [codigosAcao]);
    }

    await client.query('COMMIT');
    res.json({ mensagem: "Cena deletada com sucesso." });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ erro: "Erro ao deletar cena." });
  } finally {
    client.release();
  }
});

// Atualizar cena (PUT /cenas/:nome) - opcional, pode implementar conforme necessário

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
