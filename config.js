// CONFIG DA LOJA
const PAYMENT_LINK = "http://link.mercadopago.com.br/uniquethunder"; // cole aqui o link de pagamento do Mercado Pago (Checkout Pro ou Link de Pagamento)
const SHIP_TABLE = [
  { cep_start: "01000-000", cep_end: "19999-999", price: 24.90, free_over: 299.00 },
  { cep_start: "20000-000", cep_end: "28999-999", price: 29.90, free_over: 349.00 },
  { cep_start: "29000-000", cep_end: "39999-999", price: 29.90, free_over: 349.00 },
  { cep_start: "40000-000", cep_end: "99999-999", price: 34.90, free_over: 399.00 }
];
const DEFAULT_SHIP_PRICE = 39.90;
