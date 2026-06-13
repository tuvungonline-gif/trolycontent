import { GoogleGenAI } from "@google/genai";

export type AiAction = "shorten" | "expand" | "chatgpt" | "gemini" | "optimize" | string;

export function getGeminiApiKeys(): string[] {
  const keys: string[] = [];
  const collect = (value?: string) => {
    if (!value || value === "MY_GEMINI_API_KEY") return;
    value.split(",").forEach((item) => {
      const trimmed = item.trim();
      if (trimmed && !keys.includes(trimmed)) keys.push(trimmed);
    });
  };

  collect(process.env.GEMINI_API_KEY);
  collect(process.env.GEMINI_API_KEYS);
  for (let i = 1; i <= 5; i++) collect(process.env[`GEMINI_API_KEY_${i}`]);
  return keys;
}

export function getDeepSeekApiKeys(): string[] {
  const keys: string[] = [];
  const collect = (value?: string) => {
    if (!value || value === "MY_DEEPSEEK_API_KEY") return;
    value.split(",").forEach((item) => {
      const trimmed = item.trim();
      if (trimmed && !keys.includes(trimmed)) keys.push(trimmed);
    });
  };

  collect(process.env.DEEPSEEK_API_KEY);
  collect(process.env.DEEPSEEK_API_KEYS);
  for (let i = 1; i <= 5; i++) collect(process.env[`DEEPSEEK_API_KEY_${i}`]);
  return keys;
}

export function hasAiKeys(): boolean {
  return getGeminiApiKeys().length > 0 || getDeepSeekApiKeys().length > 0;
}

export function getLocalFallbackSuggestion(fieldKey: string, formData: any): string {
  const brandName = formData?.brandName ? String(formData.brandName).trim() : "";
  const industry = formData?.industry ? String(formData.industry).trim() : "";
  const nicheTopic = formData?.nicheTopic ? String(formData.nicheTopic).trim() : "";

  switch (fieldKey) {
    case "userRole":
      return `Chuyên gia tư vấn thương hiệu ${brandName || "doanh nghiệp"} giàu kinh nghiệm trong lĩnh vực ${industry || "chuyên ngành"}.`;
    case "nicheTopic":
      return `Sáng tạo nội dung chuyên sâu, dễ hiểu và có tính ứng dụng trong ngành ${industry || "sản phẩm/dịch vụ"}.`;
    case "mainProduct":
      return `Các dòng sản phẩm/dịch vụ cốt lõi của ${brandName || "thương hiệu"}, tập trung vào chất lượng, sự phù hợp và trải nghiệm khách hàng.`;
    case "strengths":
      return `Tư vấn tận tâm, hiểu khách hàng, nội dung thực tế, có quy trình rõ ràng và ưu tiên giải pháp an toàn, bền vững.`;
    case "targetAudience":
      return `Nhóm khách hàng quan tâm đến ${nicheTopic || industry || "giải pháp phù hợp"}, mong muốn thông tin dễ hiểu, đáng tin cậy và thực tế.`;
    case "customerPainPoints":
      return `Bị quá tải trước nhiều thông tin trái chiều; lo chọn sai sản phẩm/dịch vụ; thiếu người tư vấn rõ ràng, dễ hiểu và đáng tin cậy.`;
    case "customerDesires":
      return `Muốn tìm được hướng chăm sóc/giải pháp phù hợp, an toàn, tiết kiệm thời gian và có người đồng hành hướng dẫn đúng cách.`;
    case "customerBarriers":
      return `Còn e ngại chi phí, sợ hiệu quả không như kỳ vọng, thiếu niềm tin vì từng nghe quá nhiều lời quảng cáo phóng đại.`;
    case "customerMisconceptions":
      return `Nghĩ rằng chỉ cần chọn giải pháp nổi tiếng hoặc đắt tiền là phù hợp, trong khi bỏ qua nhu cầu và bối cảnh thực tế của bản thân.`;
    case "mustHaves":
      return `Luôn có hook rõ ràng, nội dung dễ hiểu, ví dụ thực tế, lời khuyên an toàn và CTA mềm để mời khách hàng trao đổi thêm.`;
    case "thingsToAvoid":
      return `Tránh cam kết tuyệt đối, tránh thổi phồng công dụng, tránh hạ thấp đối thủ và tránh dùng ngôn ngữ gây hiểu nhầm về hiệu quả.`;
    case "forbiddenKeywords":
      return `Cam kết khỏi 100%, dứt điểm, trị tận gốc, thuốc thần kỳ, hiệu quả tức thì`;
    case "replacementKeywords":
      return `Hỗ trợ cải thiện dần, góp phần chăm sóc cơ thể, giải pháp hỗ trợ an toàn, hướng chăm sóc đúng cách tại nhà`;
    default:
      return "";
  }
}

