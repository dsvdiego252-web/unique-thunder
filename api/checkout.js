import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { items, total, description } = req.body;

    const preference = await mercadopago.preferences.create({
      items: items?.length
        ? items
        : [
            {
              title: description || "Compra na Unique Thunder",
              quantity: 1,
              currency_id: "BRL",
              unit_price: Number(total) || 0,
            },
          ],
      back_urls: {
        success: "https://unique-thunder.vercel.app/success.html",
        failure: "https://unique-thunder.vercel.app/cancel.html",
      },
      auto_return: "approved",
    });

    return res.status(200).json({ init_point: preference.body.init_point });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
}
