let cvData = {
    pessoal: {},
    experiencias: [],
    formacao: [],
    certificacoes: []
};

const etapas = {
    pessoal: { pct: '25%', titulo: 'Dados Pessoais' },
    experiencia: { pct: '50%', titulo: 'Experiências Profissionais' },
    formacao: { pct: '75%', titulo: 'Formação Acadêmica' },
    certificacoes: { pct: '100%', titulo: 'Licenças e Certificados' }
};

function atualizarContador() {
    const txt = document.getElementById('resumo').value;
    document.getElementById('contador').innerText = `${txt.length} / 1200`;
}

// FUNÇÃO DE IMPORTAÇÃO
function importarDados(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            cvData = data;
            
            // Preencher campos da Etapa 1
            document.getElementById('nome').value = data.pessoal.nome || "";
            document.getElementById('titulo-prof').value = data.pessoal.titulo || "";
            document.getElementById('email').value = data.pessoal.email || "";
            document.getElementById('telefone').value = data.pessoal.telefone || "";
            document.getElementById('resumo').value = data.pessoal.resumo || "";
            
            atualizarContador();
            renderizarTudo();
            alert("Dados importados com sucesso!");
        } catch (err) {
            alert("Erro ao ler o arquivo JSON. Verifique o formato.");
        }
    };
    reader.readAsText(file);
}

function irPara(sessao) {
    if (sessao === 'experiencia') {
        cvData.pessoal = {
            nome: document.getElementById('nome').value,
            titulo: document.getElementById('titulo-prof').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
            resumo: document.getElementById('resumo').value
        };
    }
    document.getElementById('progress').style.width = etapas[sessao].pct;
    document.getElementById('titulo-sessao').innerText = etapas[sessao].titulo;
    document.querySelectorAll('.step-section').forEach(s => s.classList.remove('active'));
    document.getElementById('secao-' + sessao).classList.add('active');
    window.scrollTo(0, 0);
}

function voltarPara(sessao) { irPara(sessao); }

function abrirModal(id, index = null, tipo = null) {
    document.getElementById(id).style.display = 'flex';
    const prefixo = id.split('-')[1];
    if (index !== null) {
        preencherEdicao(tipo, index);
    } else {
        limparCamposModal(prefixo);
    }
}

function fecharModal(id) { document.getElementById(id).style.display = 'none'; }

function salvarItem(tipo) {
    const prefixo = tipo === 'experiencia' ? 'exp' : (tipo === 'formacao' ? 'form' : 'cert');
    const index = document.getElementById(`${prefixo}-index`).value;
    let item = {};
    
    if (tipo === 'experiencia') {
        item = {
            empresa: document.getElementById('exp-empresa').value,
            cargo: document.getElementById('exp-cargo').value,
            inicio: document.getElementById('exp-inicio').value,
            fim: document.getElementById('exp-fim').value || "Atual",
            descricao: document.getElementById('exp-desc').value
        };
        index === "" ? cvData.experiencias.push(item) : cvData.experiencias[index] = item;
    } 
    else if (tipo === 'formacao') {
        item = {
            titulo_tipo: document.getElementById('form-titulo-tipo').value,
            instituicao: document.getElementById('form-inst').value,
            area: document.getElementById('form-area').value,
            inicio: document.getElementById('form-inicio').value,
            fim: document.getElementById('form-fim').value,
            competencias: document.getElementById('form-comp').value.split(',').map(s => s.trim())
        };
        index === "" ? cvData.formacao.push(item) : cvData.formacao[index] = item;
    }
    else if (tipo === 'certificacoes') {
        item = {
            nome: document.getElementById('cert-nome').value,
            emissor: document.getElementById('cert-org').value,
            data: document.getElementById('cert-data').value,
            codigo: document.getElementById('cert-codigo').value,
            url: document.getElementById('cert-url').value,
            competencias: document.getElementById('cert-comp').value.split(',').map(s => s.trim())
        };
        index === "" ? cvData.certificacoes.push(item) : cvData.certificacoes[index] = item;
    }

    renderizarTudo();
    fecharModal(`modal-${prefixo}`);
}

function renderizarTudo() {
    // Ordenar experiências por data de início (mais recente primeiro)
    if (cvData.experiencias) {
        cvData.experiencias.sort((a, b) => b.inicio.localeCompare(a.inicio));
    }
    
    // Ordenar formação por data de início (mais recente primeiro)
    if (cvData.formacao) {
        cvData.formacao.sort((a, b) => b.inicio.localeCompare(a.inicio));
    }

    // Ordenar certificações por data de emissão (mais recente primeiro)
    if (cvData.certificacoes) {
        cvData.certificacoes.sort((a, b) => b.data.localeCompare(a.data));
    }

    renderizarLista('experiencias', 'lista-exp', (item) => `${item.cargo} @ ${item.empresa}`, 'experiencias');
    renderizarLista('formacao', 'lista-form', (item) => `${item.titulo_tipo}: ${item.area}`, 'formacao');
    renderizarLista('certificacoes', 'lista-cert', (item) => item.nome, 'certificacoes');
}

function renderizarLista(arrayKey, containerId, labelFn, tipoOriginal) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const prefixoModal = arrayKey === 'experiencias' ? 'exp' : (arrayKey === 'formacao' ? 'form' : 'cert');
    
    if(!cvData[arrayKey]) cvData[arrayKey] = [];
    
    cvData[arrayKey].forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'card-item';
        div.innerHTML = `
            <span>${labelFn(item)}</span>
            <button class="btn-edit" onclick="abrirModal('modal-${prefixoModal}', ${index}, '${tipoOriginal}')">Editar</button>
        `;
        container.appendChild(div);
    });
}

function preencherEdicao(tipo, index) {
    const data = cvData[tipo][index];
    if (tipo === 'experiencias') {
        document.getElementById('exp-index').value = index;
        document.getElementById('exp-empresa').value = data.empresa;
        document.getElementById('exp-cargo').value = data.cargo;
        document.getElementById('exp-inicio').value = data.inicio;
        document.getElementById('exp-fim').value = data.fim === "Atual" ? "" : data.fim;
        document.getElementById('exp-desc').value = data.descricao;
    } else if (tipo === 'formacao') {
        document.getElementById('form-index').value = index;
        document.getElementById('form-titulo-tipo').value = data.titulo_tipo;
        document.getElementById('form-inst').value = data.instituicao;
        document.getElementById('form-area').value = data.area;
        document.getElementById('form-inicio').value = data.inicio;
        document.getElementById('form-fim').value = data.fim;
        document.getElementById('form-comp').value = data.competencias ? data.competencias.join(', ') : "";
    } else if (tipo === 'certificacoes') {
        document.getElementById('cert-index').value = index;
        document.getElementById('cert-nome').value = data.nome;
        document.getElementById('cert-org').value = data.emissor;
        document.getElementById('cert-data').value = data.data;
        document.getElementById('cert-codigo').value = data.codigo;
        document.getElementById('cert-url').value = data.url;
        document.getElementById('cert-comp').value = data.competencias ? data.competencias.join(', ') : "";
    }
}

function limparCamposModal(prefixo) {
    const hidden = document.getElementById(`${prefixo}-index`);
    if(hidden) hidden.value = "";
    document.querySelectorAll(`#modal-${prefixo} input, #modal-${prefixo} textarea, #modal-${prefixo} select`).forEach(i => i.value = '');
}

function finalizar() {
    const dataStr = JSON.stringify(cvData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curriculo_${cvData.pessoal.nome.replace(/\s/g, '_').toLowerCase()}.json`;
    a.click();
}