export function getLocalFallbackEnhancement(prompt: string, action: AiAction): string {
  const cleaned = String(prompt || "").trim();
  if (!cleaned) return "";

  switch (action) {
    case "shorten":
      return cleaned
        .split("\n")
        .filter((line) => !line.includes("phác thảo bất cứ") && !line.includes("Lồng ghép tinh tế"))
        .join("\n") + "\n\n*(Đã rút gọn bằng chế độ dự phòng cục bộ để app vẫn hoạt động ổn định.)*";
    case "expand":
      return cleaned + `\n\n## BỔ SUNG CHUYÊN SÂU\n- Phân tích kỹ bối cảnh khách hàng trước khi viết.\n- Ưu tiên ví dụ thực tế, ngôn ngữ tự nhiên và CTA mềm.\n- Kiểm tra từ khóa nhạy cảm trước khi xuất bản.`;
    case "chatgpt":
      return cleaned + `\n\n## TỐI ƯU CHO CHATGPT\n- Trả lời bằng Markdown rõ ràng.\n- Hỏi lại khi thiếu dữ liệu quan trọng.\n- Giữ văn phong tự nhiên, tránh sáo rỗng.`;
    case "gemini":
      return cleaned + `\n\n## TỐI ƯU CHO GEMINI\n- Tận dụng ngữ cảnh dài.\n- Tự rà soát tính nhất quán trước khi trả lời.\n- Giữ đúng ranh giới từ khóa an toàn.`;
    default:
      return cleaned + `\n\n## TỐI ƯU DIỄN ĐẠT\n- Diễn đạt mạch lạc hơn, rõ vai trò hơn và giữ nguyên các dữ liệu cốt lõi đã nhập.`;
  }
}

export function getFriendlyErrorMessage(err: any): string {
  const errMsg = (err?.message || String(err)).toLowerCase();
  const errStatus = String(err?.status || err?.error?.status || "").toLowerCase();
  const errStatusCode = String(err?.statusCode || err?.error?.code || "");

  if (errStatus.includes("resource_exhausted") || errStatusCode.includes("429") || errMsg.includes("quota") || errMsg.includes("rate limit")) {
    return "Hạn mức API hiện tại đã tạm tối đa. Hệ thống đã chuyển sang chế độ dự phòng để app vẫn có phản hồi.";
  }

  if (errStatus.includes("unavailable") || errStatusCode.includes("503") || errMsg.includes("unavailable") || errMsg.includes("high demand")) {
    return "Máy chủ AI đang quá tải tạm thời. Hệ thống đã chuyển sang chế độ dự phòng cục bộ.";
  }

  return err?.message || String(err);
}

