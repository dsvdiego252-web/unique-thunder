// ==============================
// Unique Thunder - App Principal
// ==============================

// Carrinho
let cart = [];

// ==============================
// Carregar produtos dinamicamente
// ==============================
async function carregarProdutos() {
  const container = document.querySelector("#produtos");
  if (!container) return;

  try {
    const response = await fetch("products.json");
    const produtos = await response.json();

    container.innerHTML = "";

    produtos.forEach((p) => {
      const card = document.createElement("div");
      card.classList.add("produto-card");

      const tamanhos = p.sizes
        .map((t) => `<option value="${t}">${t}</option>`)
        .join("");

      card.innerHTML = `
        <img src="${p.picture_url}" alt="${p.title}" class="produto-imagem" />
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <strong>R$ ${p.unit_price.toFixed(2)}</strong>

        <div class="produto-tamanho">
          <label for="tamanho-${p.id}">Tamanho:</label>
          <select id="tamanho-${p.id}">
            ${tamanhos}
          </select>
        </div>

        <button class="btn-comprar" onclick='adicionarAoCarrinho(${JSON.stringify(
          p
        )})'>Adicionar ao carrinho</button>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}

// ==============================
// Adicionar ao carrinho
// ==============================
function adicionarAoCarrinho(produto) {
  const tamanhoSelecionado = document.querySelector(
    `#tamanho-${produto.id}`
  )?.value;

  const item = {
    ...produto,
    size: tamanhoSelecionado || "Único",
    quantity: 1,
  };

  cart.push(item);
  atualizarCarrinho();
}

// ==============================
// Atualizar exibição do carrinho
// ==============================
function atualizarCarrinho() {
  const lista = document.querySelector("#cart-items");
  const total = document.querySelector("#cart-total");

  if (!lista || !total) return;

  lista.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.unit_price * item.quantity;
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.title} (${item.size}) - R$ ${item.unit_price.toFixed(2)}
      <button class="btn-remover" onclick="removerItem(${index})">Remover</button>
    `;
    lista.appendChild(li);
  });

  total.textContent = `Total: R$ ${subtotal.toFixed(2)}`;
}

// ==============================
// Remover item do carrinho
// ==============================
function removerItem(index) {
  cart.splice(index, 1);
  atualizarCarrinho();
}

// ==============================
// Finalizar compra (Mercado Pago)
// ==============================
async function finalizarCompra() {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        total: cart.reduce(
          (acc, item) => acc + item.unit_price * item.quantity,
          0
        ),
      }),
    });

    const data = await response.json();

    if (data.init_point) {
      window.location.href = data.init_point; // Redireciona para o Mercado Pago
    } else {
      alert("Erro ao iniciar o pagamento. Tente novamente.");
      console.error("Resposta inesperada:", data);
    }
  } catch (error) {
    console.error("Erro ao finalizar compra:", error);
    alert("Falha na conexão com o servidor.");
  }
}

// ==============================
// Inicializar ao carregar a página
// ==============================
window.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();

  const btnFinalizar = document.querySelector("#btn-finalizar");
  if (btnFinalizar) btnFinalizar.addEventListener("click", finalizarCompra);
});
