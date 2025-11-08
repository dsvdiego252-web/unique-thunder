// ==============================
// Unique Thunder - Frontend App
// ==============================

// Carrinho local
let cart = [];

// Função para adicionar produto ao carrinho
function addToCart(product) {
  const existing = cart.find(p => p.id === product.id && p.size === product.size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
}

// Renderiza o carrinho lateral
function renderCart() {
  const cartContainer = document.querySelector("#cartItems");
  const subtotalEl = document.querySelector("#subtotal");
  const freteEl = document.querySelector("#freteTotal");
  const totalEl = document.querySelector("#total");
  
  cartContainer.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.unit_price * item.qty;

    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.picture_url}" alt="${item.title}" />
        <div>
          <strong>${item.title}</strong>
          <p>Tam: ${item.size || "-"}</p>
          <p>Qtd: ${item.qty}</p>
        </div>
      </div>
      <span>R$ ${(item.unit_price * item.qty).toFixed(2)}</span>
    `;
    cartContainer.appendChild(div);
  });

  const frete = Number(freteEl?.dataset.valor || 0);
  subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
  totalEl.textContent = `R$ ${(subtotal + frete).toFixed(2)}`;
}

// Calcula frete com base no CEP (usa sua config.js)
async function calcularFrete() {
  const cepInput = document.querySelector("#cep");
  const freteEl = document.querySelector("#freteTotal");

  if (!cepInput.value) return;
  const cep = cepInput.value.replace(/\D/g, "");

  // tabela configurada no config.js
  const valor = calcularFretePorCep(cep);
  freteEl.textContent = `R$ ${valor.toFixed(2)}`;
  freteEl.dataset.valor = valor;
  renderCart();
}

// Busca frete conforme as faixas configuradas
function calcularFretePorCep(cep) {
  if (!window.SHIP_TABLE || !Array.isArray(window.SHIP_TABLE)) return 39.9;
  const faixa = window.SHIP_TABLE.find(f =>
    cep >= f.cep_start.replace("-", "") && cep <= f.cep_end.replace("-", "")
  );
  return faixa ? faixa.price : window.DEFAULT_SHIP_PRICE || 39.9;
}

// ==============================
// 🧾 FINALIZAR COMPRA (PIX + CARTÃO)
// ==============================
async function finalizarCompra() {
  try {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    const cep = (document.querySelector("#cep")?.value || "").replace(/\D/g, "");
    const frete = Number(document.querySelector("#freteTotal")?.dataset?.valor || 0);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map(p => ({
          id: p.id,
          title: `${p.title} - Tam ${p.size || "M"}`,
          quantity: p.qty,
          unit_price: p.unit_price,
          picture_url: p.picture_url,
        })),
        shipping_cost: frete,
        cep,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.init_point) {
      console.error("Erro no checkout:", data);
      alert("Não foi possível iniciar o pagamento. Tente novamente.");
      return;
    }

    // Redireciona pro Mercado Pago (PIX + cartão)
    window.location.href = data.init_point;
  } catch (err) {
    console.error("Erro geral:", err);
    alert("Falha ao processar o pagamento.");
  }
}

// ==============================
// Inicialização
// ==============================

// Liga eventos
document.querySelector("#btnFinish")?.addEventListener("click", finalizarCompra);
document.querySelector("#cep")?.addEventListener("blur", calcularFrete);

// Exemplo de produto padrão (teste rápido)
window.addEventListener("DOMContentLoaded", () => {
  // Preenche exemplo se carrinho estiver vazio
  if (cart.length === 0) {
    addToCart({
      id: "camisa-unique-thunder-preta",
      title: "Camisa Unique Thunder Preta",
      size: "M",
      unit_price: 119.9,
      picture_url: "/assets/camisa-preta.jpg"
    });
  }
  renderCart();
});
