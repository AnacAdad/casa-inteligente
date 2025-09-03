import { dispositivosPorComodo, cenas, estadoDispositivos, comodoClasses } from './data.js';

const casaDiv = document.querySelector('.casa');
const adicionarBtn = document.getElementById('adicionar-btn');
const acoesContainer = document.getElementById('acoes-container');
const addAcaoBtn = document.getElementById('add-acao-btn');
const salvarCenaBtn = document.getElementById('salvar-cena-btn');
const cenaNomeInput = document.getElementById('cena-nome');
const dispositivosPorComodoModal = document.getElementById('dispositivos-por-comodo');
const conteudoDispositivos = document.getElementById('conteudo-dispositivos');
const fecharDispositivosBtn = document.getElementById('fechar-dispositivos');
const addComodoInput = document.getElementById('add-comodo-nome');
const adicionarComodoBtn = document.getElementById('adicionar-comodo-btn');
const removerComodoSelect = document.getElementById('remover-comodo-select');
const removerComodoBtn = document.getElementById('remover-comodo-btn');
const editarComodoSelect = document.getElementById('editar-comodo-select');
const novoNomeComodoInput = document.getElementById('novo-nome-comodo');
const editarComodoBtn = document.getElementById('editar-comodo-btn');

async function carregarDadosDoServidor() {
    try {
        // Carregar dispositivos
        const dispositivosRes = await fetch('http://localhost:3000/dispositivos');
        const dispositivosData = await dispositivosRes.json();

        // Limpa os dados atuais para evitar duplicatas
        for (const comodo in dispositivosPorComodo) {
            dispositivosPorComodo[comodo] = [];
        }
        for (const key in estadoDispositivos) {
            delete estadoDispositivos[key];
        }

        dispositivosData.forEach(d => {
            if (!dispositivosPorComodo[d.comodo]) {
                dispositivosPorComodo[d.comodo] = [];
            }

            const dispositivoObj = {
                nome: d.nome,
                cod_dispositivo: d.cod_dispositivo,
                status: d.status
            };

            dispositivosPorComodo[d.comodo].push(dispositivoObj);

            estadoDispositivos[`${d.comodo}-${d.nome}`] = d.status
                ? (d.nome === 'Cortina' ? 'Aberto' : 'Ligado')
                : (d.nome === 'Cortina' ? 'Fechado' : 'Desligado');
        });

        // Carregar cenas com detalhes
        const cenasRes = await fetch('http://localhost:3000/cenas/detalhes');
        const cenasData = await cenasRes.json();

        // Limpa cenas atuais
        for (const k in cenas) delete cenas[k];

        cenasData.forEach(cena => {
            const nomeCena = cena.nome;
            if (!cenas[nomeCena]) cenas[nomeCena] = [];

            cena.acoes.forEach(acao => {
                cenas[nomeCena].push({
                    comodo: acao.comodo,
                    dispositivo: acao.dispositivo,
                    estado: acao.status
                        ? (acao.dispositivo === 'Cortina' ? 'Aberto' : 'Ligado')
                        : (acao.dispositivo === 'Cortina' ? 'Fechado' : 'Desligado'),
                    ordem: acao.ordem,
                    intervalo: acao.intervalo
                });
            });
        });

    } catch (err) {
        console.error("Erro ao carregar dados do servidor:", err);
        alert("Erro ao carregar dados do servidor.");
    }
}

function renderizarCasa() {
    casaDiv.innerHTML = '';
    for (const comodo in dispositivosPorComodo) {
        const comodoDiv = document.createElement('div');
        comodoDiv.classList.add('comodo');
        if (comodoClasses[comodo]) {
            comodoDiv.classList.add(comodoClasses[comodo]);
        }
        comodoDiv.setAttribute('data-comodo', comodo);
        comodoDiv.innerHTML = `<span>${comodo}</span>`;

        comodoDiv.addEventListener('click', () => {
            renderizarDispositivosPorComodo(comodo);
        });
        casaDiv.appendChild(comodoDiv);
    }
}

