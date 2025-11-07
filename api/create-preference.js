import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Token do Mercado Pago ausente." });
    }

    mercadopago.configure({ access_token: token });

    const { items, total } = req.body;

    const preference = await mercadopago.preferences.create({
      items: items?.length
        ? items.map(i => ({
            title: i.title,
            quantity: Number(i.quantity || 1),
            currency_id: "BRL",
            unit_price: Number(i.unit_price || 0),
          }))
        : [
            {
              title: "Compra Unique Thunder",
              quantity: 1,
              currency_id: "BRL",
              unit_price: Number(total || 0),
            },
          ],
      back_urls: {
        success: "https://unique-thunder.vercel.app/success.html",
        failure: "https://unique-thunder.vercel.app/cancel.html",
      },
      auto_return: "approved",
    });

    return res.status(200).json(preference.body);
  } catch (err) {
    console.error("Erro no servidor:", err);
    return res.status(500).json({ error: err.message || "Erro interno" });
  }
}
