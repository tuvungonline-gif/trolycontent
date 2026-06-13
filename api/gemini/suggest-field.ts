import { suggestField } from "../../lib/aiCore";

function parseBody(req: any) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { fieldKey, formData } = parseBody(req);
    if (!fieldKey || !formData) {
      return res.status(400).json({ error: "Thiếu thông tin yêu cầu" });
    }

    const result = await suggestField(fieldKey, formData);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      error: "Không thể lấy gợi ý bằng AI: " + (err?.message || String(err)),
    });
  }
}