// Função para aplicar cor aleatória no hover dos cômodos
function aplicarCorAleatoriaHover() {
    document.querySelectorAll('.comodo').forEach(comodoDiv => {
        // Salva cor original para restaurar depois
        const corOriginal = getComputedStyle(comodoDiv).backgroundColor;

        comodoDiv.addEventListener('mouseenter', () => {
            const corAleatoria = `hsl(${Math.floor(Math.random() * 360)}, 70%, 70%)`;
            comodoDiv.style.backgroundColor = corAleatoria;
            comodoDiv.style.color = 'white';
        });

        comodoDiv.addEventListener('mouseleave', () => {
            comodoDiv.style.backgroundColor = corOriginal;
            comodoDiv.style.color = '';
        });
    });
}

function renderizarDispositivosPorComodo(comodo) {
    conteudoDispositivos.innerHTML = `<h3>${comodo}</h3>`;
    const dispositivosDoComodo = dispositivosPorComodo[comodo];
    if (dispositivosDoComodo && dispositivosDoComodo.length > 0) {
        dispositivosDoComodo.forEach(dispositivoObj => {
            const dispositivo = dispositivoObj.nome;
            const dispositivoItem = document.createElement('div');
            dispositivoItem.classList.add('dispositivo-item');
            dispositivoItem.innerHTML = `<span>${dispositivo}</span>`;

            const botoesDiv = document.createElement('div');
            botoesDiv.classList.add('controles');

            const toggleButton = document.createElement('button');
            const estado = estadoDispositivos[`${comodo}-${dispositivo}`] || (dispositivo === 'Cortina' ? 'Fechado' : 'Desligado');
            toggleButton.textContent = estado;

            if (dispositivo === 'Cortina') {
                toggleButton.classList.add(estado === 'Aberto' ? 'aberto' : 'fechado');
            } else {
                toggleButton.classList.add(estado === 'Ligado' ? 'ligado' : 'desligado');
            }

            toggleButton.addEventListener('click', () => toggleDispositivo(comodo, dispositivo));
            botoesDiv.appendChild(toggleButton);

            const editarDispositivoBtn = document.createElement('button');
            editarDispositivoBtn.textContent = 'Editar';
            editarDispositivoBtn.classList.add('editar-dispositivo-btn');
            editarDispositivoBtn.addEventListener('click', () => editarDispositivo(comodo, dispositivo));
            botoesDiv.appendChild(editarDispositivoBtn);

            const removerButton = document.createElement('button');
            removerButton.textContent = 'Remover';
            removerButton.classList.add('remover');
            removerButton.addEventListener('click', () => removerDispositivo(comodo, dispositivo));
            botoesDiv.appendChild(removerButton);

            dispositivoItem.appendChild(botoesDiv);
            conteudoDispositivos.appendChild(dispositivoItem);
        });
    } else {
        conteudoDispositivos.innerHTML += `<p>Nenhum dispositivo neste cômodo.</p>`;
    }
    dispositivosPorComodoModal.style.display = 'block';
}

