import { GoogleGenAI } from "@google/genai";

export type JsonResponse = {
  status: (code: number) => JsonResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
};

export type RequestLike = {
  method?: string;
  body?: unknown;
  on?: (event: string, callback: (chunk?: unknown) => void) => void;
};

export function applyCors(res: JsonResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
}

export function sendJson(res: JsonResponse, statusCode: number, payload: Record<string, unknown>) {
  applyCors(res);
  return res.status(statusCode).json(payload);
}

export async function readJsonBody(req: RequestLike): Promise<any> {
  if (typeof req.body === "string") {
    return req.body ? JSON.parse(req.body) : {};
  }

  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.on !== "function") {
    return {};
  }

  const raw = await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on?.("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))));
    req.on?.("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on?.("error", (err) => reject(err));
  });

  return raw ? JSON.parse(raw) : {};
}

function splitEnvKeys(value?: string): string[] {
  if (!value || value.trim() === "" || value.includes("MY_")) return [];
  return value
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

export function getGeminiApiKeys(): string[] {
  const keys = [
    ...splitEnvKeys(process.env.GEMINI_API_KEY),
    ...splitEnvKeys(process.env.GEMINI_API_KEYS),
    ...splitEnvKeys(process.env.VITE_GEMINI_API_KEY),
  ];

  for (let i = 1; i <= 10; i++) {
    keys.push(...splitEnvKeys(process.env[`GEMINI_API_KEY_${i}`]));
  }

  return [...new Set(keys)];
}

export function getDeepSeekApiKeys(): string[] {
  const keys = [
    ...splitEnvKeys(process.env.DEEPSEEK_API_KEY),
    ...splitEnvKeys(process.env.DEEPSEEK_API_KEYS),
  ];

  for (let i = 1; i <= 10; i++) {
    keys.push(...splitEnvKeys(process.env[`DEEPSEEK_API_KEY_${i}`]));
  }

  return [...new Set(keys)];
}

export function getLocalFallbackSuggestion(fieldKey: string, formData: any = {}): string {
  const brandName = formData.brandName?.trim?.() || "";
  const industry = formData.industry?.trim?.() || "";
  const nicheTopic = formData.nicheTopic?.trim?.() || "";
  const mainProduct = formData.mainProduct?.trim?.() || "";
  const targetAudience = formData.targetAudience?.trim?.() || "";
  const customerPainPoints = formData.customerPainPoints?.trim?.() || "";

  switch (fieldKey) {
    case "userRole":
      return `Chuyên gia tư vấn thương hiệu ${brandName || "doanh nghiệp"} giàu kinh nghiệm trong lĩnh vực ${industry || "chuyên ngành"}.`;
    case "nicheTopic":
      return `Chia sẻ kiến thức, kinh nghiệm và giải pháp thực tế trong ngành ${industry || "sản phẩm/dịch vụ"} theo hướng dễ hiểu, gần gũi.`;
    case "mainProduct":
      return `Các sản phẩm/dịch vụ cốt lõi của ${brandName || "thương hiệu"}, tập trung vào chất lượng, sự phù hợp và trải nghiệm khách hàng.`;
    case "strengths":
      return `Tư vấn tận tâm, nội dung dễ hiểu, giải pháp phù hợp thực tế và luôn ưu tiên niềm tin dài hạn của khách hàng.`;
    case "targetAudience":
      return `Nhóm khách hàng đang quan tâm đến ${nicheTopic || industry || "giải pháp phù hợp"}, cần thông tin rõ ràng trước khi ra quyết định.`;
    case "customerPainPoints":
      return `Bị nhiễu thông tin, khó phân biệt giải pháp phù hợp, lo tốn tiền nhưng chưa đạt kết quả như mong muốn.`;
    case "customerDesires":
      return `Muốn tìm một hướng đi an toàn, dễ áp dụng, phù hợp điều kiện thực tế và có người đồng hành đáng tin cậy.`;
    case "customerBarriers":
      return `Còn e ngại về chi phí, chưa đủ niềm tin, sợ lựa chọn sai hoặc chưa hiểu rõ cách áp dụng giải pháp.`;
    case "customerMisconceptions":
      return `Nghĩ rằng chỉ cần chọn sản phẩm/dịch vụ đắt nhất là phù hợp, mà bỏ qua nhu cầu và bối cảnh cá nhân.`;
    case "mustHaves":
      return `Luôn có hook rõ ràng, nội dung dễ hiểu, ví dụ thực tế, CTA mềm và tránh hứa hẹn quá mức.`;
    case "thingsToAvoid":
      return `Tránh phóng đại, cam kết tuyệt đối, dìm hàng đối thủ, dùng từ gây hiểu nhầm hoặc vi phạm chính sách nền tảng.`;
    case "forbiddenKeywords":
      return `cam kết 100%, trị tận gốc, chữa khỏi hoàn toàn, hiệu quả tức thì, thuốc thần kỳ`;
    case "replacementKeywords":
      return `hỗ trợ cải thiện dần, giải pháp phù hợp, đồng hành chăm sóc, góp phần nâng cao trải nghiệm`;
    default:
      return "";
  }
}

export function getLocalFallbackEnhancement(prompt: string, action: string): string {
  const cleaned = String(prompt || "").trim();

  if (!cleaned) return "";

  if (action === "shorten") {
    const lines = cleaned
      .split("\n")
      .filter((line) => !line.includes("bắt đầu phác thảo bất cứ") && !line.includes("Lồng ghép tinh tế câu chuyện"));
    return `${lines.join("\n")}\n\n*(Đã rút gọn bằng chế độ dự phòng cục bộ khi máy chủ AI chưa sẵn sàng.)*`;
  }

  if (action === "expand") {
    return `${cleaned}\n\n## 21. HƯỚNG DẪN BỔ SUNG\n- Phân tích kỹ chân dung khách hàng trước khi viết.\n- Ưu tiên ngôn ngữ tự nhiên, dễ hiểu, tránh sáo rỗng.\n- Kiểm tra lại từ khóa nhạy cảm trước khi xuất bản.\n- Luôn kết thúc bằng lời kêu gọi hành động mềm, phù hợp ngữ cảnh.`;
  }

  if (action === "chatgpt") {
    return `${cleaned}\n\n## 21. TỐI ƯU CHO CHATGPT\n- Trả lời bằng Markdown rõ ràng.\n- Ưu tiên cấu trúc: mục tiêu, phân tích, đầu ra.\n- Không giải thích lan man ngoài yêu cầu.\n- Tự kiểm tra lỗi diễn đạt trước khi trả lời.`;
  }

  if (action === "gemini") {
    return `${cleaned}\n\n## 21. TỐI ƯU CHO GOOGLE GEMINI\n- Tận dụng ngữ cảnh dài để giữ nhất quán thương hiệu.\n- Trả lời theo cấu trúc rõ ràng, mạch lạc.\n- Bám sát thông tin người dùng nhập, không tự bịa chi tiết.\n- Ưu tiên giọng văn tự nhiên, thực tế.`;
  }

  return `${cleaned}\n\n## 21. QUY CHUẨN CẢI TIẾN\n- Diễn đạt gọn hơn, rõ hơn và tự nhiên hơn.\n- Giữ nguyên logic Prompt Master.\n- Tránh các từ phóng đại, cam kết tuyệt đối hoặc gây hiểu nhầm.`;
}

export function getFriendlyErrorMessage(err: any): string {
  const raw = err?.message || String(err || "");
  const lower = raw.toLowerCase();

  if (lower.includes("429") || lower.includes("quota") || lower.includes("rate limit") || lower.includes("resource_exhausted")) {
    return "Khóa API đang hết hạn mức hoặc bị giới hạn tốc độ. Hệ thống đã chuyển sang chế độ dự phòng để app vẫn có kết quả.";
  }

  if (lower.includes("503") || lower.includes("unavailable") || lower.includes("high demand") || lower.includes("temporary")) {
    return "Máy chủ AI đang quá tải tạm thời. Hệ thống đã chuyển sang chế độ dự phòng để app không bị lỗi JSON.";
  }

  if (lower.includes("api key") || lower.includes("invalid") || lower.includes("unauthorized") || lower.includes("401") || lower.includes("403")) {
    return "Khóa API chưa đúng hoặc chưa được cấp quyền. Vui lòng kiểm tra biến môi trường GEMINI_API_KEY / DEEPSEEK_API_KEY trên Vercel.";
  }

  return raw || "Lỗi không xác định khi gọi máy chủ AI.";
}

async function queryDeepSeekWithFallback(keys: string[], params: { systemInstruction: string; userPrompt: string; temperature: number }): Promise<string> {
  let lastError: any = null;

  for (const key of keys) {
    for (const endpoint of ["https://api.deepseek.com/chat/completions", "https://api.deepseek.com/v1/chat/completions"]) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
            messages: [
              { role: "system", content: params.systemInstruction },
              { role: "user", content: params.userPrompt },
            ],
            temperature: params.temperature,
            max_tokens: 3000,
          }),
        });

        const text = await response.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          throw new Error(`DeepSeek trả về không phải JSON: ${text.slice(0, 200)}`);
        }

        if (!response.ok) {
          throw new Error(data?.error?.message || data?.message || `DeepSeek HTTP ${response.status}`);
        }

        const content = data?.choices?.[0]?.message?.content;
        if (content) return String(content);
      } catch (err) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error("DeepSeek fallback failed");
}

export async function generateAIContent(params: { systemInstruction: string; userPrompt: string; temperature: number }): Promise<string> {
  const geminiKeys = getGeminiApiKeys();
  const deepSeekKeys = getDeepSeekApiKeys();
  let lastError: any = null;

  const models = [
    process.env.GEMINI_MODEL,
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ].filter(Boolean) as string[];

  for (const key of geminiKeys) {
    for (const model of models) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
          model,
          contents: params.userPrompt,
          config: {
            systemInstruction: params.systemInstruction,
            temperature: params.temperature,
          },
        });

        const text = response?.text;
        if (text) return text;
      } catch (err) {
        lastError = err;
      }
    }
  }

  if (deepSeekKeys.length > 0) {
    return queryDeepSeekWithFallback(deepSeekKeys, params);
  }

  throw lastError || new Error("NO_API_KEYS_CONFIGURED");
}