async function queryDeepSeekWithFallback(keys: string[], params: { systemInstruction: string; userPrompt: string; temperature: number; }): Promise<string> {
  let lastError: any = null;
  const endpoints = ["https://api.deepseek.com/chat/completions", "https://api.deepseek.com/v1/chat/completions"];

  for (const key of keys) {
    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: params.systemInstruction },
              { role: "user", content: params.userPrompt },
            ],
            temperature: params.temperature,
            max_tokens: 3000,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP Error ${response.status}: ${errorBody || response.statusText}`);
        }

        const data: any = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text;
        throw new Error("Không nhận được nội dung phản hồi từ DeepSeek.");
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error("Tất cả khóa DeepSeek đều không thành công.");
}

export async function generateAIContent(params: { systemInstruction: string; userPrompt: string; temperature: number; }): Promise<string> {
  const geminiKeys = getGeminiApiKeys();
  const deepseekKeys = getDeepSeekApiKeys();

  if (geminiKeys.length === 0 && deepseekKeys.length === 0) {
    throw new Error("NO_API_KEYS_CONFIGURED");
  }

  let lastError: any = null;

  for (const key of geminiKeys) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

      for (const model of models) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: params.userPrompt,
            config: {
              systemInstruction: params.systemInstruction,
              temperature: params.temperature,
            },
          });
          if (response?.text) return response.text;
        } catch (err: any) {
          lastError = err;
          const msg = String(err?.message || err).toLowerCase();
          if (msg.includes("429") || msg.includes("quota") || msg.includes("resource_exhausted")) break;
        }
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (deepseekKeys.length > 0) {
    return queryDeepSeekWithFallback(deepseekKeys, params);
  }

  throw lastError || new Error("Mọi mô hình AI và khóa dự phòng đều không thành công.");
}

export async function enhancePrompt(prompt: string, action: AiAction) {
  if (!prompt) throw new Error("Missing prompt content");

  if (!hasAiKeys()) {
    return {
      result: getLocalFallbackEnhancement(prompt, action),
      isFallback: true,
      fallbackReason: "MISSING_KEYS",
    };
  }

  let userPrompt = "";
  const systemInstruction = "Bạn là chuyên gia Prompt Engineer xuất sắc. Hãy cải thiện Prompt Master tiếng Việt, giữ nguyên bản chất chuyên sâu, cấu trúc gốc và định dạng Markdown rõ ràng.";

  switch (action) {
    case "shorten":
      userPrompt = `Hãy rút gọn Prompt Master sau, giữ nguyên vai trò, quy tắc cốt lõi, từ khóa cần tránh và định dạng đầu ra. Chỉ trả về Prompt Master đã rút gọn:\n\n${prompt}`;
      break;
    case "expand":
      userPrompt = `Hãy mở rộng Prompt Master sau cho chuyên sâu hơn, thêm hướng dẫn tư duy, tâm lý khách hàng, tình huống phản hồi và tính thực tế. Chỉ trả về Prompt Master đã mở rộng:\n\n${prompt}`;
      break;
    case "chatgpt":
      userPrompt = `Hãy tối ưu Prompt Master sau để dùng hiệu quả với ChatGPT/GPTs. Thêm hướng dẫn định dạng Markdown/JSON khi cần và khung phản hồi rõ ràng:\n\n${prompt}`;
      break;
    case "gemini":
      userPrompt = `Hãy tối ưu Prompt Master sau để dùng hiệu quả trên Google Gemini, tận dụng ngữ cảnh dài và ranh giới quy tắc rõ ràng:\n\n${prompt}`;
      break;
    default:
      userPrompt = `Hãy tối ưu diễn đạt, sửa lỗi chính tả và làm Prompt Master sau mạch lạc, chuyên nghiệp hơn nhưng giữ nguyên dữ liệu cốt lõi:\n\n${prompt}`;
  }

  try {
    const result = await generateAIContent({ systemInstruction, userPrompt, temperature: 0.3 });
    return { result };
  } catch (err: any) {
    return {
      result: getLocalFallbackEnhancement(prompt, action),
      isFallback: true,
      fallbackReason: "API_ERROR",
      apiError: getFriendlyErrorMessage(err),
    };
  }
}

export async function suggestField(fieldKey: string, formData: any) {
  if (!fieldKey || !formData) throw new Error("Thiếu thông tin yêu cầu");

  if (!hasAiKeys()) {
    return {
      suggestion: getLocalFallbackSuggestion(fieldKey, formData),
      isFallback: true,
      fallbackReason: "MISSING_KEYS",
    };
  }

  const { brandName, industry, nicheTopic, mainProduct, targetAudience, customerPainPoints } = formData;
  let promptText = "";
  let fieldName = "";

  switch (fieldKey) {
    case "userRole":
      fieldName = "Vai trò trên hệ thống khi AI xưng hô";
      promptText = `Dựa trên bối cảnh:\n- Tên cá nhân/Thương hiệu: ${brandName || "Chưa rõ"}\n- Lĩnh vực: ${industry || "Chưa rõ"}\n- Ngách cụ thể: ${nicheTopic || "Chưa rõ"}\n\nHãy gợi ý một danh xưng/vai trò ngắn gọn nhỏ hơn 15 từ. Chỉ trả về nội dung gợi ý.`;
      break;
    case "nicheTopic":
      fieldName = "Chuyên đề / Ngách cụ thể muốn sáng tạo";
      promptText = `Dựa trên bối cảnh:\n- Tên cá nhân/Thương hiệu: ${brandName || "Chưa rõ"}\n- Lĩnh vực: ${industry || "Chưa rõ"}\n\nHãy gợi ý một mô tả chuyên đề/ngách cụ thể khoảng 15-25 từ. Chỉ trả về nội dung gợi ý.`;
      break;
    case "mainProduct":
      fieldName = "Sản phẩm / Dịch vụ chính";
      promptText = `Dựa trên bối cảnh:\n- Thương hiệu: ${brandName || "Chưa rõ"}\n- Lĩnh vực: ${industry || "Chưa rõ"}\n- Ngách: ${nicheTopic || "Chưa rõ"}\n\nHãy gợi ý sản phẩm/dịch vụ chính phù hợp khoảng 10-25 từ. Chỉ trả về nội dung gợi ý.`;
      break;
    case "strengths":
      fieldName = "Điểm mạnh / Thế mạnh vượt trội";
      promptText = `Dựa trên bối cảnh:\n- Lĩnh vực: ${industry || "Chưa rõ"}\n- Sản phẩm chính: ${mainProduct || "Chưa rõ"}\n\nHãy gợi ý 2-3 thế mạnh cốt lõi trong một dòng 20-35 từ. Chỉ trả về nội dung gợi ý.`;
      break;
    case "targetAudience":
      fieldName = "Khách hàng mục tiêu";
      promptText = `Dựa trên bối cảnh:\n- Thương hiệu: ${brandName || "Chưa rõ"}\n- Lĩnh vực: ${industry || "Chưa rõ"}\n- Sản phẩm/Dịch vụ: ${mainProduct || "Chưa rõ"}\n\nHãy phác họa nhóm khách hàng mục tiêu rõ ràng 15-30 từ. Chỉ trả về nội dung gợi ý.`;
      break;
    case "customerPainPoints":
      fieldName = "Nỗi đau, vấn đề khó khăn lớn nhất của khách hàng";
      promptText = `Dựa trên bối cảnh:\n- Lĩnh vực: ${industry || "Chưa rõ"}\n- Khách hàng mục tiêu: ${targetAudience || "Chưa rõ"}\n- Sản phẩm chính: ${mainProduct || "Chưa rõ"}\n\nHãy chỉ ra nỗi đau/lo lắng chân thực 20-40 từ. Chỉ trả về nội dung gợi ý.`;
      break;
    case "customerDesires":
      fieldName = "Niềm khát khao hoặc mong ước thầm kín";
      promptText = `Dựa trên bối cảnh:\n- Khách hàng mục tiêu: ${targetAudience || "Chưa rõ"}\n- Nỗi đau lớn nhất: ${customerPainPoints || "Chưa rõ"}\n\nHãy nêu mong muốn sâu xa của họ 20-40 từ. Chỉ trả về nội dung gợi ý.`;
      break;
    case "customerBarriers":
      fieldName = "Rào cản khiến khách hàng chần chừ chưa mua";
      promptText = `Dựa trên bối cảnh:\n- Khách hàng mục tiêu: ${targetAudience || "Chưa rõ"}\n- Sản phẩm chính: ${mainProduct || "Chưa rõ"}\n\nHãy phác thảo rào cản tâm lý khiến họ ngần ngại 20-40 từ. Chỉ trả về nội dung gợi ý.`;
      break;
    case "customerMisconceptions":
      fieldName = "Hiểu sai phổ biến của khách hàng";
      promptText = `Dựa trên bối cảnh:\n- Lĩnh vực: ${industry || "Chưa rõ"}\n- Khách hàng mục tiêu: ${targetAudience || "Chưa rõ"}\n\nHãy chỉ ra một hiểu sai phổ biến 20-40 từ. Chỉ trả về nội dung gợi ý.`;
      break;
    case "mustHaves":
      fieldName = "Điều bắt buộc phải có trong nội dung";
      promptText = `Dựa trên bối cảnh:\n- Lĩnh vực: ${industry || "Chưa rõ"}\n- Sản phẩm chính: ${mainProduct || "Chưa rõ"}\n\nHãy đề xuất quy tắc bắt buộc khi truyền tải thông điệp 20-35 từ. Chỉ trả về nội dung gợi ý.`;
      break;
    case "thingsToAvoid":
      fieldName = "Những chi tiết cần tránh tuyệt đối";
      promptText = `Dựa trên bối cảnh:\n- Lĩnh vực: ${industry || "Chưa rõ"}\n- Khách hàng mục tiêu: ${targetAudience || "Chưa rõ"}\n\nHãy đưa ra chi tiết nhạy cảm nên tránh 20-40 từ. Chỉ trả về nội dung gợi ý.`;
      break;
    case "forbiddenKeywords":
      fieldName = "Từ khóa không được phép dùng";
      promptText = `Dựa trên lĩnh vực: ${industry || "Chưa rõ"}. Hãy đề xuất 3-5 từ/cụm từ cực đoan, dễ vi phạm chính sách mạng xã hội cần tránh. Chỉ trả về các từ ngăn cách bằng dấu phẩy.`;
      break;
    case "replacementKeywords":
      fieldName = "Từ khóa dùng để thay thế";
      promptText = `Dựa trên lĩnh vực: ${industry || "Chưa rõ"}. Hãy đề xuất các cụm từ uyển chuyển, an toàn, khoa học hơn khoảng 15-30 từ. Chỉ trả về nội dung.`;
      break;
    default:
      throw new Error("Trường dữ liệu không hợp lệ");
  }

  const systemInstruction = `Bạn là trợ lý Copywriting chuyên sâu bằng tiếng Việt. Hãy đưa ra một gợi ý ngắn gọn, tự nhiên, chuyên nghiệp cho trường "${fieldName}". Chỉ trả về duy nhất nội dung gợi ý thô, không có lời dẫn, không dấu ngoặc kép, không Markdown.`;

  try {
    const responseText = await generateAIContent({ systemInstruction, userPrompt: promptText, temperature: 0.7 });
    const suggestion = responseText ? responseText.trim().replace(/^[\'"“]|[\'"”]$/g, "") : "";
    return { suggestion };
  } catch (err: any) {
    return {
      suggestion: getLocalFallbackSuggestion(fieldKey, formData),
      isFallback: true,
      fallbackReason: "API_ERROR",
      apiError: getFriendlyErrorMessage(err),
    };
  }
}