async function toggleDispositivo(comodo, dispositivo) {
    const estadoAtual = estadoDispositivos[`${comodo}-${dispositivo}`] ||
        (dispositivo === "Cortina" ? "Fechado" : "Desligado");

    let novoEstadoTexto;
    let novoStatusBoolean;

    if (dispositivo === "Cortina") {
        novoEstadoTexto = estadoAtual === "Aberto" ? "Fechado" : "Aberto";
        novoStatusBoolean = novoEstadoTexto === "Aberto";
    } else {
        novoEstadoTexto = estadoAtual === "Ligado" ? "Desligado" : "Ligado";
        novoStatusBoolean = novoEstadoTexto === "Ligado";
    }

    try {
        const res = await fetch(`http://localhost:3000/dispositivos/${encodeURIComponent(dispositivo)}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: novoStatusBoolean })
        });

        if (!res.ok) {
            const erro = await res.json();
            throw new Error(erro.erro || "Erro ao atualizar status.");
        }

        const data = await res.json();
        console.log("Servidor:", data.mensagem);

        estadoDispositivos[`${comodo}-${dispositivo}`] = novoEstadoTexto;
        renderizarDispositivosPorComodo(comodo);

    } catch (err) {
        console.error("Erro:", err);
        alert("Erro ao atualizar status: " + err.message);
    }
}

async function editarDispositivo(comodo, dispositivoAtual) {
    const novoNome = prompt(
        `Editar o nome do dispositivo "${dispositivoAtual}" no cômodo "${comodo}":`,
        dispositivoAtual
    );

    if (novoNome && novoNome.trim() !== "" && novoNome.trim() !== dispositivoAtual) {
        try {
            const res = await fetch(`http://localhost:3000/dispositivos/${encodeURIComponent(dispositivoAtual)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome: novoNome })
            });

            if (!res.ok) {
                const erro = await res.json();
                throw new Error(erro.erro || "Erro ao editar dispositivo.");
            }

            const data = await res.json();

            const index = dispositivosPorComodo[comodo].findIndex(d => (typeof d === 'string' ? d === dispositivoAtual : d.nome === dispositivoAtual));
            if (index > -1) {
                if (typeof dispositivosPorComodo[comodo][index] === 'string') {
                    dispositivosPorComodo[comodo][index] = novoNome;
                } else {
                    dispositivosPorComodo[comodo][index].nome = novoNome;
                }

                const estadoAtual = estadoDispositivos[`${comodo}-${dispositivoAtual}`];
                if (estadoAtual !== undefined) {
                    delete estadoDispositivos[`${comodo}-${dispositivoAtual}`];
                    estadoDispositivos[`${comodo}-${novoNome}`] = estadoAtual;
                }
            }

            for (const nomeCena in cenas) {
                cenas[nomeCena].forEach(acao => {
                    if (acao.comodo === comodo && acao.dispositivo === dispositivoAtual) {
                        acao.dispositivo = novoNome;
                    }
                });
            }

            renderizarDispositivosPorComodo(comodo);
            inicializarFormularios();
            renderizarCenas();

            alert(data.mensagem || `Dispositivo editado para "${novoNome}" com sucesso!`);
        } catch (err) {
            console.error("Erro:", err);
            alert(`Erro ao editar dispositivo: ${err.message}`);
        }
    }
}

