// api/checkout.js
/**
 * Checkout redirect (Mercado Pago) — PIX + Cartão, sem boleto
 * Requer no Vercel:
 *  - MP_ACCESS_TOKEN (seu access token de produção)
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { items = [], shipping_cost = 0, cep = "" } = req.body || {};

    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) {
      return res.status(500).json({ error: "MP_ACCESS_TOKEN não configurado" });
    }

    // Detecta a URL base do seu deploy (https://...vercel.app)
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const proto = req.headers["x-forwarded-proto"] || "https";
    const baseUrl = `${proto}://${host}`;

    // Monta preferência no endpoint oficial (sem depender de pacote NPM na build)
    const prefRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: items.map((it) => ({
          id: String(it.id || "sku"),
          title: String(it.title || "Produto"),
          quantity: Number(it.quantity || 1),
          currency_id: "BRL",
          unit_price: Number(it.unit_price || 0),
          picture_url: it.picture_url || undefined,
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

        // Habilita apenas PIX + Cartão (exclui boleto)
        payment_methods: {
          excluded_payment_types: [{ id: "ticket" }], // boleto = "ticket"
          installments: 12, // máx. parcelas (ajuste se quiser)
        },

        // Recomendações de segurança/UX:
        binary_mode: false,
        external_reference: `UT-${Date.now()}`,
      }),
    });

    if (!prefRes.ok) {
      const txt = await prefRes.text();
      console.error("MP Pref Error:", txt);
      return res.status(prefRes.status).json({ error: "Falha ao criar preferência" });
    }

    const preference = await prefRes.json();

    return res.status(200).json({
      id: preference.id,
      init_point: preference.init_point,            // web
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (err) {
    console.error("Erro ao criar pagamento:", err);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
}
