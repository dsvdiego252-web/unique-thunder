// Vercel Serverless Function (Node 20+)
import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { items = [], shipping_cost = 0, cep = "" } = req.body || {};

    // Chaves nas variáveis de ambiente da Vercel
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) return res.status(500).send("Missing MP_ACCESS_TOKEN");

    mercadopago.configure({ access_token: ACCESS_TOKEN });

    // Sucesso / Falha — monta URL absoluta do seu domínio de produção
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const proto = (req.headers["x-forwarded-proto"] || "https");
    const base = `${proto}://${host}`;

    const preference = {
      items: items.map(i => ({
        id: i.id,
        title: i.title,
        currency_id: "BRL",
        quantity: Number(i.quantity || 1),
        unit_price: Number(i.unit_price || 0),
        picture_url: i.picture_url
      })),
      shipments: {
        cost: Number(shipping_cost || 0),
        mode: "not_specified"
      },
      back_urls: {
        success: `${base}/success.html`,
        failure: `${base}/cancel.html`,
        pending: `${base}/success.html`
      },
      auto_return: "approved",
      statement_descriptor: "UNIQUE THUNDER",
      metadata: { cep }
    };

    const mpRes = await mercadopago.preferences.create(preference);
    return res.status(200).json(mpRes.body);
  } catch (err) {
    return res.status(500).send(err?.message || "error");
  }
}