function removerDispositivo(comodo, dispositivo) {
    const cenasDependentes = [];
    for (const nomeCena in cenas) {
        const acoes = cenas[nomeCena];
        const cenaDepende = acoes.some(acao => acao.comodo === comodo && acao.dispositivo === dispositivo);
        if (cenaDepende) {
            cenasDependentes.push(nomeCena);
        }
    }

    if (cenasDependentes.length > 0) {
        const listaCenas = cenasDependentes.join(', ');
        alert(`ATENÇÃO: Este dispositivo é usado nas seguintes cenas: ${listaCenas}. Se você o remover, essas cenas podem não funcionar corretamente.`);
    }

    if (!confirm(`Tem certeza que deseja remover o dispositivo "${dispositivo}" do cômodo "${comodo}"?`)) {
        return;
    }

    fetch(`http://localhost:3000/dispositivos/${encodeURIComponent(dispositivo)}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                alert(`Erro: ${data.erro}`);
            } else {
                if (dispositivosPorComodo[comodo]) {
                    const index = dispositivosPorComodo[comodo].findIndex(d => (typeof d === 'string' ? d === dispositivo : d.nome === dispositivo));
                    if (index > -1) {
                        dispositivosPorComodo[comodo].splice(index, 1);
                    }
                }
                delete estadoDispositivos[`${comodo}-${dispositivo}`];

                alert(data.mensagem || `Dispositivo "${dispositivo}" removido com sucesso.`);
                renderizarDispositivosPorComodo(comodo);
                inicializarFormularios();
            }
        })
        .catch(error => {
            console.error('Erro ao remover dispositivo:', error);
            alert('Erro ao remover dispositivo. Veja o console.');
        });
}

async function adicionarComodo() {
    const nomeComodo = addComodoInput.value.trim();

    if (!nomeComodo) {
        alert('Por favor, insira o nome do cômodo.');
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/comodos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome: nomeComodo })
        });

        if (!res.ok) {
            const erro = await res.json();
            throw new Error(erro.erro || "Erro ao criar cômodo.");
        }

        const novoComodo = await res.json();

        dispositivosPorComodo[novoComodo.nome] = [];

        addComodoInput.value = '';
        renderizarCasa();
        inicializarFormularios();

        alert(`Cômodo "${novoComodo.nome}" adicionado com sucesso!`);
    } catch (err) {
        console.error("Erro:", err);
        alert(`Erro ao adicionar cômodo: ${err.message}`);
    }
}

async function removerComodo() {
    const nomeComodo = removerComodoSelect.value;

    if (!nomeComodo) {
        alert('Por favor, selecione o cômodo que deseja remover.');
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/comodos/${encodeURIComponent(nomeComodo)}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const erro = await res.json();
            throw new Error(erro.erro || "Erro ao deletar cômodo.");
        }

        delete dispositivosPorComodo[nomeComodo];

        for (const key in estadoDispositivos) {
            if (key.startsWith(`${nomeComodo}-`)) {
                delete estadoDispositivos[key];
            }
        }

        removerComodoSelect.value = '';
        renderizarCasa();
        inicializarFormularios();
        renderizarCenas();

        const data = await res.json();
        alert(data.mensagem || `Cômodo "${nomeComodo}" removido com sucesso.`);
    } catch (err) {
        console.error("Erro:", err);
        alert(`Erro ao remover cômodo: ${err.message}`);
    }
}

function editarComodo() {
    const comodoAntigo = editarComodoSelect.value;
    const comodoNovo = novoNomeComodoInput.value.trim();

    if (!comodoAntigo || !comodoNovo) {
        alert('Por favor, selecione um cômodo e insira um novo nome.');
        return;
    }

    fetch(`http://localhost:3000/comodos/${encodeURIComponent(comodoAntigo)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novoNome: comodoNovo })
    })
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                alert(`Erro: ${data.erro}`);
            } else {
                dispositivosPorComodo[comodoNovo] = dispositivosPorComodo[comodoAntigo];
                delete dispositivosPorComodo[comodoAntigo];

                for (const key in estadoDispositivos) {
                    if (key.startsWith(`${comodoAntigo}-`)) {
                        const novoKey = key.replace(comodoAntigo, comodoNovo);
                        estadoDispositivos[novoKey] = estadoDispositivos[key];
                        delete estadoDispositivos[key];
                    }
                }

                for (const nomeCena in cenas) {
                    cenas[nomeCena].forEach(acao => {
                        if (acao.comodo === comodoAntigo) {
                            acao.comodo = comodoNovo;
                        }
                    });
                }

                novoNomeComodoInput.value = '';
                renderizarCasa();
                inicializarFormularios();
                renderizarCenas();
                alert(`Cômodo "${comodoAntigo}" editado para "${comodoNovo}" com sucesso!`);
            }
        })
        .catch(error => {
            console.error('Erro ao editar cômodo:', error);
            alert('Erro ao editar cômodo. Veja o console.');
        });
}


