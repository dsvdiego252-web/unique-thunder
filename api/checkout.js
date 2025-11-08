import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) {
      return res.status(500).json({ error: "MP_ACCESS_TOKEN não configurado" });
    }

    mercadopago.configure({ access_token: ACCESS_TOKEN });

    const { items = [], shipping_cost = 0, cep = "" } = req.body || {};

    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const proto = req.headers["x-forwarded-proto"] || "https";
    const baseUrl = `${proto}://${host}`;

    const preference = await mercadopago.preferences.create({
      items: items.map((item) => ({
        title: item.title || "Produto Unique Thunder",
        quantity: Number(item.quantity || 1),
        currency_id: "BRL",
        unit_price: Number(item.unit_price || 0),
        picture_url: item.picture_url,
      })),
      shipments: {
        cost: Number(shipping_cost || 0),
        mode: "not_specified",
      },
      back_urls: {
        success: `${baseUrl}/success.html`,
        failure: `${baseUrl}/cancel.html`,
        pending: `${baseUrl}/success.html`,
      },
      auto_return: "approved",
      statement_descriptor: "UNIQUE THUNDER",
      metadata: { cep },
    });

    return res.status(200).json({
      init_point: preference.body.init_point,
      id: preference.body.id,
    });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return res.status(500).json({
      error: "Erro ao criar pagamento",
      details: error.message,
    });
  }
}
