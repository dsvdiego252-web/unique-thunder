// config.js

// Frete base e regras por CEP
export const SHIP_TABLE = [
  { cep_start: "01000-000", cep_end: "19999-999", price: 24.90, free_over: 349.00 }, // SP interior
  { cep_start: "20000-000", cep_end: "28999-999", price: 29.90, free_over: 349.00 }, // RJ
  { cep_start: "29000-000", cep_end: "39999-999", price: 29.90, free_over: 349.00 }, // MG
  { cep_start: "40000-000", cep_end: "99999-999", price: 34.90, free_over: 399.00 }, // outros estados
];

export const DEFAULT_SHIP_PRICE = 39.90;
