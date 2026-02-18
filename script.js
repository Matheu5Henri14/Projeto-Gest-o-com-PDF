const SENHA_MESTRA = "1234"; 

function verificarSenha() {
    const entrada = document.getElementById('senhaInput').value;
    if(entrada === SENHA_MESTRA) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        carregarDados();
    } else {
        alert("Senha incorreta!");
    }
}

function adicionar() {
    const nome = document.getElementById('nomeFerramenta').value;
    const nf = document.getElementById('notaFiscal').value || "N/I";
    const qtd = document.getElementById('quantidade').value || "0";
    const codigo = document.getElementById('codigoFerramenta').value;

    if(!nome || !codigo) return alert("Preencha Nome e Código!");

    const novoItem = { id: Date.now(), nome, nf, qtd, codigo };
    let banco = JSON.parse(localStorage.getItem('minha_planilha_v2') || '[]');
    banco.push(novoItem);
    localStorage.setItem('minha_planilha_v2', JSON.stringify(banco));

    renderizar(novoItem);
    
    // Limpar campos
    document.getElementById('nomeFerramenta').value = '';
    document.getElementById('notaFiscal').value = '';
    document.getElementById('quantidade').value = '';
    document.getElementById('codigoFerramenta').value = '';
}

function carregarDados() {
    const banco = JSON.parse(localStorage.getItem('minha_planilha_v2') || '[]');
    document.getElementById('lista-ferramentas').innerHTML = '';
    banco.forEach(renderizar);
}

function renderizar(item) {
    const lista = document.getElementById('lista-ferramentas');
    const div = document.createElement('div');
    div.className = 'card';
    div.id = `item-${item.id}`;
    div.innerHTML = `
        <div style="font-weight:bold; font-size: 1.1em;">${item.nome}</div>
        <div class="card-info">
            <div><strong>NF:</strong> ${item.nf}</div>
            <div><strong>Qtd:</strong> ${item.qtd}</div>
        </div>
        <code>${item.codigo}</code>
        <button class="btn btn-del" onclick="remover(${item.id})">Remover</button>
    `;
    lista.appendChild(div);
}

function remover(id) {
    if(confirm("Excluir este item?")) {
        let banco = JSON.parse(localStorage.getItem('minha_planilha_v2') || '[]');
        banco = banco.filter(i => i.id !== id);
        localStorage.setItem('minha_planilha_v2', JSON.stringify(banco));
        document.getElementById(`item-${id}`).remove();
    }
}

async function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const lista = document.getElementById('lista-ferramentas');
    if(lista.children.length === 0) return alert("Lista vazia!");

    const agora = new Date();
    const dataF = agora.toLocaleDateString('pt-BR');
    const horaF = agora.toLocaleTimeString('pt-BR');

    const canvas = await html2canvas(lista, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.setFontSize(14);
    pdf.text("Relatório de Inventário e Códigos", 10, 12);
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Documento extraído em: ${dataF} às ${horaF}`, 10, 18);

    pdf.addImage(imgData, 'PNG', 0, 25, pdfWidth, pdfHeight);
    pdf.save(`inventario_${dataF.replaceAll('/','-')}.pdf`);
}