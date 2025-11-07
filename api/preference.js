// /api/create_preference.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { product, size, amount, shipping, cep } = JSON.parse(req.body);

    const total = Number(amount) + Number(shipping);

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: `${product} (${size})`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: Number(total.toFixed(2)),
          },
        ],
        back_urls: {
          success: `${process.env.VERCEL_URL || "https://unique-thunder.vercel.app"}/success.html`,
          failure: `${process.env.VERCEL_URL || "https://unique-thunder.vercel.app"}/cancel.html`,
        },
        auto_return: "approved",
      }),
    });

    const data = await response.json();
    if (data.init_point) res.status(200).json({ url: data.init_point });
    else throw new Error(JSON.stringify(data));
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    res.status(500).json({ error: "Falha ao criar pagamento", details: error.message });
  }
}