function renderizarCenas() {
    const container = document.getElementById('cenas-container');
    container.innerHTML = '';
    for (const nomeCena in cenas) {
        const cenaDiv = document.createElement('div');
        cenaDiv.classList.add('cenas-grupo');
        const botoesDiv = document.createElement('div');
        botoesDiv.classList.add('controles');

        const executarButton = document.createElement('button');
        executarButton.classList.add('executar-cena');
        executarButton.textContent = `Executar ${nomeCena}`;
        executarButton.addEventListener('click', () => executarCena(nomeCena));

        const editarButton = document.createElement('button');
        editarButton.classList.add('editar-cena');
        editarButton.textContent = 'Editar';
        editarButton.addEventListener('click', () => editarCena(nomeCena));

        const removerButton = document.createElement('button');
        removerButton.classList.add('remover-cena');
        removerButton.textContent = 'Remover';
        removerButton.addEventListener('click', () => removerCena(nomeCena));

        botoesDiv.appendChild(executarButton);
        botoesDiv.appendChild(editarButton);
        botoesDiv.appendChild(removerButton);

        cenaDiv.appendChild(botoesDiv);
        container.appendChild(cenaDiv);
    }
}

function executarCena(nomeCena) {
    const acoes = [...cenas[nomeCena]];
    acoes.sort((a, b) => a.ordem - b.ordem);
    let tempoTotal = 0;

    const painel = document.createElement('div');
    painel.classList.add('painel-execucao');
    painel.innerHTML = `<h3>Executando cena: ${nomeCena}</h3>`;
    document.body.appendChild(painel);

    acoes.forEach(acao => {
        tempoTotal += acao.intervalo;

        setTimeout(() => {
            estadoDispositivos[`${acao.comodo}-${acao.dispositivo}`] = acao.estado;

            const log = document.createElement('p');
            log.textContent = `(${acao.ordem}) ${acao.dispositivo} em ${acao.comodo} → ${acao.estado}`;
            painel.appendChild(log);

            renderizarDispositivosPorComodo(acao.comodo);
        }, tempoTotal);
    });

    setTimeout(() => {
        alert(`Cena "${nomeCena}" concluída!`);
        painel.remove();
    }, tempoTotal + 1000);
}

