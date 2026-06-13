function parseRequestBody(init?: RequestInit): any {
  const rawBody = init?.body;

  if (!rawBody) return {};
  if (typeof rawBody === "string") {
    try {
      return JSON.parse(rawBody);
    } catch {
      return {};
    }
  }

  return {};
}

function getLocalFallbackSuggestion(fieldKey: string, formData: any = {}): string {
  const brandName = formData?.brandName?.trim?.() || "";
  const industry = formData?.industry?.trim?.() || "";
  const nicheTopic = formData?.nicheTopic?.trim?.() || "";

  switch (fieldKey) {
    case "userRole":
      return `Chuyên gia tư vấn thương hiệu ${brandName || "doanh nghiệp"} giàu kinh nghiệm trong lĩnh vực ${industry || "chuyên ngành"}.`;
    case "nicheTopic":
      return `Chia sẻ kiến thức, kinh nghiệm và giải pháp thực tế trong ngành ${industry || "sản phẩm/dịch vụ"} theo hướng dễ hiểu, gần gũi.`;
    case "mainProduct":
      return `Các sản phẩm/dịch vụ cốt lõi của ${brandName || "thương hiệu"}, tập trung vào chất lượng, sự phù hợp và trải nghiệm khách hàng.`;
    case "strengths":
      return "Tư vấn tận tâm, nội dung dễ hiểu, giải pháp phù hợp thực tế và luôn ưu tiên niềm tin dài hạn của khách hàng.";
    case "targetAudience":
      return `Nhóm khách hàng đang quan tâm đến ${nicheTopic || industry || "giải pháp phù hợp"}, cần thông tin rõ ràng trước khi ra quyết định.`;
    case "customerPainPoints":
      return "Bị nhiễu thông tin, khó phân biệt giải pháp phù hợp, lo tốn tiền nhưng chưa đạt kết quả như mong muốn.";
    case "customerDesires":
      return "Muốn tìm một hướng đi an toàn, dễ áp dụng, phù hợp điều kiện thực tế và có người đồng hành đáng tin cậy.";
    case "customerBarriers":
      return "Còn e ngại về chi phí, chưa đủ niềm tin, sợ lựa chọn sai hoặc chưa hiểu rõ cách áp dụng giải pháp.";
    case "customerMisconceptions":
      return "Nghĩ rằng chỉ cần chọn sản phẩm/dịch vụ đắt nhất là phù hợp, mà bỏ qua nhu cầu và bối cảnh cá nhân.";
    case "mustHaves":
      return "Luôn có hook rõ ràng, nội dung dễ hiểu, ví dụ thực tế, CTA mềm và tránh hứa hẹn quá mức.";
    case "thingsToAvoid":
      return "Tránh phóng đại, cam kết tuyệt đối, dìm hàng đối thủ, dùng từ gây hiểu nhầm hoặc vi phạm chính sách nền tảng.";
    case "forbiddenKeywords":
      return "cam kết 100%, trị tận gốc, chữa khỏi hoàn toàn, hiệu quả tức thì, thuốc thần kỳ";
    case "replacementKeywords":
      return "hỗ trợ cải thiện dần, giải pháp phù hợp, đồng hành chăm sóc, góp phần nâng cao trải nghiệm";
    default:
      return "Gợi ý nội dung an toàn, rõ ràng, phù hợp với bối cảnh thương hiệu đã nhập.";
  }
}

function getLocalFallbackEnhancement(prompt: string, action: string): string {
  const cleaned = String(prompt || "").trim();
  if (!cleaned) return "";

  if (action === "shorten") {
    return `${cleaned}\n\n*(Máy chủ AI chưa trả JSON hợp lệ, hệ thống đã giữ nội dung gốc để bạn tiếp tục sử dụng.)*`;
  }

  if (action === "expand") {
    return `${cleaned}\n\n## BỔ SUNG CHUYÊN SÂU\n- Viết tự nhiên, rõ ràng, tránh sáo rỗng.\n- Bám sát chân dung khách hàng và mục tiêu nội dung.\n- Rà soát từ khóa nhạy cảm trước khi xuất bản.`;
  }

  if (action === "chatgpt") {
    return `${cleaned}\n\n## TỐI ƯU CHO CHATGPT\n- Trả lời bằng Markdown rõ ràng.\n- Giữ đúng vai trò chuyên gia đã thiết lập.\n- Không thêm thông tin ngoài dữ liệu người dùng cung cấp.`;
  }

  if (action === "gemini") {
    return `${cleaned}\n\n## TỐI ƯU CHO GEMINI\n- Tận dụng ngữ cảnh dài.\n- Giữ logic nhất quán.\n- Tránh bịa chi tiết khi chưa có dữ liệu.`;
  }

  return `${cleaned}\n\n## TỐI ƯU DIỄN ĐẠT\n- Diễn đạt mạch lạc hơn.\n- Giữ nguyên logic Prompt Master.\n- Tránh phóng đại hoặc cam kết tuyệt đối.`;
}

function buildFallbackResponse(url: string, init?: RequestInit): Response {
  const body = parseRequestBody(init);
  const path = url.toLowerCase();

  const payload = path.includes("/suggest-field")
    ? {
        suggestion: getLocalFallbackSuggestion(String(body?.fieldKey || ""), body?.formData || {}),
        isFallback: true,
        fallbackReason: "NON_JSON_API_RESPONSE",
        message: "Máy chủ chưa trả JSON hợp lệ, hệ thống đã dùng gợi ý dự phòng để app không bị lỗi.",
      }
    : {
        result: getLocalFallbackEnhancement(String(body?.prompt || ""), String(body?.action || "optimize")),
        isFallback: true,
        fallbackReason: "NON_JSON_API_RESPONSE",
        message: "Máy chủ chưa trả JSON hợp lệ, hệ thống đã dùng chế độ dự phòng để app không bị lỗi.",
      };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function installApiJsonGuard() {
  if (typeof window === "undefined") return;

  const marker = "__promptMasterApiJsonGuardInstalled";
  if ((window as any)[marker]) return;
  (window as any)[marker] = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const isGeminiApiCall = url.includes("/api/gemini/");

    if (!isGeminiApiCall) {
      return originalFetch(input, init);
    }

    try {
      const response = await originalFetch(input, init);
      const contentType = response.headers.get("content-type") || "";

      if (contentType.toLowerCase().includes("application/json")) {
        return response;
      }

      return buildFallbackResponse(url, init);
    } catch {
      return buildFallbackResponse(url, init);
    }
  };
}
