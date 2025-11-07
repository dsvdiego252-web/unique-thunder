const els = {
  grid: document.querySelector("#produtos"),
  modal: document.querySelector("#quickModal"),
  modalImg: document.querySelector("#modalImg"),
  modalTitle: document.querySelector("#modalTitle"),
  modalDesc: document.querySelector("#modalDesc"),
  modalPrice: document.querySelector("#modalPrice"),
  sizeGroup: document.querySelector("#sizeGroup"),
  qtyInput: document.querySelector("#qty"),
  addToCart: document.querySelector("#addToCart"),
  closeModal: document.querySelector("#closeModal"),

  cart: document.querySelector("#cartDrawer"),
  btnCart: document.querySelector("#btnCart"),
  closeCart: document.querySelector("#closeCart"),
  cartItems: document.querySelector("#cartItems"),
  cartCount: document.querySelector("#cartCount"),
  subTotal: document.querySelector("#subTotal"),
  shipTotal: document.querySelector("#shipTotal"),
  grandTotal: document.querySelector("#grandTotal"),
  cep: document.querySelector("#cep"),
  btnCheckout: document.querySelector("#btnCheckout")
};

let PRODUCTS = [];
let CART = [];
let current = null; // produto selecionado (modal)

// Carrega produtos
async function load() {
  const res = await fetch("./products.json");
  PRODUCTS = await res.json();
  renderGrid(PRODUCTS);
}
load();

function renderGrid(list) {
  els.grid.innerHTML = list.map(p => cardHTML(p)).join("");
  // bind
  document.querySelectorAll(".btn-buy").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.dataset.id));
  });
}

function cardHTML(p) {
  return `
    <article class="card">
      <img src="${p.image}" alt="${p.title}">
      <div class="inner">
        <h3>${p.title}</h3>
        <p class="muted">${p.desc}</p>
        <div class="price">${real(p.price)}</div>
        <div class="actions">
          <button class="btn-primary btn-buy" data-id="${p.id}">Escolher tamanho</button>
        </div>
      </div>
    </article>`;
}

// Modal
function openModal(id) {
  current = PRODUCTS.find(x => x.id === id);
  if (!current) return;
  els.modalImg.src = current.image;
  els.modalTitle.textContent = current.title;
  els.modalDesc.textContent = current.desc;
  els.modalPrice.textContent = real(current.price);
  els.qtyInput.value = 1;
  els.sizeGroup.innerHTML = current.sizes.map((s,i) =>
    `<button class="size ${i===0?"active":""}" data-size="${s}">${s}</button>`
  ).join("");
  els.modal.classList.add("open");

  els.sizeGroup.querySelectorAll(".size").forEach(b=>{
    b.addEventListener("click", ()=>{
      els.sizeGroup.querySelectorAll(".size").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
    });
  });
}
els.closeModal.addEventListener("click", ()=> els.modal.classList.remove("open"));
document.addEventListener("keydown", e=>{
  if(e.key==="Escape") { els.modal.classList.remove("open"); els.cart.classList.remove("open");}
});
document.querySelectorAll(".qty-btn").forEach(b=>{
  b.addEventListener("click", ()=>{
    const act=b.dataset.act;
    let v = Number(els.qtyInput.value||1);
    v = act==="inc" ? v+1 : Math.max(1,v-1);
    els.qtyInput.value = v;
  });
});

els.addToCart.addEventListener("click", ()=>{
  const size = (els.sizeGroup.querySelector(".active")||{}).dataset?.size;
  const qty = Math.max(1, Number(els.qtyInput.value||1));
  if(!current || !size) return;

  const key = `${current.id}_${size}`;
  const found = CART.find(i=>i.key===key);
  if(found) found.qty += qty;
  else CART.push({ key, id:current.id, title:current.title, price:current.price, image:current.image, size, qty });

  els.modal.classList.remove("open");
  openCart();
  saveCart();
  renderCart();
});

// Carrinho
function openCart(){ els.cart.classList.add("open"); }
function closeCart(){ els.cart.classList.remove("open"); }
els.btnCart.addEventListener("click", openCart);
els.closeCart.addEventListener("click", closeCart);

function renderCart(){
  if(!CART.length){
    els.cartItems.innerHTML = `<p class="muted">Seu carrinho está vazio.</p>`;
  } else {
    els.cartItems.innerHTML = CART.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}">
        <div>
          <h4>${item.title}</h4>
          <small>Tam. ${item.size} &nbsp; • &nbsp; ${item.qty}x</small>
          <div class="price">${real(item.price * item.qty)}</div>
        </div>
        <button class="rm" data-key="${item.key}">Remover</button>
      </div>`).join("");
    els.cartItems.querySelectorAll(".rm").forEach(b=>{
      b.addEventListener("click", ()=>{
        CART = CART.filter(i=>i.key!==b.dataset.key);
        saveCart(); renderCart();
      });
    });
  }
  const subtotal = CART.reduce((s,i)=>s+i.price*i.qty,0);
  els.subTotal.textContent = real(subtotal);

  const cep = els.cep.value || "";
  const ship = calcShipping(cep, subtotal);
  els.shipTotal.textContent = real(ship);
  els.grandTotal.textContent = real(subtotal + ship);
  els.cartCount.textContent = String(CART.reduce((s,i)=>s+i.qty,0));
}
els.cep.addEventListener("input", ()=> renderCart());

// Persistência simples
function saveCart(){ localStorage.setItem("UT_CART", JSON.stringify(CART)); }
function loadCart(){ try{ CART = JSON.parse(localStorage.getItem("UT_CART")||"[]"); }catch{CART=[]} }
loadCart(); renderCart();

// Checkout via função serverless
els.btnCheckout.addEventListener("click", async ()=>{
  if(!CART.length) return alert("Seu carrinho está vazio.");

  const items = CART.map(i=>({
    id: i.id,
    title: `${i.title} (Tam ${i.size})`,
    quantity: i.qty,
    unit_price: i.price,
    picture_url: new URL(i.image, location.href).href
  }));

  const subtotal = CART.reduce((s,i)=>s+i.price*i.qty,0);
  const shipping = calcShipping(els.cep.value || "", subtotal);

  try{
    const res = await fetch("/api/create-preference",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        items,
        shipping_cost: shipping,
        cep: els.cep.value || ""
      })
    });
    if(!res.ok){
      const txt = await res.text();
      throw new Error(txt);
    }
    const data = await res.json();
    // redireciona para o Checkout Pro
    location.href = data.init_point || data.sandbox_init_point;
  }catch(err){
    alert("Falha na conexão: "+ (err?.message || err));
  }
});
