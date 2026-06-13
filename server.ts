import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

function getGeminiApiKeys(): string[] {
  const keys: string[] = [];
  
  // Parse GEMINI_API_KEY
  const key1 = process.env.GEMINI_API_KEY;
  if (key1 && key1 !== "MY_GEMINI_API_KEY" && key1.trim() !== "") {
    key1.split(",").forEach(k => {
      const trimmed = k.trim();
      if (trimmed && !keys.includes(trimmed)) {
        keys.push(trimmed);
      }
    });
  }

  // Parse GEMINI_API_KEYS
  const key2 = process.env.GEMINI_API_KEYS;
  if (key2 && key2.trim() !== "") {
    key2.split(",").forEach(k => {
      const trimmed = k.trim();
      if (trimmed && !keys.includes(trimmed)) {
        keys.push(trimmed);
      }
    });
  }

  // Check GEMINI_API_KEY_1 through GEMINI_API_KEY_5
  for (let i = 1; i <= 5; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k && k.trim() !== "") {
      k.split(",").forEach(subK => {
        const trimmed = subK.trim();
        if (trimmed && !keys.includes(trimmed)) {
          keys.push(trimmed);
        }
      });
    }
  }

  return keys;
}

function getDeepSeekApiKeys(): string[] {
  const keys: string[] = [];

  // Parse DEEPSEEK_API_KEY
  const key1 = process.env.DEEPSEEK_API_KEY;
  if (key1 && key1 !== "MY_DEEPSEEK_API_KEY" && key1.trim() !== "") {
    key1.split(",").forEach(k => {
      const trimmed = k.trim();
      if (trimmed && !keys.includes(trimmed)) {
        keys.push(trimmed);
      }
    });
  }

  // Parse DEEPSEEK_API_KEYS
  const key2 = process.env.DEEPSEEK_API_KEYS;
  if (key2 && key2.trim() !== "") {
    key2.split(",").forEach(k => {
      const trimmed = k.trim();
      if (trimmed && !keys.includes(trimmed)) {
        keys.push(trimmed);
      }
    });
  }

  // Check DEEPSEEK_API_KEY_1 through DEEPSEEK_API_KEY_5
  for (let i = 1; i <= 5; i++) {
    const k = process.env[`DEEPSEEK_API_KEY_${i}`];
    if (k && k.trim() !== "") {
      k.split(",").forEach(subK => {
        const trimmed = subK.trim();
        if (trimmed && !keys.includes(trimmed)) {
          keys.push(trimmed);
        }
      });
    }
  }

  return keys;
}

// Local heuristics and rule-based template fallback generators for robust offline/no-quota modes
function getLocalFallbackSuggestion(fieldKey: string, formData: any): string {
  const brandName = formData.brandName ? formData.brandName.trim() : "";
  const industry = formData.industry ? formData.industry.trim() : "";
  const nicheTopic = formData.nicheTopic ? formData.nicheTopic.trim() : "";
  const mainProduct = formData.mainProduct ? formData.mainProduct.trim() : "";
  const targetAudience = formData.targetAudience ? formData.targetAudience.trim() : "";
  const customerPainPoints = formData.customerPainPoints ? formData.customerPainPoints.trim() : "";

  switch (fieldKey) {
    case "userRole":
      return `Chuyên gia tư vấn thương hiệu ${brandName || "doanh nghiệp"} xuất sắc, tận tâm và giàu kinh nghiệm tuyển chọn thực tế trong lĩnh vực ${industry || "chuyên ngành"}.`;
    case "nicheTopic":
      return `Truyền thông kiến thức khoa học, hữu ích và giải pháp thực tế giúp giải quyết các băn khoăn lo lắng trực tiếp của khách hàng trong ngành ${industry || "sản phẩm"}.`;
    case "mainProduct":
      return `Các dòng sản phẩm/dịch vụ cốt lõi của ${brandName || "thương hiệu"}, cam kết an toàn, chất lượng vượt trội và thấu hiểu khách hàng sâu sắc.`;
    case "strengths":
      return `Đồng hành chăm sóc trực tiếp 1/1 bởi đội ngũ tâm huyết; giải pháp chuẩn khoa học an toàn; cam kết hiệu quả thực tế và bảo dưỡng trọn vẹn niềm tin.`;
    case "targetAudience":
      return `Nhóm khách hàng thông thái tuổi từ 25-45, đang loay hoay tìm kiếm một giải pháp an toàn cao, bền vững và thông minh trong ngách ${nicheTopic || "kinh doanh"}.`;
    case "customerPainPoints":
      return `Bị quá tải trước thông tin hỗn loạn ngoài thị trường; lo sợ mua phải hàng nhái kém chất lượng; đau đầu vì tốn nhiều ngân sách nhưng chưa có kết quả ưng ý.`;
    case "customerDesires":
      return `Tìm được một giải pháp phù hợp thể trạng thực tế giúp xử lý vấn đề tận gốc; có cuộc sống thảnh thơi an tâm và có thêm thời gian chăm sóc gia đình.`;
    case "customerBarriers":
      return `Ngần ngại chi phí đầu tư ban đầu; lo ngại cam kết chất lượng chưa kiểm chứng; sợ quy trình can thiệp hoặc sử dụng quá phức tạp tốn thời gian.`;
    case "customerMisconceptions":
      return `Nghĩ rằng chỉ cần mua sản phẩm đắt giá nhất là giải quyết được vấn đề ngay, mà bỏ quên yếu tố thiết lập lối sống lành mạnh và sự phù hợp thực tế.`;
    case "mustHaves":
      return `Gây ấn tượng bằng một dòng tiêu đề viết hoa kích thích tò mò; làm nổi bật trải nghiệm Trước - Sau chân thực; lồng ghép khéo léo câu chuyện của một khách hàng thực tế kèm lời kêu gọi hành động cụ thể.`;
    case "thingsToAvoid":
      return `Tuyệt đối tránh các từ ngữ nói quá, thổi phồng sai lệch chính sách; không dìm hàng đối thủ khác; không hạ giá bán liên miên làm giảm giá trị thương hiệu.`;
    case "forbiddenKeywords":
      return `Cam kết dứt điểm 100%, trị dứt điểm, bảo hành trọn vẹn trọn đời, rẻ nhất, chữa khỏi hoàn hoàn, hiệu quả tức thì`;
    case "replacementKeywords":
      return `Hỗ trợ cải thiện rõ rệt tự nhiên, giải pháp chất lượng chuẩn khoa học lành tính, đồng hành chăm sóc cá nhân hóa, tối ưu hóa chi phí bền vững`;
    default:
      return "";
  }
}

