// CONFIG DA LOJA
const PAYMENT_LINK = ""; // deixa vazio (vamos usar Checkout Pro dinâmico)

const SHIP_TABLE = [
  { cep_start: "01000-000", cep_end: "19999-999", price: 24.90, free_over: 299.00 },
  { cep_start: "20000-000", cep_end: "28999-999", price: 29.90, free_over: 349.00 },
  { cep_start: "29000-000", cep_end: "39999-999", price: 29.90, free_over: 349.00 },
  { cep_start: "40000-000", cep_end: "99999-999", price: 34.90, free_over: 399.00 },
];

const DEFAULT_SHIP_PRICE = 39.90;

// Formatações
const real = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Util para CEP
const normalizeCEP = (cep) =>
  cep.replace(/\D/g, "").replace(/^(\d{5})(\d{3}).*$/, "$1-$2");

const betweenCep = (cep, start, end) => {
  const n = Number(cep.replace(/\D/g, ""));
  const a = Number(start.replace(/\D/g, ""));
  const b = Number(end.replace(/\D/g, ""));
  return n >= a && n <= b;
};

function calcShipping(cep, subtotal) {
  try {
    const ncep = normalizeCEP(cep);
    for (const r of SHIP_TABLE) {
      if (betweenCep(ncep, r.cep_start, r.cep_end)) {
        if (subtotal >= r.free_over) return 0;
        return r.price;
      }
    }
  } catch {}
  return DEFAULT_SHIP_PRICE;
}
