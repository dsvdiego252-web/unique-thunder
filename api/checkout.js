import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // ✅ Verifica e carrega o token do ambiente
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) {
      console.error("MP_ACCESS_TOKEN ausente nas variáveis de ambiente");
      return res.status(500).json({ error: "Token de acesso não configurado" });
    }

    mercadopago.configure({ access_token: ACCESS_TOKEN });

    // ✅ Recebe dados do front
    const { items, shipping_cost, cep } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Nenhum item recebido" });
    }

    // ✅ Detecta automaticamente o domínio da Vercel
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const proto = req.headers["x-forwarded-proto"] || "https";
    const baseUrl = `${proto}://${host}`;

    // ✅ Cria a preferência no Mercado Pago
    const preference = await mercadopago.preferences.create({
      items: items.map((item) => ({
        title: item.title,
        quantity: Number(item.quantity || 1),
        currency_id: "BRL",
        unit_price: Number(item.unit_price),
        picture_url: item.picture_url || "",
      })),
      shipments: {
        cost: Number(shipping_cost || 0),
        mode: "not_specified",
      },
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }], // 🚫 Remove boleto
        installments: 12,
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

    // ✅ Retorna link de pagamento
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