function getLocalFallbackEnhancement(prompt: string, action: string): string {
  const cleaned = prompt.trim();
  switch (action) {
    case "shorten": {
      const lines = cleaned.split("\n");
      const shortened = lines.filter(line => {
        if (line.includes("Lồng ghép tinh tế câu chuyện") || line.includes("bắt đầu phác thảo bất cứ")) {
          return false;
        }
        return true;
      });
      return shortened.join("\n") + "\n\n*(Lưu ý: Nội dung đã được rút gọn súc tích bằng hệ thống quy chuẩn cục bộ)*";
    }
    case "expand": {
      return cleaned + `\n\n## 21. CHỈ DẪN CHUYÊN SÂU BỔ SUNG (ADVANCED CORE GUIDELINES)\n- Phân tích chi tiết hành vi tâm lý người tiêu dùng trước khi bắt đầu phác thảo bất cứ định dạng bài đăng nào.\n- Sử dụng phương pháp kể chuyện (Storytelling Frame) kết nối trực tiếp đến nỗi đau lớn nhất và khát khao thầm kín của khách hàng mục tiêu.\n- Kiểm thử nghiêm ngặt mọi từ ngữ đầu ra với danh sách từ ngữ nhạy cảm bị cấm và đối chiếu danh sách thay thế an toàn.\n- Thiết lập kịch bản dự phòng khi đối diện với thắc mắc trái chiều về sản phẩm hoặc dịch vụ.\n- Định hình phong cách viết kết hợp nhịp điệu ngắn dài linh hoạt giúp duy trì sự tập trung tối đa của độc giả.`;
    }
    case "chatgpt": {
      return cleaned + `\n\n## 21. CHỈ DẪN KỸ THUẬT TƯƠNG THÍCH CHATGPT (OPENAI GPT-4 OPTIMIZED)\n- Hoạt động tối ưu dưới cấu trúc Role-Play của ChatGPT (GPT-4 / GPT-4o / GPTs của OpenAI). Hãy phân tích "Chain of Thought" (Suy nghĩ từng bước từ A đến Z) một cách thầm lặng trước khi xuất đầu ra.\n- Tuân thủ nghiêm ngặt các ranh giới hệ thống, sử dụng cấu trúc khối JSON hoặc bảng Markdown chuyên nghiệp nếu được yêu cầu đặc biệt.\n- Định hình phong cách viết tự nhiên, tránh lặp lại các khuôn mẫu sáo rỗng thường thấy của AI.\n- Ưu tiên cấu trúc định dạng dữ liệu rõ ràng bằng thẻ XML (e.g., <thought>, <response>).`;
    }
    case "gemini": {
      return cleaned + `\n\n## 21. CHỈ DẪN AN TOÀN & TỐI ƯU HÓA CHO GOOGLE GEMINI (GEMINI CORE OPTIMIZED)\n- Tận dụng tối đa khả năng xử lý ngữ cảnh cực lớn (Long Context Window) để truy xuất và đối chiếu chính xác bối cảnh thương hiệu và sản phẩm chính.\n- Thực thi quy trình tự giám sát lỗi (Self-Correction Loop) trước khi hoàn tất phản hồi để loại bỏ triệt để từ bị cấm.\n- Giữ mạch văn phong tinh tế, thực tế, chân thành, kết nối khéo léo giá trị tự nhiên của sản phẩm.\n- Tối ưu hóa phản hồi song song với cấu trúc suy luận nhiều góc nhìn logic từ sơ bộ đến chi tiết.`;
    }
    default: {
      return cleaned + `\n\n## 21. QUY CHUẨN DIỄN ĐẠT & LĂP THUẬT CHUYÊN NGHIỆP CẢI TIẾN\n- Tránh tất cả các sáo rỗng thường thấy của máy móc văn mẫu, tập trung diễn đạt thấu cảm con người (Human-like tone).\n- Cắt gọt các tính từ thừa thãi để thông điệp trở nên sắc sảo, dứt khoát và cực kỳ đáng tin cậy.\n- Đảm bảo tính liên kết xuyên suốt từ tệp khách hàng mục tiêu đến từ khóa bắt buộc tránh và từ khóa khuyên dùng thay thế.`;
    }
  }
}