function removerCena(nomeCena) {
    if (!confirm(`Tem certeza que deseja remover a cena "${nomeCena}"?`)) return;

    fetch(`http://localhost:3000/cenas/${encodeURIComponent(nomeCena)}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                alert(`Erro: ${data.erro}`);
            } else {
                delete cenas[nomeCena];
                renderizarCenas();
                alert(data.mensagem || `Cena "${nomeCena}" removida com sucesso.`);
            }
        })
        .catch(error => {
            console.error('Erro ao remover cena:', error);
            alert('Erro ao remover cena. Veja o console.');
        });
}

function popularAcaoSelects(acaoItem) {
    const comodoSelect = acaoItem.querySelector('.comodo-select');
    const dispositivoSelect = acaoItem.querySelector('.dispositivo-select');
    const estadoSelect = acaoItem.querySelector('.estado-select');

    comodoSelect.innerHTML = '';
    const defaultComodoOption = document.createElement('option');
    defaultComodoOption.value = '';
    defaultComodoOption.textContent = 'Cômodo';
    comodoSelect.appendChild(defaultComodoOption);

    for (const comodo in dispositivosPorComodo) {
        const option = document.createElement('option');
        option.value = comodo;
        option.textContent = comodo;
        comodoSelect.appendChild(option);
    }

    comodoSelect.addEventListener('change', () => {
        dispositivoSelect.innerHTML = '';
        const defaultDispositivoOption = document.createElement('option');
        defaultDispositivoOption.value = '';
        defaultDispositivoOption.textContent = 'Dispositivo';
        dispositivoSelect.appendChild(defaultDispositivoOption);
        const selectedComodo = comodoSelect.value;
        if (selectedComodo) {
            dispositivosPorComodo[selectedComodo].forEach(dispositivoObj => {
                const dispositivo = typeof dispositivoObj === 'string' ? dispositivoObj : dispositivoObj.nome;
                const option = document.createElement('option');
                option.value = dispositivo;
                option.textContent = dispositivo;
                dispositivoSelect.appendChild(option);
            });
        }
        dispositivoSelect.value = '';
        estadoSelect.value = '';
        estadoSelect.innerHTML = '';
        const defaultEstadoOption = document.createElement('option');
        defaultEstadoOption.value = '';
        defaultEstadoOption.textContent = 'Estado';
        estadoSelect.appendChild(defaultEstadoOption);
    });

    dispositivoSelect.addEventListener('change', () => {
        estadoSelect.innerHTML = '';
        const defaultEstadoOption = document.createElement('option');
        defaultEstadoOption.value = '';
        defaultEstadoOption.textContent = 'Estado';
        estadoSelect.appendChild(defaultEstadoOption);
        const selectedDispositivo = dispositivoSelect.value;
        if (selectedDispositivo) {
            if (selectedDispositivo === 'Cortina') {
                ['Aberto', 'Fechado'].forEach(estado => {
                    const option = document.createElement('option');
                    option.value = estado;
                    option.textContent = estado;
                    estadoSelect.appendChild(option);
                });
            } else {
                ['Ligado', 'Desligado'].forEach(estado => {
                    const option = document.createElement('option');
                    option.value = estado;
                    option.textContent = estado;
                    estadoSelect.appendChild(option);
                });
            }
        }
        estadoSelect.value = '';
    });
}

function criarAcaoItem() {
    const acaoItem = document.createElement('div');
    acaoItem.classList.add('acao-item');
    acaoItem.innerHTML = `
        <select class="comodo-select"></select>
        <select class="dispositivo-select"></select>
        <select class="estado-select"></select>
        <input type="number" class="ordem-input" placeholder="Ordem" min="1" style="width:70px">
        <input type="number" class="intervalo-input" placeholder="Intervalo (ms)" min="0" style="width:120px">
        <button class="remover-acao-btn remover">X</button>
    `;
    popularAcaoSelects(acaoItem);
    acoesContainer.appendChild(acaoItem);
    acaoItem.querySelector('.remover-acao-btn').addEventListener('click', () => {
        acoesContainer.removeChild(acaoItem);
    });
}

function editarCena(nomeCena) {
    cenaNomeInput.value = nomeCena;
    acoesContainer.innerHTML = '';
    const acoesDaCena = cenas[nomeCena];

    acoesDaCena.forEach(acao => {
        const acaoItem = document.createElement('div');
        acaoItem.classList.add('acao-item');
        acaoItem.innerHTML = `
            <select class="comodo-select"></select>
            <select class="dispositivo-select"></select>
            <select class="estado-select"></select>
            <input type="number" class="ordem-input" placeholder="Ordem" min="1" />
            <input type="number" class="intervalo-input" placeholder="Intervalo (ms)" min="0" />
            <button class="remover-acao-btn remover">X</button>
        `;
        acoesContainer.appendChild(acaoItem);

        const comodoSelect = acaoItem.querySelector('.comodo-select');
        const dispositivoSelect = acaoItem.querySelector('.dispositivo-select');
        const estadoSelect = acaoItem.querySelector('.estado-select');
        const ordemInput = acaoItem.querySelector('.ordem-input');
        const intervaloInput = acaoItem.querySelector('.intervalo-input');

        const defaultComodoOption = document.createElement('option');
        defaultComodoOption.value = '';
        defaultComodoOption.textContent = 'Cômodo';
        comodoSelect.appendChild(defaultComodoOption);
        for (const comodo in dispositivosPorComodo) {
            const option = document.createElement('option');
            option.value = comodo;
            option.textContent = comodo;
            comodoSelect.appendChild(option);
        }
        comodoSelect.value = acao.comodo;

        const defaultDispositivoOption = document.createElement('option');
        defaultDispositivoOption.value = '';
        defaultDispositivoOption.textContent = 'Dispositivo';
        dispositivoSelect.appendChild(defaultDispositivoOption);
        dispositivosPorComodo[acao.comodo].forEach(dispositivoObj => {
            const dispositivo = typeof dispositivoObj === 'string' ? dispositivoObj : dispositivoObj.nome;
            const option = document.createElement('option');
            option.value = dispositivo;
            option.textContent = dispositivo;
            dispositivoSelect.appendChild(option);
        });
        dispositivoSelect.value = acao.dispositivo;

        const defaultEstadoOption = document.createElement('option');
        defaultEstadoOption.value = '';
        defaultEstadoOption.textContent = 'Estado';
        estadoSelect.appendChild(defaultEstadoOption);
        if (acao.dispositivo === 'Cortina') {
            ['Aberto', 'Fechado'].forEach(estado => {
                const option = document.createElement('option');
                option.value = estado;
                option.textContent = estado;
                estadoSelect.appendChild(option);
            });
        } else {
            ['Ligado', 'Desligado'].forEach(estado => {
                const option = document.createElement('option');
                option.value = estado;
                option.textContent = estado;
                estadoSelect.appendChild(option);
            });
        }
        estadoSelect.value = acao.estado;

        ordemInput.value = acao.ordem || 1;
        intervaloInput.value = acao.intervalo || 0;

        acaoItem.querySelector('.remover-acao-btn').addEventListener('click', () => {
            acoesContainer.removeChild(acaoItem);
        });
    });
}

async function salvarCena() {
    const nomeCena = cenaNomeInput.value.trim();
    if (!nomeCena) {
        alert('Por favor, insira o nome da cena.');
        return;
    }

    const acoesParaBackend = [];
    const acoesParaFrontend = [];
    const acaoItens = document.querySelectorAll('.acao-item');

    for (const item of acaoItens) {
        const comodo = item.querySelector('.comodo-select')?.value;
        const dispositivo = item.querySelector('.dispositivo-select')?.value;
        const estadoTexto = item.querySelector('.estado-select')?.value;
        const ordem = parseInt(item.querySelector('.ordem-input')?.value) || 0;
        const intervalo = parseInt(item.querySelector('.intervalo-input')?.value) || 0;

        if (!comodo || !dispositivo || !estadoTexto || ordem <= 0) continue;

        const status = estadoTexto === "Ligado" || estadoTexto === "Aberto";

        let cod_dispositivo = null;
        if (dispositivosPorComodo[comodo]) {
            const dispositivoObj = dispositivosPorComodo[comodo].find(d => {
                if (typeof d === 'string') return d === dispositivo;
                return d.nome === dispositivo;
            });

            if (dispositivoObj) {
                cod_dispositivo = typeof dispositivoObj === 'string' ? null : dispositivoObj.cod_dispositivo;
            }
        }

        if (!cod_dispositivo) {
            try {
                const res = await fetch(`http://localhost:3000/dispositivos?comodo=${encodeURIComponent(comodo)}&nome=${encodeURIComponent(dispositivo)}`);
                const data = await res.json();
                if (data.cod_dispositivo) cod_dispositivo = data.cod_dispositivo;
            } catch (err) {
                console.error("Erro ao buscar cod_dispositivo:", err);
            }
        }

        if (!cod_dispositivo) {
            console.warn(`Dispositivo ${dispositivo} em ${comodo} não encontrado. Ignorado.`);
            continue;
        }

        acoesParaBackend.push({
            cod_dispositivo,
            status,
            ordem,
            intervalo
        });

        acoesParaFrontend.push({
            comodo,
            dispositivo,
            estado: estadoTexto,
            ordem,
            intervalo
        });
    }

    if (acoesParaBackend.length === 0) {
        alert('Nenhuma ação válida encontrada. A cena não foi salva.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/cenas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nomeCena, acoes: acoesParaBackend })
        });

        const data = await response.json();

        if (data.erro) {
            alert(`Erro: ${data.erro}`);
        } else {
            cenas[nomeCena] = acoesParaFrontend.sort((a, b) => a.ordem - b.ordem);
            renderizarCenas();
            limparFormularioCena();
            alert(`Cena "${nomeCena}" salva com sucesso!`);
        }

    } catch (error) {
        console.error('Erro ao salvar cena:', error);
        alert('Erro ao salvar cena. Veja o console.');
    }
}

