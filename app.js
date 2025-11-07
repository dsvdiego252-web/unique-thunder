const state = {
  cart: [],
  products: [],
  cep: "",
  shipping: 0,
};

const fmt = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

async function loadProducts() {
  const res = await fetch('products.json');
  state.products = await res.json();
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  state.products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    const img = document.createElement('img');
    img.src = p.image || 'assets/logo.svg';
    img.alt = p.name;
    thumb.appendChild(img);

    const body = document.createElement('div');
    body.className = 'body';

    const title = document.createElement('div');
    title.textContent = p.name;

    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = fmt(p.price);

    const sizeRow = document.createElement('div');
    sizeRow.className = 'size-row';
    let selectedSize = null;
    (p.sizes || ['P','M','G','GG']).forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'size';
      btn.textContent = s;
      btn.addEventListener('click', () => {
        selectedSize = s;
        [...sizeRow.children].forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
      });
      sizeRow.appendChild(btn);
    });

    const add = document.createElement('button');
    add.className = 'btn';
    add.textContent = 'Adicionar ao carrinho';
    add.addEventListener('click', () => {
      if (!selectedSize) {
        alert('Escolha um tamanho.');
        return;
      }
      addToCart({ id: p.id, name: p.name, price: p.price, size: selectedSize, image: p.image });
    });

    body.appendChild(title);
    body.appendChild(price);
    body.appendChild(sizeRow);
    body.appendChild(add);

    card.appendChild(thumb);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

function addToCart(item) {
  state.cart.push({ ...item, qty: 1 });
  updateCartCount();
  openCart();
  renderCart();
}

function updateCartCount() {
  document.getElementById('cartCount').textContent = state.cart.reduce((a,b)=>a+b.qty,0);
}

function openCart(){ 
  document.getElementById('cartPanel').classList.add('open'); 
  document.getElementById('backdrop').hidden = false;
}
function closeCart(){
  document.getElementById('cartPanel').classList.remove('open'); 
  document.getElementById('backdrop').hidden = true;
}

function renderCart(){
  const wrap = document.getElementById('cartItems');
  wrap.innerHTML = '';
  state.cart.forEach((c, idx) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    const im = document.createElement('img'); im.src = c.image || 'assets/logo.svg';
    const meta = document.createElement('div'); meta.className='meta';
    meta.innerHTML = `<strong>${c.name}</strong><div>Tam: ${c.size}</div><div>${fmt(c.price)}</div>`;
    const del = document.createElement('button'); del.className='btn'; del.textContent='Remover';
    del.onclick = ()=>{ state.cart.splice(idx,1); updateCartCount(); renderCart(); };
    row.appendChild(im); row.appendChild(meta); row.appendChild(del);
    wrap.appendChild(row);
  });
  const subtotal = state.cart.reduce((a,b)=>a + b.price*b.qty, 0);
  document.getElementById('subtotal').textContent = fmt(subtotal);

  const cep = (document.getElementById('cep').value || '').replace(/\D/g,'');
  let shipping = 0;
  if (cep.length === 8) {
    shipping = calcShipping(cep, subtotal);
  }
  state.shipping = shipping;
  document.getElementById('frete').textContent = fmt(shipping);
  document.getElementById('total').textContent = fmt(subtotal + shipping);
}

function calcShipping(cep, subtotal){
  for (const rule of SHIP_TABLE){
    const start = parseInt(rule.cep_start.replace(/\D/g,''));
    const end = parseInt(rule.cep_end.replace(/\D/g,''));
    const c = parseInt(cep, 10);
    if (c >= start && c <= end){
      if (subtotal >= (rule.free_over || 999999)) return 0;
      return rule.price;
    }
  }
  return DEFAULT_SHIP_PRICE;
}

function goCheckout(){
  if (!PAYMENT_LINK){
    alert('Configurar PAYMENT_LINK em config.js para habilitar o checkout (Mercado Pago).');
    return;
  }
  const subtotal = state.cart.reduce((a,b)=>a + b.price*b.qty, 0);
  const total = subtotal + state.shipping;
  const payload = encodeURIComponent(JSON.stringify({cart:state.cart, subtotal, shipping:state.shipping, total}));
  window.location.href = `checkout.html?data=${payload}`;
}

document.getElementById('cartButton').onclick = openCart;
document.getElementById('closeCart').onclick = closeCart;
document.getElementById('backdrop').onclick = closeCart;
document.getElementById('checkout').onclick = goCheckout;
document.getElementById('cep').addEventListener('input', renderCart);
document.getElementById('year').textContent = new Date().getFullYear();

loadProducts();