// Helper to get friendly user error message when high demand or transient 503/429
function getFriendlyErrorMessage(err: any): string {
  const errMsg = (err?.message || String(err)).toLowerCase();
  const errStatus = String(err?.status || err?.error?.status || "").toLowerCase();
  const errStatusCode = String(err?.statusCode || err?.error?.code || "");

  const isQuotaExceeded =
    errStatus.includes("resource_exhausted") ||
    errStatusCode.includes("429") ||
    errMsg.includes("429") ||
    errMsg.includes("quota") ||
    errMsg.includes("rate limit") ||
    errMsg.includes("resource exhausted");

  if (isQuotaExceeded) {
    return "Hạn mức yêu cầu (Quota) của các khóa API Gemini hiện tại đã tạm thời tối đa. Hệ thống đã thử các mô hình dự phòng cũng như chuyển đổi khóa nhưng đều quá tải hoặc hết hạn ngạch. Bạn hãy kiểm tra lại cấu hình hoặc đợi vài giây rồi nhấn gửi lại nhé!";
  }

  const isTransient = 
    errStatus.includes("unavailable") || 
    errStatusCode.includes("503") ||
    errMsg.includes("503") || 
    errMsg.includes("unavailable") || 
    errMsg.includes("high demand") || 
    errMsg.includes("bận") ||
    errMsg.includes("quá tải") ||
    errMsg.includes("temporary");

  if (isTransient) {
    return "Các máy chủ AI hiện tại đang quá tải hoặc bận đột xuất (Lỗi 503 Service Unavailable). Hệ thống đã cố gắng thử lại nhiều lần nhưng chưa thành công. Bạn vui lòng bấm gửi lại sau khoảng 3 giây nhé!";
  }

  return err?.message || String(err);
}

// Helper to call DeepSeek Chat completion API natively
async function queryDeepSeekWithFallback(
  keys: string[],
  params: {
    systemInstruction: string;
    userPrompt: string;
    temperature: number;
  }
): Promise<string> {
  let lastError: any = null;

  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const key = keys[keyIdx];
    const endpoints = [
      "https://api.deepseek.com/chat/completions",
      "https://api.deepseek.com/v1/chat/completions"
    ];

    for (const endpoint of endpoints) {
      const maxRetries = 2;
      let delay = 1000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[DeepSeek API] Key #${keyIdx + 1} (starts with ${key.substring(0, 6)}), endpoint ${endpoint}, attempt ${attempt}/${maxRetries}...`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${key}`
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                { role: "system", content: params.systemInstruction },
                { role: "user", content: params.userPrompt }
              ],
              temperature: params.temperature,
              max_tokens: 3000
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP Error ${response.status}: ${errorBody || response.statusText}`);
          }

          const data: any = await response.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) {
            console.log(`[DeepSeek API] Success with Key #${keyIdx + 1}`);
            return text;
          }

          throw new Error("Không nhận được nội dung phản hồi từ mẫu DeepSeek.");
        } catch (err: any) {
          lastError = err;
          console.warn(`[DeepSeek API] Key #${keyIdx + 1} failed:`, err.message || err);
          
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 1.5;
          }
        }
      }
    }
  }

  throw lastError || new Error("Tất cả khóa DeepSeek và các đầu phát đều thất bại.");
}

