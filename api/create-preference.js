import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) {
      console.error("❌ MP_ACCESS_TOKEN ausente!");
      return res.status(500).json({ error: "Token do Mercado Pago ausente." });
    }

    // Configura Mercado Pago
    mercadopago.configure({ access_token: ACCESS_TOKEN });

    const { items, shipping_cost = 0, cep = "" } = req.body || {};
    const baseUrl = `https://${req.headers.host}`;

    // Cria a preferência de pagamento
    const preference = {
      items: items?.length
        ? items.map(i => ({
            title: i.title,
            quantity: Number(i.quantity || 1),
            currency_id: "BRL",
            unit_price: Number(i.unit_price || 0),
            picture_url: i.picture_url,
          }))
        : [
            {
              title: "Compra na Unique Thunder",
              quantity: 1,
              currency_id: "BRL",
              unit_price: 0,
            },
          ],
      shipments: { cost: Number(shipping_cost || 0), mode: "not_specified" },
      back_urls: {
        success: `${baseUrl}/success.html`,
        failure: `${baseUrl}/cancel.html`,
        pending: `${baseUrl}/success.html`,
      },
      auto_return: "approved",
      metadata: { cep },
    };

    const result = await mercadopago.preferences.create(preference);
    console.log("✅ Preferência criada com sucesso:", result.body.id);
    return res.status(200).json(result.body);
  } catch (error) {
    console.error("❌ Erro ao criar preferência:", error);
    return res.status(500).json({ error: error.message });
  }
}
