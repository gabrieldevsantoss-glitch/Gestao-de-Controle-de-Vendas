const produtosPadrao = [
    { nome: "Mouse Gamer", precoVenda: 120.50, precoCompra: 90.38, quantidade: 10 },
    { nome: "MousePad", precoVenda: 350.00, precoCompra: 262.50, quantidade: 5 },
    { nome: "Monitor 144Hz", precoVenda: 1100.00, precoCompra: 825.00, quantidade: 30 },
    { nome: "Headset Gamer", precoVenda: 250.99, precoCompra: 188.24, quantidade: 7 },
    { nome: "RTX 5090 24GB", precoVenda: 17999.99, precoCompra: 13499.99, quantidade: 3 }
];

function lerStorage(chave, padrao) {
    try {
        const valor = JSON.parse(localStorage.getItem(chave));
        return valor ?? padrao;
    } catch {
        return padrao;
    }
}

let produtos = lerStorage("produtos", []);
if (!Array.isArray(produtos) || produtos.length === 0) {
    produtos = produtosPadrao.map(p => ({ ...p }));
}
let caixaDia = Number(lerStorage("caixaDia", 0)) || 0;
let custoDia = Number(lerStorage("custoDia", 0)) || 0;
salvarDados();

document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", e => e.preventDefault());
});

atualizarTela();

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buscarProduto(nome) {
    const alvo = nome.trim().toLowerCase();
    return produtos.find(p => p.nome.toLowerCase() === alvo);
}

function valorCampo(id) {
    return document.getElementById(id).value.trim();
}

function limparFormulario(id) {
    const form = document.getElementById(id);
    if (form) form.reset();
}

function salvarDados() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
    localStorage.setItem("caixaDia", JSON.stringify(caixaDia));
    localStorage.setItem("custoDia", JSON.stringify(custoDia));
}

function atualizarTela() {
    mostrarEstoque();
    atualizarCaixa();
    atualizarCusto();
    atualizarLucro();
}

function registrarProduto() {
    const nome = valorCampo("nome-registro");
    if (!nome) {
        alert("Nome do produto é obrigatório.");
        return;
    }
    if (buscarProduto(nome)) {
        alert("Já existe um produto com esse nome.");
        return;
    }
    const precoVenda = parseFloat(valorCampo("preco-registro"));
    if (isNaN(precoVenda) || precoVenda <= 0) {
        alert("Preço inválido.");
        return;
    }
    const quantidade = parseInt(valorCampo("quantidade-registro"), 10);
    if (isNaN(quantidade) || quantidade < 0) {
        alert("Quantidade inválida.");
        return;
    }
    const precoCompra = Math.round(precoVenda * 0.75 * 100) / 100;
    produtos.push({ nome, precoVenda, precoCompra, quantidade });
    salvarDados();
    atualizarTela();
    limparFormulario("register-form");
    alert(`Produto ${nome} registrado com sucesso!`);
}

function registrarCinco() {
    const novos = produtosPadrao.filter(p => !buscarProduto(p.nome));
    if (novos.length === 0) {
        alert("Os cinco produtos padrão já estão registrados.");
        return;
    }
    novos.forEach(p => produtos.push({ ...p }));
    salvarDados();
    atualizarTela();
    alert(`${novos.length} produto(s) registrado(s):\n` + novos.map(p => `- ${p.nome}`).join("\n"));
}

function realizarVenda() {
    const nome = valorCampo("nome-venda");
    const produto = buscarProduto(nome);
    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }
    const quantidadeVendida = parseInt(valorCampo("quantidade-vender"), 10);
    if (isNaN(quantidadeVendida) || quantidadeVendida <= 0) {
        alert("Quantidade inválida.");
        return;
    }
    if (quantidadeVendida > produto.quantidade) {
        alert(`Quantidade em estoque insuficiente. Disponível: ${produto.quantidade}.`);
        return;
    }
    produto.quantidade -= quantidadeVendida;
    caixaDia += quantidadeVendida * produto.precoVenda;
    salvarDados();
    atualizarTela();
    limparFormulario("sale-form");
    alert(`Venda realizada: ${quantidadeVendida} unidade(s) de ${produto.nome}.`);
}

function reporEstoque() {
    const nome = valorCampo("reestoque");
    const produto = buscarProduto(nome);
    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }
    const quantidadeReposta = parseInt(valorCampo("quantidade-reposta"), 10);
    if (isNaN(quantidadeReposta) || quantidadeReposta <= 0) {
        alert("Quantidade inválida.");
        return;
    }
    produto.quantidade += quantidadeReposta;
    custoDia += quantidadeReposta * produto.precoCompra;
    salvarDados();
    atualizarTela();
    limparFormulario("restock-form");
    alert(`Estoque reposto: ${quantidadeReposta} unidade(s) de ${produto.nome}.`);
}

function consultarProduto() {
    const nome = valorCampo("nome-consulta");
    const produto = buscarProduto(nome);
    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }
    alert(
        `Produto: ${produto.nome}\n` +
        `Estoque: ${produto.quantidade}\n` +
        `Preço Venda: ${formatarMoeda(produto.precoVenda)}\n` +
        `Preço Compra: ${formatarMoeda(produto.precoCompra)}`
    );
}

function calcularLucro() {
    return caixaDia - custoDia;
}

function gerarRelatorio() {
    let relatorio =
        `Relatório do Dia:\n` +
        `Caixa do dia: ${formatarMoeda(caixaDia)}\n` +
        `Custo do dia: ${formatarMoeda(custoDia)}\n` +
        `Lucro: ${formatarMoeda(calcularLucro())}\n\n` +
        `Produtos em Estoque:\n`;

    produtos.forEach(produto => {
        relatorio += `- ${produto.nome}: ${produto.quantidade} unidade(s)\n`;
    });

    const criticos = produtos.filter(p => p.quantidade < 5);
    relatorio += "\n";
    if (criticos.length > 0) {
        relatorio += "Produtos com Estoque Crítico:\n";
        criticos.forEach(p => {
            relatorio += `- ${p.nome} (Estoque: ${p.quantidade})\n`;
        });
    } else {
        relatorio += "Nenhum produto está com estoque crítico.";
    }

    alert(relatorio);
}


function mostrarEstoque() {
    const lista = document.getElementById("lista-estoque");
    if (!lista) return;
    lista.innerHTML = "";

    produtos.forEach(produto => {
        const item = document.createElement("li");
        item.textContent = `${produto.nome} - ${produto.quantidade} unidade(s)`;
        if (produto.quantidade < 5) {
            item.style.color = "red";
            item.textContent += " (Estoque Crítico)";
        }
        lista.appendChild(item);
    });
}

function atualizarCaixa() {
    const valorCaixa = document.getElementById("valor-caixa");
    if (!valorCaixa) return;
    valorCaixa.textContent = formatarMoeda(caixaDia);
}

function atualizarCusto() {
    const valorCusto = document.getElementById("valor-custo");
    if (!valorCusto) return;
    valorCusto.textContent = formatarMoeda(custoDia);
    valorCusto.style.color = "red";
}

function atualizarLucro() {
    const valorLucro = document.getElementById("valor-lucro");
    if (!valorLucro) return;
    const lucro = calcularLucro();
    valorLucro.textContent = formatarMoeda(lucro);
    valorLucro.style.color = lucro < 0 ? "red" : "green";
}