// Unified orchestrator: Try Gemini keys first, then fall back to DeepSeek keys
async function generateAIContent(params: {
  systemInstruction: string;
  userPrompt: string;
  temperature: number;
}): Promise<string> {
  const geminiKeys = getGeminiApiKeys();
  const deepseekKeys = getDeepSeekApiKeys();

  if (geminiKeys.length === 0 && deepseekKeys.length === 0) {
    throw new Error("NO_API_KEYS_CONFIGURED");
  }

  let lastError: any = null;

  // 1. Prioritize Gemini Keys
  if (geminiKeys.length > 0) {
    console.log(`[AI Engine] Trình tự: Thử nghiệm ${geminiKeys.length} khóa Gemini API...`);
    
    for (let keyIdx = 0; keyIdx < geminiKeys.length; keyIdx++) {
      const key = geminiKeys[keyIdx];
      console.log(`[AI Engine] Khóa Gemini #${keyIdx + 1} (bắt đầu bằng ${key.substring(0, 6)})...`);
      
      try {
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
        
        for (const model of models) {
          const maxRetries = 2;
          let delay = 800; // Fast retry
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              console.log(`  -> Mô hình ${model} (Thử ${attempt}/${maxRetries})...`);
              const response = await ai.models.generateContent({
                model: model,
                contents: params.userPrompt,
                config: {
                  systemInstruction: params.systemInstruction,
                  temperature: params.temperature,
                },
              });

              if (response && response.text) {
                console.log(`[AI Engine] [Thành công] Gemini ${model} với Khóa #${keyIdx + 1}`);
                return response.text;
              }

              throw new Error("Mô hình trả về phản hồi rỗng.");
            } catch (err: any) {
              lastError = err;
              const errMessage = err?.message || String(err);
              const errStatus = String(err?.status || err?.error?.status || "");
              const errStatusCode = String(err?.statusCode || err?.error?.code || "");

              // Parse JSON embedded in message if present
              let apiStatus = "";
              let apiCode = "";
              try {
                if (errMessage.trim().startsWith("{") && errMessage.trim().endsWith("}")) {
                  const parsed = JSON.parse(errMessage);
                  if (parsed?.error) {
                    apiStatus = String(parsed.error.status || "");
                    apiCode = String(parsed.error.code || "");
                  } else if (parsed?.code || parsed?.status) {
                    apiStatus = String(parsed.status || "");
                    apiCode = String(parsed.code || "");
                  }
                }
              } catch (_) {}

              const finalStatus = (errStatus || apiStatus).toLowerCase();
              const finalCode = (errStatusCode || apiCode);
              const errMessageLower = errMessage.toLowerCase();

              const isQuota =
                finalStatus.includes("resource_exhausted") ||
                finalCode.includes("429") ||
                errMessageLower.includes("429") ||
                errMessageLower.includes("quota") ||
                errMessageLower.includes("rate limit") ||
                errMessageLower.includes("resource exhausted");

              const isTransient = 
                finalStatus.includes("unavailable") || 
                finalCode.includes("503") ||
                errMessageLower.includes("503") || 
                errMessageLower.includes("unavailable") || 
                errMessageLower.includes("high demand");

              if (isQuota) {
                console.log(`  -> [Hạn mức 429] Mô hình ${model} với Khóa #${keyIdx + 1} hết hạn ngạch ngày. Sẽ chuyển nguồn thông tin phù hợp.`);
                break; // Break retry loops for this model
              } else if (isTransient) {
                console.log(`  -> [Môi trường bận 503] Thử lại sau giây lát...`);
                if (attempt < maxRetries) {
                  await new Promise((resolve) => setTimeout(resolve, delay));
                  delay *= 1.5;
                } else {
                  break;
                }
              } else {
                console.log(`  -> [Khởi động lỗi khác]`, errMessageLower.substring(0, 150));
                break; // Switch mode/key immediately on fatals
              }
            }
          }
        }
      } catch (keyErr: any) {
        console.error(`Không thể khởi chạy Gemini với khóa #${keyIdx + 1}:`, keyErr.message || keyErr);
        lastError = keyErr;
      }
    }
  }

  // 2. Fall back to DeepSeek pool
  if (deepseekKeys.length > 0) {
    console.log(`[AI Engine] Khóa Gemini hết hạn ngạch/gặp lỗi. Đang chuyển sang dự phòng ${deepseekKeys.length} khóa DeepSeek...`);
    try {
      const text = await queryDeepSeekWithFallback(deepseekKeys, params);
      return text;
    } catch (dsErr: any) {
      console.error("[AI Engine] Dự phòng DeepSeek cũng thất bại:", dsErr.message || dsErr);
      lastError = dsErr;
    }
  }

  throw lastError || new Error("Mọi mô hình AI và khóa dự phòng thiết lập đều không thành công.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON bodies
  app.use(express.json({ limit: '10mb' }));

  // API endpoints
  app.post("/api/gemini/enhance", async (req, res) => {
    try {
      const { prompt, action } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt content" });
      }

      // Check if any keys are configured
      const geminiKeys = getGeminiApiKeys();
      const deepseekKeys = getDeepSeekApiKeys();

      if (geminiKeys.length === 0 && deepseekKeys.length === 0) {
        console.log("[AI Engine] No API keys configured, returning local rule enhancement.");
        const fallbackText = getLocalFallbackEnhancement(prompt, action);
        return res.json({
          result: fallbackText,
          isFallback: true,
          fallbackReason: "MISSING_KEYS"
        });
      }

      let systemInstruction = "Bạn là chuyên gia kỹ thuật học lệnh (Prompt Engineer) xuất sắc nhất thế giới. Nhiệm vụ của bạn là nhận vào một Prompt Master bằng tiếng Việt và cải thiện, tối ưu hóa hoặc biến đổi nó dựa theo yêu cầu của người dùng, giữ nguyên bản chất chuyên sâu và cấu trúc gốc tiếng Việt, định dạng markdown đẹp mắt.";
      let userPrompt = "";

      switch (action) {
        case "shorten":
          userPrompt = `Hãy rút gọn Prompt Master sau thành một phiên bản tối giản, súc tích hơn nhưng vẫn giữ nguyên tất cả vai trò, các quy tắc cốt lõi, từ khóa cần tránh và định dạng đầu ra. Bỏ bớt các từ ngữ rườm rà. Bạn hãy phản hồi bằng chính Prompt Master đã rút gọn trong định dạng Markdown (Không thêm các lời giải thích thừa thãi bên ngoài):

${prompt}`;
          break;
        case "expand":
          userPrompt = `Hãy mở rộng Prompt Master sau thành một bản cực kỳ chi tiết và chuyên sâu (khoảng gấp 1.5 lần độ dài cũ). Thêm vào nhiều hướng dẫn tư duy chi tiết hơn, mô tả kỹ lưỡng hơn về tâm lý khách hàng, tích hợp thêm các tình huống phản hồi cụ thể, và tăng tính thực tế của các định dạng đầu ra. Hãy phản hồi hoàn toàn bằng Prompt Master đã mở rộng dưới dạng Markdown:

${prompt}`;
          break;
        case "chatgpt":
          userPrompt = `Hãy tối ưu hóa Prompt Master sau để chạy hiệu quả nhất và tương thích tốt nhất với ChatGPT (GPT-4 / GPT-4o / GPTs của OpenAI). Hãy thêm các chỉ dẫn định dạng dữ liệu (JSON/Markdown), hướng dẫn kỹ thuật suy nghĩ từng bước "Chain-of-Thought" phù hợp với LLM của OpenAI và định hình cụ thể khung phản hồi. Phản hồi bằng Prompt Master đã tối ưu hóa dưới dạng Markdown:

${prompt}`;
          break;
        case "gemini":
          userPrompt = `Hãy tối ưu hóa Prompt Master sau để chạy xuất sắc nhất trên Google Gemini (tận dụng thế mạnh xử lý ngữ cảnh cực lớn, định hướng suy nghĩ logic tự nhiên, và cấu trúc hóa các ranh giới quy tắc rõ ràng). Phản hồi bằng Prompt Master đã tối ưu hóa dưới dạng Markdown:

${prompt}`;
          break;
        default:
          userPrompt = `Hãy tối ưu hóa và sửa lỗi chính tả, cải thiện cách diễn đạt của Prompt Master sau để nó mạch lạc, rõ ràng và chuyên nghiệp hơn, giữ nguyên 100% tất cả các trường dữ liệu. Phản hồi bằng Prompt Master đã tối ưu hóa dưới dạng Markdown:

${prompt}`;
      }

      const enhancedText = await generateAIContent({
        systemInstruction: systemInstruction,
        userPrompt: userPrompt,
        temperature: 0.3,
      });

      return res.json({ result: enhancedText });
    } catch (err: any) {
      console.error("Gemini API Error, activating local fallback:", err);
      try {
        const fallbackText = getLocalFallbackEnhancement(req.body.prompt, req.body.action);
        return res.json({
          result: fallbackText,
          isFallback: true,
          fallbackReason: "API_ERROR",
          apiError: err?.message || String(err)
        });
      } catch (fbErr) {
        const friendlyMsg = getFriendlyErrorMessage(err);
        return res.status(500).json({ error: "Lỗi hệ thống khi gọi AI: " + friendlyMsg });
      }
    }
  });

  // API endpoint for suggestion of important fields based on inputs
  app.post("/api/gemini/suggest-field", async (req, res) => {
    try {
      const { fieldKey, formData } = req.body;
      if (!fieldKey || !formData) {
        return res.status(400).json({ error: "Thiếu thông tin yêu cầu" });
      }

      // Check if any keys are configured
      const geminiKeys = getGeminiApiKeys();
      const deepseekKeys = getDeepSeekApiKeys();

      if (geminiKeys.length === 0 && deepseekKeys.length === 0) {
        console.log(`[AI Engine] No API keys configured, returning local rule suggestion for ${fieldKey}`);
        const fallbackSuggestion = getLocalFallbackSuggestion(fieldKey, formData);
        return res.json({
          suggestion: fallbackSuggestion,
          isFallback: true,
          fallbackReason: "MISSING_KEYS"
        });
      }

      const { brandName, industry, nicheTopic, mainProduct, strengths, targetAudience, customerPainPoints } = formData;
      
      let promptText = "";
      let fieldFieldName = "";

      switch (fieldKey) {
        case "userRole":
          fieldFieldName = "Vai trò trên hệ thống khi AI xưng hô";
          promptText = `Dựa trên bối cảnh:
- Tên cá nhân/Thương hiệu: ${brandName || "Chưa rõ"}
- Lĩnh vực: ${industry || "Chưa rõ"}
- Ngách cụ thể: ${nicheTopic || "Chưa rõ"}

Hãy gợi ý một danh xưng / vai trò ngắn gọn (nhỏ hơn 15 từ) để AI đóng vai chính xác nhất trong Prompt Master. Ví dụ: "Dược sĩ tư vấn chuyên môn", "Chuyên gia làm đẹp với 10 năm kinh nghiệm sáng lập", "Chuyên viên tư vấn tài chính cá nhân thực chiến". Chỉ trả về duy nhất chuỗi văn bản gợi ý này, không giải thích gì thêm, không bọc dấu ngoặc kép.`;
          break;

        case "nicheTopic":
          fieldFieldName = "Chuyên đề / Ngách cụ thể muốn sáng tạo";
          promptText = `Dựa trên bối cảnh:
- Tên cá nhân/Thương hiệu: ${brandName || "Chưa rõ"}
- Lĩnh vực: ${industry || "Chưa rõ"}

Hãy gợi ý một mô tả chuyên đề/ngách cụ thể thiết thực (khoảng 15-25 từ) để AI hướng mục tiêu sáng tạo nội dung hiệu quả. Ví dụ: "Tư vấn dinh dưỡng khoa học và giải pháp chăm sóc sức khỏe chủ động cho mẹ bầu và em bé", "Chia sẻ bí quyết chăm sóc da mụn nhạy cảm và trẻ hóa da chuẩn y khoa tại nhà". Chỉ trả về duy nhất chuỗi nội dung gợi ý này, không thêm bất kỳ văn bản giải thích hay bọc dấu ngoặc nào.`;
          break;

        case "mainProduct":
          fieldFieldName = "Sản phẩm / Dịch vụ chính";
          promptText = `Dựa trên bối cảnh:
- Tên cá nhân/Thương hiệu: ${brandName || "Chưa rõ"}
- Lĩnh vực: ${industry || "Chưa rõ"}
- Chuyên đề/ngách: ${nicheTopic || "Chưa rõ"}

Hãy gợi ý sản phẩm dịch vụ chính phù hợp cao nhất (khoảng 10-25 từ). Ví dụ: "Các sản phẩm sữa sinh học giúp bổ sung canxi tự nhiên và thúc đẩy tiêu hóa tốt cho trẻ", "Dịch vụ thiết kế và hoàn thiện nội thất căn hộ đồng hành từ ý tưởng đến thực thi". Chỉ trả về duy nhất chuỗi nội dung gợi ý, không giải thích.`;
          break;

        case "strengths":
          fieldFieldName = "Điểm mạnh / Thế mạnh vượt trội";
          promptText = `Dựa trên bối cảnh:
- Lĩnh vực: ${industry || "Chưa rõ"}
- Sản phẩm chính: ${mainProduct || "Chưa rõ"}

Hãy gợi ý từ 2 đến 3 thế mạnh cốt lõi nổi trội, diễn đạt ngắn gọn mạch lạc trong một dòng (khoảng 20-35 từ). Ví dụ: "Đồng hành trực tiếp bởi chuyên gia giàu kinh nghiệm chuẩn y khoa; giải pháp an toàn cao, cam kết hỗ trợ đồng hành trọn đời". Chỉ trả về một câu gợi ý này.`;
          break;

        case "targetAudience":
          fieldFieldName = "Khách hàng mục tiêu";
          promptText = `Dựa trên bối cảnh:
- Thương hiệu: ${brandName || "Chưa rõ"}
- Lĩnh vực: ${industry || "Chưa rõ"}
- Sản phẩm/Dịch vụ: ${mainProduct || "Chưa rõ"}

Hãy phác hoạt chân dung một nhóm khách hàng mục tiêu rõ ràng và thực tiễn nhất (khoảng 15-30 từ). Ví dụ: "Nhóm mẹ bỉm bận rộn nuôi con từ 1-5 tuổi, mong muốn chăm con khỏe mạnh, an toàn và hạn chế lạm dụng kháng sinh". Chỉ trả về đúng dòng gợi ý đó.`;
          break;

        case "customerPainPoints":
          fieldFieldName = "Nỗi đau, vấn đề khó khăn lớn nhất của khách hàng";
          promptText = `Dựa trên bối cảnh:
- Lĩnh vực: ${industry || "Chưa rõ"}
- Khách hàng mục tiêu: ${targetAudience || "Chưa rõ"}
- Sản phẩm chính: ${mainProduct || "Chưa rõ"}

Hãy chỉ ra những đau khổ, lo lắng, băn khoăn chân thực nhất mà nhóm khách hàng này phải đối mặt mỗi ngày (khoảng 20-40 từ). Ví dụ: "Loay hoay đổi nhiều giải pháp nhưng không cải thiện; sợ mua phải hàng nhái kém chất lượng gây hại sức khỏe; áp lực mệt mỏi vì thiếu kinh nghiệm thực tế". Chỉ trả về đúng gợi ý thô.`;
          break;

        case "customerDesires":
          fieldFieldName = "Niềm khát khao hoặc mong ước thầm kín";
          promptText = `Dựa trên bối cảnh:
- Khách hàng mục tiêu: ${targetAudience || "Chưa rõ"}
- Nỗi đau lớn nhất: ${customerPainPoints || "Chưa rõ"}

Hãy nêu mong muốn / khao khát sâu xa nhất của họ (khoảng 20-40 từ). Ví dụ: "Tìm được giải pháp an toàn tối ưu chi phí giúp giải quyết vấn đề triệt để; có cuộc sống yên tâm thảnh thơi và có thêm thời gian chăm sóc bản thân". Chỉ trả về gợi ý văn bản trực tiếp.`;
          break;

        case "customerBarriers":
          fieldFieldName = "Rào cản khiến khách hàng chần chừ chưa mua";
          promptText = `Dựa trên bối cảnh:
- Khách hàng mục tiêu: ${targetAudience || "Chưa rõ"}
- Sản phẩm chính: ${mainProduct || "Chưa rõ"}

Hãy phác thảo rào cản tâm lý khiến họ ngần ngại bỏ tiền ra (khoảng 20-40 từ). Ví dụ: "E ngại giá thành cao, chưa thực sự tin tưởng hiệu quả lâu dài do từng trải qua nhiều lần thất bại; sợ quy trình sử dụng phức tạp tốn thời gian". Chỉ trả về gợi ý thô.`;
          break;

        case "customerMisconceptions":
          fieldFieldName = "Hiểu sai phổ biến của khách hàng";
          promptText = `Dựa trên bối cảnh:
- Lĩnh vực/Ngành nghề: ${industry || "Chưa rõ"}
- Khách hàng mục tiêu: ${targetAudience || "Chưa rõ"}

Hãy chỉ ra một lỗi hiểu sai phổ biến, rập khuôn mà nhiều khách hàng mắc phải để làm tư liệu phản bác (khoảng 20-40 từ). Ví dụ: "Cứ ốm sốt là tự ý mua kháng sinh uống ngay mà không biết là do virus; nghĩ rằng các giải pháp tự nhiên ngoài thị trường đều hoàn toàn vô hại". Chỉ trả về nội dung trực tiếp.`;
          break;

        case "mustHaves":
          fieldFieldName = "Điều bắt buộc phải có trong nội dung";
          promptText = `Dựa trên bối cảnh:
- Lĩnh vực: ${industry || "Chưa rõ"}
- Sản phẩm chính: ${mainProduct || "Chưa rõ"}

Hãy đề xuất quy tắc bắt buộc khôn ngoan khi truyền tải thông điệp (khoảng 20-35 từ). Ví dụ: "Bắt đầu bằng một câu Hook kích thích tò mò cao; lồng ghép các cam kết an toàn lành tính cùng thông tin liên hệ và lời kêu gọi hành động cụ thể". Chỉ trả về nội dung trực tiếp tốt nhất.`;
          break;

        case "thingsToAvoid":
          fieldFieldName = "Những chi tiết cần tránh tuyệt đối";
          promptText = `Dựa trên bối cảnh:
- Lĩnh vực: ${industry || "Chưa rõ"}
- Khách hàng mục tiêu: ${targetAudience || "Chưa rõ"}

Hãy đưa ra chi tiết nhạy cảm nên tránh để đảm bảo thông tin chuyên nghiệp (khoảng 20-40 từ). Ví dụ: "Tránh xa những từ ngữ mang tính phóng đại quá đà, tuyệt đối không hứa hẹn phi thực tế và tránh hạ thấp dìm hàng đối thủ khác trong ngành". Chỉ trả về nội dung trực tiếp.`;
          break;

        case "forbiddenKeywords":
          fieldFieldName = "Từ khóa không được phép dùng";
          promptText = `Dựa trên Lĩnh vực hoạt động: ${industry || "Chưa rõ"}.
Hãy đề xuất từ 3 đến 5 từ khóa/cụm từ cực đoan, vi phạm chính sách của Facebook/TikTok cần tránh. Ví dụ: "Cam kết dứt điểm 100%, bảo hành trọn đời, chữa khỏi hoàn toàn, cam đoan hiệu quả". Chỉ trả về các từ ngăn cách bằng dấu phẩy.`;
          break;

        case "replacementKeywords":
          fieldFieldName = "Từ khóa dùng để thay thế";
          promptText = `Dựa trên Lĩnh vực hoạt động: ${industry || "Chưa rõ"}.
Hãy đề xuất các cụm từ uyển chuyển, an toàn và khoa học hơn (khoảng 15-30 từ). Ví dụ: "Hỗ trợ cải thiện rõ rệt, đồng hành cải thiện sức khỏe, giải pháp lành tính hiệu quả cao". Chỉ trả về nội dung.`;
          break;

        default:
          return res.status(400).json({ error: "Trường dữ liệu không hợp lệ" });
      }

      const systemInstruction = `Bạn là một trợ lý Copywriting chuyên sâu, dày dặn kinh nghiệm thiết lập thương hiệu và lập kế hoạch nội dung truyền thông bằng tiếng Việt.
Hãy đưa ra một gợi ý nội dung ngắn gọn, tự nhiên, chuyên nghiệp và có chiều sâu cho trường thông tin "${fieldFieldName}".
Gợi ý này phải khớp hoàn hảo với bối cảnh thương hiệu, lĩnh vực và các thông tin liên quan đã được cung cấp.
Hạn chế tối đa dùng lại đúng từng từ ví dụ, hãy sáng tạo nội dung phù hợp riêng biệt cho thông tin của thương hiệu này.
QUY TẮC BẮT BUỘC: Chỉ trả về độc nhất phần nội dung gợi ý thô bằng tiếng Việt, tuyệt đối KHÔNG thêm bất kỳ câu dẫn dắt, lời mở đầu, dán nhãn ("Gợi ý cho bạn:", "Đáp án:"), ký tự đặc biệt hay dấu ngoặc kép bọc ngoài nào cả, không có định dạng Markdown.`;

      const responseText = await generateAIContent({
        systemInstruction: systemInstruction,
        userPrompt: promptText,
        temperature: 0.7,
      });

      const suggestion = responseText ? responseText.trim().replace(/^['"“]|['"”]$/g, '') : "";
      return res.json({ suggestion });
    } catch (err: any) {
      console.error("Gemini Suggestion API Error, switching to local fallback:", err);
      try {
        const fallbackSuggestion = getLocalFallbackSuggestion(req.body.fieldKey, req.body.formData);
        return res.json({
          suggestion: fallbackSuggestion,
          isFallback: true,
          fallbackReason: "API_ERROR",
          apiError: err?.message || String(err)
        });
      } catch (fbErr) {
        const friendlyMsg = getFriendlyErrorMessage(err);
        return res.status(500).json({ error: "Không thể lấy gợi ý bằng AI: " + friendlyMsg });
      }
    }
  });

  // Serve static files / Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
