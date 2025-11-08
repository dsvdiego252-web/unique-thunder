import { MercadoPagoConfig, Preference } from "mercadopago-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // 🔐 Chave de acesso vinda das variáveis da Vercel (.env)
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) {
      return res.status(500).json({ error: "MP_ACCESS_TOKEN não configurado" });
    }

    // 🧭 Configuração do cliente Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });

    // 🛒 Dados recebidos do carrinho
    const { items = [], shipping_cost = 0, cep = "" } = req.body || {};

    // 🔗 Detecta automaticamente o domínio da aplicação (para redirecionamento)
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const proto = req.headers["x-forwarded-proto"] || "https";
    const baseUrl = `${proto}://${host}`;

    // 🧾 Criação da preferência de pagamento
    const preference = await new Preference(client).create({
      items: items.map((item) => ({
        id: item.id,
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

    // 🔁 Retorna o link de pagamento para o front-end
    return res.status(200).json({
      init_point: preference.sandbox_init_point || preference.init_point,
      id: preference.id,
    });
  } catch (error) {
    console.error("❌ Erro ao criar pagamento:", error);
    return res.status(500).json({
      error: "Erro ao criar pagamento",
      details: error.message,
    });
  }
}