function limparFormularioCena() {
    cenaNomeInput.value = '';
    acoesContainer.innerHTML = '';
}

function inicializarFormularios() {
    const selectComodo = document.getElementById('novo-dispositivo-comodo');
    selectComodo.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione o Cômodo';
    selectComodo.appendChild(defaultOption);
    for (const comodo in dispositivosPorComodo) {
        const option = document.createElement('option');
        option.value = comodo;
        option.textContent = comodo;
        selectComodo.appendChild(option);
    }

    removerComodoSelect.innerHTML = '';
    const defaultRemoveOption = document.createElement('option');
    defaultRemoveOption.value = '';
    defaultRemoveOption.textContent = 'Selecione o Cômodo';
    removerComodoSelect.appendChild(defaultRemoveOption);
    for (const comodo in dispositivosPorComodo) {
        const option = document.createElement('option');
        option.value = comodo;
        option.textContent = comodo;
        removerComodoSelect.appendChild(option);
    }

    editarComodoSelect.innerHTML = '';
    const defaultEditarOption = document.createElement('option');
    defaultEditarOption.value = '';
    defaultEditarOption.textContent = 'Selecione o Cômodo';
    editarComodoSelect.appendChild(defaultEditarOption);
    for (const comodo in dispositivosPorComodo) {
        const option = document.createElement('option');
        option.value = comodo;
        option.textContent = comodo;
        editarComodoSelect.appendChild(option);
    }
}

