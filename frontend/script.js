import { dispositivosPorComodo, cenas, estadoDispositivos, comodoClasses } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
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

    function renderizarDispositivosPorComodo(comodo) {
        conteudoDispositivos.innerHTML = `<h3>${comodo}</h3>`;
        const dispositivosDoComodo = dispositivosPorComodo[comodo];
        if (dispositivosDoComodo && dispositivosDoComodo.length > 0) {
            dispositivosDoComodo.forEach(dispositivo => {
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

    function toggleDispositivo(comodo, dispositivo) {
        let estadoAtual = estadoDispositivos[`${comodo}-${dispositivo}`] || (dispositivo === 'Cortina' ? 'Fechado' : 'Desligado');
        let novoEstado;
        if (dispositivo === 'Cortina') {
            novoEstado = estadoAtual === 'Aberto' ? 'Fechado' : 'Aberto';
        } else {
            novoEstado = estadoAtual === 'Ligado' ? 'Desligado' : 'Ligado';
        }
        console.log(`Simulando: ${dispositivo} do ${comodo} alterado para ${novoEstado}`);
        estadoDispositivos[`${comodo}-${dispositivo}`] = novoEstado;
        renderizarDispositivosPorComodo(comodo);
    }

    function editarDispositivo(comodo, dispositivoAtual) {
        const novoNome = prompt(`Editar o nome do dispositivo "${dispositivoAtual}" no cômodo "${comodo}":`, dispositivoAtual);
        if (novoNome && novoNome.trim() !== '' && novoNome.trim() !== dispositivoAtual) {
            const index = dispositivosPorComodo[comodo].indexOf(dispositivoAtual);
            if (index > -1) {
                dispositivosPorComodo[comodo][index] = novoNome;
                
                const estadoAtual = estadoDispositivos[`${comodo}-${dispositivoAtual}`];
                if (estadoAtual) {
                    delete estadoDispositivos[`${comodo}-${dispositivoAtual}`];
                    estadoDispositivos[`${comodo}-${novoNome}`] = estadoAtual;
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
                alert(`Dispositivo editado para "${novoNome}" com sucesso!`);
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

        if (confirm(`Tem certeza que deseja remover o dispositivo "${dispositivo}" do cômodo "${comodo}"?`)) {
            const index = dispositivosPorComodo[comodo].indexOf(dispositivo);
            if (index > -1) {
                dispositivosPorComodo[comodo].splice(index, 1);
                delete estadoDispositivos[`${comodo}-${dispositivo}`];
                alert(`Dispositivo "${dispositivo}" removido do cômodo "${comodo}".`);
                renderizarDispositivosPorComodo(comodo);
                inicializarFormularios();
            }
        }
    }

    function adicionarComodo() {
        const nomeComodo = addComodoInput.value.trim();
        if (nomeComodo) {
            if (dispositivosPorComodo[nomeComodo]) {
                alert(`O cômodo "${nomeComodo}" já existe.`);
                return;
            }
            dispositivosPorComodo[nomeComodo] = [];
            addComodoInput.value = '';
            renderizarCasa();
            inicializarFormularios();
            alert(`Cômodo "${nomeComodo}" adicionado com sucesso!`);
        } else {
            alert('Por favor, insira o nome do cômodo.');
        }
    }

    function removerComodo() {
        const nomeComodo = removerComodoSelect.value;
        if (!nomeComodo) {
            alert('Por favor, selecione o cômodo que deseja remover.');
            return;
        }

        const temDispositivos = dispositivosPorComodo[nomeComodo].length > 0;
        if (temDispositivos) {
            if (!confirm(`O cômodo "${nomeComodo}" contém dispositivos. Tem certeza que deseja removê-lo? Todos os dispositivos também serão excluídos.`)) {
                return;
            }
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
        alert(`Cômodo "${nomeComodo}" removido com sucesso.`);
    }

    function editarComodo() {
        const comodoAntigo = editarComodoSelect.value;
        const comodoNovo = novoNomeComodoInput.value.trim();
    
        if (!comodoAntigo || !comodoNovo) {
            alert('Por favor, selecione um cômodo e insira um novo nome.');
            return;
        }
    
        if (dispositivosPorComodo[comodoNovo]) {
            alert(`O nome "${comodoNovo}" já está em uso.`);
            return;
        }
    
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
        const acoes = cenas[nomeCena];
        const dispositivosInexistentes = [];

        acoes.forEach(acao => {
            const dispositivoExiste = dispositivosPorComodo[acao.comodo] && dispositivosPorComodo[acao.comodo].includes(acao.dispositivo);
            if (!dispositivoExiste) {
                dispositivosInexistentes.push(`${acao.dispositivo} em ${acao.comodo}`);
            }
        });

        if (dispositivosInexistentes.length > 0) {
            const listaFaltantes = dispositivosInexistentes.join(', ');
            alert(`ERRO: A cena "${nomeCena}" não pode ser executada. Os seguintes dispositivos não existem mais: ${listaFaltantes}.`);
            return;
        }

        const comodosAfetados = new Set(acoes.map(acao => acao.comodo));
        comodosAfetados.forEach(comodoAfetado => {
            const comodoElement = document.querySelector(`[data-comodo="${comodoAfetado}"]`);
            if (comodoElement) {
                comodoElement.classList.add('comodo-ativo');
                setTimeout(() => {
                    comodoElement.classList.remove('comodo-ativo');
                }, 1000);
            }
        });

        console.log(`Executando cena: ${nomeCena}`);
        acoes.forEach(acao => {
            estadoDispositivos[`${acao.comodo}-${acao.dispositivo}`] = acao.estado;
            console.log(`  - ${acao.dispositivo} do ${acao.comodo} para o estado: ${acao.estado}`);
        });

        alert(`Cena "${nomeCena}" executada com sucesso!`);
    }

    function removerCena(nomeCena) {
        if (confirm(`Tem certeza que deseja remover a cena "${nomeCena}"?`)) {
            delete cenas[nomeCena];
            renderizarCenas();
            alert(`Cena "${nomeCena}" removida.`);
        }
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
                dispositivosPorComodo[selectedComodo].forEach(dispositivo => {
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
                <button class="remover-acao-btn remover">X</button>
            `;
            acoesContainer.appendChild(acaoItem);
            
            const comodoSelect = acaoItem.querySelector('.comodo-select');
            const dispositivoSelect = acaoItem.querySelector('.dispositivo-select');
            const estadoSelect = acaoItem.querySelector('.estado-select');
            
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
            dispositivosPorComodo[acao.comodo].forEach(dispositivo => {
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

            comodoSelect.addEventListener('change', () => {
                dispositivoSelect.innerHTML = '';
                dispositivoSelect.appendChild(defaultDispositivoOption);
                dispositivosPorComodo[comodoSelect.value].forEach(dispositivo => {
                    const option = document.createElement('option');
                    option.value = dispositivo;
                    option.textContent = dispositivo;
                    dispositivoSelect.appendChild(option);
                });
                dispositivoSelect.value = '';
                estadoSelect.value = '';
                estadoSelect.innerHTML = '';
                estadoSelect.appendChild(defaultEstadoOption);
            });

            dispositivoSelect.addEventListener('change', () => {
                estadoSelect.innerHTML = '';
                estadoSelect.appendChild(defaultEstadoOption);
                if (dispositivoSelect.value === 'Cortina') {
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
                estadoSelect.value = '';
            });

            acaoItem.querySelector('.remover-acao-btn').addEventListener('click', () => {
                acoesContainer.removeChild(acaoItem);
            });
        });
    }

    function salvarCena() {
        const nomeCena = cenaNomeInput.value.trim();
        if (!nomeCena) {
            alert('Por favor, insira o nome da cena.');
            return;
        }

        const acoes = [];
        const acaoItens = document.querySelectorAll('.acao-item');
        acaoItens.forEach(item => {
            const comodo = item.querySelector('.comodo-select').value;
            const dispositivo = item.querySelector('.dispositivo-select').value;
            const estado = item.querySelector('.estado-select').value;

            if (comodo && dispositivo && estado) {
                acoes.push({ comodo, dispositivo, estado });
            }
        });

        if (acoes.length === 0) {
            alert('Por favor, adicione pelo menos uma ação para a cena.');
            return;
        }

        cenas[nomeCena] = acoes;
        alert(`Cena "${nomeCena}" salva com sucesso!`);
        renderizarCenas();
        limparFormularioCena();
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
    
    function adicionarDispositivo() {
        const nomeDispositivo = document.getElementById('novo-dispositivo-nome').value.trim();
        const comodoSelecionado = document.getElementById('novo-dispositivo-comodo').value;

        if (nomeDispositivo && comodoSelecionado) {
            if (!dispositivosPorComodo[comodoSelecionado]) {
                dispositivosPorComodo[comodoSelecionado] = [];
            }
            if (!dispositivosPorComodo[comodoSelecionado].includes(nomeDispositivo)) {
                dispositivosPorComodo[comodoSelecionado].push(nomeDispositivo);
                document.getElementById('novo-dispositivo-nome').value = '';
                inicializarFormularios();
                renderizarDispositivosPorComodo(comodoSelecionado);
                alert(`Dispositivo "${nomeDispositivo}" adicionado com sucesso em "${comodoSelecionado}".`);
            } else {
                alert(`O dispositivo "${nomeDispositivo}" já existe no cômodo "${comodoSelecionado}".`);
            }
        } else {
            alert('Por favor, preencha o nome do dispositivo e selecione um cômodo.');
        }
    }

    renderizarCasa();
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