async function adicionarDispositivo() {
    const nomeDispositivo = document.getElementById('novo-dispositivo-nome').value.trim();
    const comodoSelecionado = document.getElementById('novo-dispositivo-comodo').value;

    if (nomeDispositivo && comodoSelecionado) {
        try {
            const res = await fetch(`http://localhost:3000/dispositivos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: nomeDispositivo,
                    nome_comodo: comodoSelecionado,
                    status: false
                })
            });

            if (!res.ok) {
                const erro = await res.json();
                throw new Error(erro.erro || "Erro ao adicionar dispositivo.");
            }

            const data = await res.json();

            if (!dispositivosPorComodo[comodoSelecionado]) {
                dispositivosPorComodo[comodoSelecionado] = [];
            }
            dispositivosPorComodo[comodoSelecionado].push({
                nome: nomeDispositivo,
                cod_dispositivo: data.dispositivo.cod_dispositivo,
                status: false
            });

            document.getElementById('novo-dispositivo-nome').value = '';

            inicializarFormularios();
            renderizarDispositivosPorComodo(comodoSelecionado);

            alert(data.mensagem || `Dispositivo "${nomeDispositivo}" adicionado com sucesso em "${comodoSelecionado}".`);

        } catch (err) {
            console.error("Erro:", err);
            alert(`Erro ao adicionar dispositivo: ${err.message}`);
        }
    } else {
        alert('Por favor, preencha o nome do dispositivo e selecione um cômodo.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await carregarDadosDoServidor();
    renderizarCasa();
    aplicarCorAleatoriaHover();
    renderizarCenas();
    inicializarFormularios();
    adicionarBtn.addEventListener('click', adicionarDispositivo);
    addAcaoBtn.addEventListener('click', criarAcaoItem);
    salvarCenaBtn.addEventListener('click', salvarCena);
    adicionarComodoBtn.addEventListener('click', adicionarComodo);
    removerComodoBtn.addEventListener('click', removerComodo);
    editarComodoBtn.addEventListener('click', editarComodo);

    fecharDispositivosBtn.addEventListener('click', () => {
        dispositivosPorComodoModal.style.display = 'none';
    });
});
