import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Sparkles, 
  Copy, 
  Download, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Zap, 
  ChevronRight, 
  Info, 
  Menu, 
  X, 
  Layers, 
  Volume2, 
  Cpu, 
  Smile, 
  HelpCircle,
  ThumbsUp
} from "lucide-react";
import { INDUSTRY_TEMPLATES } from "./templates";
import { FormData } from "./types";

const INITIAL_FORM_STATE: FormData = {
  brandName: "",
  userRole: "",
  industry: "",
  nicheTopic: "",
  experienceYears: "20 năm",
  mainProduct: "",
  strengths: "",
  goals: [],
  customGoal: "",
  mainPlatform: "Facebook cá nhân",
  targetAudience: "",
  customerPainPoints: "",
  customerDesires: "",
  customerBarriers: "",
  customerMisconceptions: "",
  toneOfVoice: "Có chuyên môn nhưng dễ hiểu",
  addressingStyle: "Tôi – bạn",
  requiredFormats: [],
  mustHaves: "",
  thingsToAvoid: "",
  forbiddenKeywords: "",
  replacementKeywords: ""
};

const SUGGESTED_GOALS = [
  "Viết content hằng ngày",
  "Tạo ý tưởng video",
  "Viết kịch bản video ngắn",
  "Viết bài Facebook",
  "Viết bài bán hàng",
  "Xây dựng thương hiệu cá nhân",
  "Chốt sale",
  "Chăm sóc khách hàng",
  "Đào tạo đội nhóm",
  "Lên kế hoạch content",
  "Phân tích insight khách hàng",
  "Viết livestream",
  "Tạo quy trình làm việc"
];

const SUGGESTED_FORMATS = [
  "Bài Facebook",
  "Kịch bản video ngắn",
  "Caption",
  "Hook mở đầu",
  "CTA",
  "Hashtag",
  "Bài bán hàng",
  "Bài chia sẻ kiến thức",
  "Lịch content",
  "Kịch bản livestream",
  "Tin nhắn chốt sale",
  "Tin nhắn chăm sóc khách hàng",
  "Kế hoạch đào tạo"
];

const EXPERIENCE_OPTIONS = ["5 năm", "10 năm", "15 năm", "20 năm", "30 năm"];

const TONE_OPTIONS = [
  "Gần gũi",
  "Chuyên gia",
  "Tự nhiên",
  "Mạnh mẽ",
  "Truyền cảm hứng",
  "Thuyết phục",
  "Nhẹ nhàng",
  "Sang trọng",
  "Thực chiến",
  "Hài hước nhẹ",
  "Đời thường",
  "Có chuyên môn nhưng dễ hiểu"
];

const PLATFORM_OPTIONS = [
  "Facebook cá nhân",
  "Fanpage",
  "TikTok",
  "Reels",
  "YouTube Shorts",
  "Zalo",
  "Website",
  "Livestream",
  "ChatGPT",
  "Gemini"
];

export default function App() {
  // State initialization with localStorage fallback
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem("prompt_master_creator_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure array safety
        return {
          ...INITIAL_FORM_STATE,
          ...parsed,
          goals: Array.isArray(parsed.goals) ? parsed.goals : [],
          requiredFormats: Array.isArray(parsed.requiredFormats) ? parsed.requiredFormats : []
        };
      }
    } catch (e) {
      console.error("Lỗi đọc dữ liệu nháp từ localStorage", e);
    }
    return INITIAL_FORM_STATE;
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isAutoSaved, setIsAutoSaved] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Custom generated prompt output
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isPromptLoading, setIsPromptLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Copy/Download feedback
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Field suggestions state
  const [suggestingField, setSuggestingField] = useState<string | null>(null);

  // Auto-save logic on data update
  useEffect(() => {
    localStorage.setItem("prompt_master_creator_draft", JSON.stringify(formData));
    setIsAutoSaved(true);
    const now = new Date();
    setLastSavedTime(
      now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );
    const timer = setTimeout(() => setIsAutoSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Handle template apply click
  const handleApplyTemplate = (id: string) => {
    const template = INDUSTRY_TEMPLATES.find((t) => t.id === id);
    if (template) {
      setFormData(prev => ({
        ...prev,
        ...template.formData,
        goals: template.formData.goals ? [...template.formData.goals] : [],
        requiredFormats: template.formData.requiredFormats ? [...template.formData.requiredFormats] : []
      }));
      setSelectedTemplateId(id);
      setAiSuccessMessage(`Đã áp dụng thành công mẫu: ${template.name}`);
      setTimeout(() => setAiSuccessMessage(null), 4000);
    }
  };

  // Safe reset
  const handleClearForm = () => {
    if (window.confirm("Bạn có chắc chắn muốn làm mới toàn bộ biểu mẫu? Toàn bộ nội dung đã nhập sẽ được xóa sạch.")) {
      setFormData(INITIAL_FORM_STATE);
      setSelectedTemplateId("");
      setGeneratedPrompt("");
      setActiveStep(1);
      setAiError(null);
      setAiSuccessMessage("Đã làm mới lại biểu mẫu chính!");
      setTimeout(() => setAiSuccessMessage(null), 3000);
    }
  };

  // Call Gemini to suggest field value based on current state
  const handleSuggestField = async (fieldKey: keyof FormData) => {
    // Basic verification of source parameters
    if (fieldKey !== "userRole" && fieldKey !== "nicheTopic") {
      if (!formData.brandName.trim() && !formData.industry.trim()) {
        setAiError("Vui lòng điền 'Tên cá nhân/thương hiệu' và 'Lĩnh vực hoạt động chính' ở Bước 1 trước để AI có đủ thông tin gợi ý chính xác nhất nhé!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setSuggestingField(fieldKey);
    setAiError(null);

    try {
      const response = await fetch("/api/gemini/suggest-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldKey, formData })
      });
      
      const resData = await response.json();
      if (response.status !== 200 || resData.error) {
        if (resData.errorType === "MISSING_API_KEY") {
          setAiError(resData.message);
        } else {
          setAiError(resData.error || "Có lỗi bất ngờ xảy ra khi gọi AI.");
        }
      } else if (resData.suggestion) {
        setFormData(prev => ({
          ...prev,
          [fieldKey]: resData.suggestion
        }));
        if (resData.isFallback) {
          setAiSuccessMessage(`✨ Đã điền gợi ý thông minh từ Bộ lọc Dự phòng Cục bộ thành công!`);
        } else {
          setAiSuccessMessage(`Đã tự động điền gợi ý thành công cho trường này!`);
        }
        setTimeout(() => setAiSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setAiError("Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setSuggestingField(null);
    }
  };

  // Generic Label and suggestion wrapper
  const renderFieldLabel = (labelName: string, fieldKey: keyof FormData, isRequired = false) => {
    const isFieldLoading = suggestingField === fieldKey;
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
        <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
          {labelName} {isRequired && <span className="text-rose-500">* bắt buộc</span>}
        </label>
        <button
          type="button"
          onClick={() => handleSuggestField(fieldKey)}
          disabled={suggestingField !== null}
          className={`text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
            isFieldLoading
              ? "bg-amber-50 border-amber-300 text-amber-700 animate-pulse"
              : "bg-indigo-50/70 hover:bg-indigo-50 border-indigo-100 hover:border-indigo-200 text-indigo-700 active:scale-95"
          } disabled:opacity-40 disabled:pointer-events-none disabled:transform-none`}
        >
          {isFieldLoading ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
              <span>Đang gợi ý...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Gợi ý nội dung</span>
            </>
          )}
        </button>
      </div>
    );
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleGoal = (goal: string) => {
    setFormData((prev) => {
      const current = prev.goals || [];
      const updated = current.includes(goal)
        ? current.filter((g) => g !== goal)
        : [...current, goal];
      return { ...prev, goals: updated };
    });
  };

  const handleToggleFormat = (format: string) => {
    setFormData((prev) => {
      const current = prev.requiredFormats || [];
      const updated = current.includes(format)
        ? current.filter((f) => f !== format)
        : [...current, format];
      return { ...prev, requiredFormats: updated };
    });
  };

  // Validation rules
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!formData.brandName.trim()) {
      errors.push("Vui lòng điền 'Tên cá nhân/thương hiệu' tại Bước 1.");
    }
    if (!formData.industry.trim()) {
      errors.push("Vui lòng điền 'Lĩnh vực/ngành nghề chính' tại Bước 1.");
    }
    if (!formData.nicheTopic.trim()) {
      errors.push("Vui lòng điền 'Chuyên đề/ngách muốn tạo' tại Bước 1.");
    }
    if (!formData.targetAudience.trim()) {
      errors.push("Vui lòng mô tả 'Khách hàng mục tiêu' của bạn tại Bước 3.");
    }
    return errors;
  }, [formData]);

  const isValid = validationErrors.length === 0;

  // Prompt compiler using pre-arranged values & fallback placeholders
  const assemblePromptMaster = (data: FormData): string => {
    const bName = data.brandName.trim() || "Chuyên gia của tôi";
    const uRole = data.userRole.trim() || "Chuyên gia tư vấn cấp cao";
    const ind = data.industry.trim() || "Ngành nghề tư vấn chia sẻ dịch vụ";
    const niche = data.nicheTopic.trim() || "Xây dựng nội dung đa kênh sáng tạo";
    const exp = data.experienceYears.trim() || "20 năm";
    const prod = data.mainProduct.trim() || "Các giải pháp và gói dịch vụ chất lượng cao";
    const strength = data.strengths.trim() || "Tận tâm, am hiểu tâm lý, có thâm niên kinh nghiệm thực tiễn phong phú";
    const plat = data.mainPlatform.trim() || "Đa nền tảng (Facebook, TikTok, Website, Zalo)";
    const audience = data.targetAudience.trim() || "Khách hàng đại chúng tìm kiếm sự tối ưu và hiệu quả";
    const pain = data.customerPainPoints.trim() || "Chưa tìm được định hướng đúng, thiếu thời gian và sợ tốn kém vô ích";
    const desire = data.customerDesires.trim() || "Sở hữu giải pháp đơn giản hóa mọi bước đi, an toàn và tối ưu doanh số";
    const barrier = data.customerBarriers.trim() || "Còn nhiều e ngại và hoang mang chưa củng cố niềm tin tuyệt đối";
    const miscon = data.customerMisconceptions.trim() || "Nghĩ rằng giải quyết vấn đề cực kỳ phức tạp và tốn kém tài chính khổng lồ";
    const tone = data.toneOfVoice.trim() || "Có chuyên môn nhưng kết hợp ngôn ngữ gần gũi, dễ tiếp thụ";
    const address = data.addressingStyle.trim() || "Tôi – bạn";
    const mHaves = data.mustHaves.trim() || "Luôn có câu giật tít thu hút (hook) chạm đúng nỗi đau độc giả, kết bài bằng CTA mời gọi tương tác tinh tế.";
    const avoid = data.thingsToAvoid.trim() || "Tránh phóng đại cam kết quá mức, tránh dùng các biệt ngữ chuyên môn quá hàn lâm gây khó hiểu.";
    const forbid = data.forbiddenKeywords.trim() || "Cam kết 100%, dứt điểm vĩnh viễn, trị tận gốc rễ rắc rối, thuốc thần kỳ";
    const replaceK = data.replacementKeywords.trim() || "Hỗ trợ cải thiện tích cực, giải pháp hỗ trợ thiết thực, đồng hành cải tiến bền bỉ";

    // Goals list formatting
    const goalsFormatted = data.goals.length > 0 
      ? data.goals.map((g) => `  - **${g}**: Tạo nội dung kích thích tương tác để thực hiện hóa mục tiêu này.`).join("\n")
      : "  - **Xây dựng nội dung giá trị**: Chia sẻ kiến thức bổ ích mỗi ngày.\n  - **Nâng tầm uy tín**: Thu hút độc giả trung thành và hỗ trợ các giải pháp.";

    const customGoalFormatted = data.customGoal.trim() ? `  - **Yêu cầu riêng biệt khác**: ${data.customGoal.trim()}` : "";

    // Formats formatting
    const formatsFormatted = data.requiredFormats.length > 0
      ? data.requiredFormats.map((f) => `  - **Dạng bài ${f}**: Viết đúng mẫu cấu trúc tiêu chuẩn cho định dạng này.`).join("\n")
      : "  - **Bài viết kiến thức Facebook**: Phân đoạn dòng thoáng đãng.\n  - **Kịch bản video ngắn**: Văn phong nói nhịp điệu nhanh lôi cuốn.";

    return `Từ bây giờ, bạn sẽ đóng vai trò là một chuyên gia nội dung đặc biệt và là cố vấn chiến lược thương hiệu xuất sắc bậc nhất. Bạn sẽ nhập vai hoàn toàn để trở thành một **${uRole}** cho thương hiệu **${bName}** hoạt động chính trong lĩnh vực **${ind}**.

Bạn là một chuyên gia gạo cội có hơn **${exp} kinh nghiệm thực chiến** trong mảng **${niche}**, am hiểu sâu sắc về dòng sản phẩm: **${prod}**.

Nhiệm vụ tối thượng của bạn là hỗ trợ tôi nghiên cứu tâm lý, lên ý tưởng và trực tiếp sản xuất nội dung đạt các mục tiêu cốt lõi sau:
${goalsFormatted}
${customGoalFormatted}

---

## 1. VAI TRÒ VÀ SỨ MỆNH CỦA AI
- Bạn đóng vai là một **${uRole}** ưu tú có **${exp} thâm niên**, đại diện cho **${bName}**.
- Bạn am hiểu tường tận nhu cầu, kiến thức chuyên môn và cấu trúc chuyển đổi đa kênh nền tảng **${plat}**.
- Mỗi câu chữ bạn tạo ra cần khẳng định uy tín, kiến thức uyên bác nhưng vẫn đảm bảo tính tương tác cao.

## 2. THÔNG TIN THƯƠNG HIỆU & SẢN PHẨM CỐT LÕI
- **Tên cá nhân/thương hiệu:** ${bName}
- **Lĩnh vực hoạt động:** ${ind}
- **Sản phẩm & Dịch vụ chính:** ${prod}
- **Điểm mạnh/Thế mạnh độc bản (USP):** ${strength}

## 3. CHÂN DUNG KHÁCH HÀNG MỤC TIÊU
- **Nhóm đối tượng chính:** ${audience}
- **Nỗi đau & Vấn đề lớn nhất của họ:** ${pain}
- **Mong muốn & Niềm khao khát sâu thẳm:** ${desire}
- **Rào cản tâm lý khiến họ ngần ngại chưa hành động:** ${barrier}

## 4. INSIGHT THỰC TẾ & SỰ HIỂU SAI (CONSUMER INSIGHT)
- **Insight tâm lý:** Khách hàng luôn lo lắng gặp phải tình trạng ${barrier}. Họ đề phòng lớp quảng cáo hoa mỹ và chỉ chấp nhận lắng nghe khi cảm nhận được sự đồng cảm sâu sắc.
- **Điều khách hàng hay hiểu lầm hàng đầu:** ${miscon}
-> Khi triển khai bài viết, AI hãy khéo léo biến những hiểu lầm này thành đòn bẩy kích thích tư duy mới của độc giả, chứng minh giải pháp khoa học từ ${bName}.

## 5. PHONG CÁCH GIỌNG VĂN (TONE OF VOICE) & CÁCH XƯNG HÔ
- **Giọng văn mong muốn:** ${tone}
- **Đại xưng hô bắt buộc:** Sử dụng đại từ xưng hô **"${address}"** trong tất cả các bài viết và kịch bản. Tuân thủ định hình mối quan hệ thân thiết, đáng tin cậy.

## 6. NGUYÊN TẮC SOẠN THẢO NỘI DUNG (HƯỚNG DẪN BẮT BUỘC)
- **Tiêu đề giật gân (Hook):** Luôn mở đầu bằng câu giật tít mạnh mẽ đánh thẳng vào nỗi đau hoặc khát vọng của ${audience} trong vòng 3 giây đầu tiên.
- **Thân bài rõ ràng:** Phân đoạn có cấu trúc thông thoáng. Dùng bullet point để độc giả dễ scan trên màn hình điện thoại di động.
- **Kêu gọi hành động (CTA) mềm dẻo:** Tránh ép mua hàng lộ liễu. Hãy hướng độc giả trò chuyện, comment để nhận được sự đồng hành hoặc hướng dẫn chi tiết cá nhân từ ${bName}.
- **Yêu cầu riêng đặc biệt:** ${mHaves}

## 7. CÁC DẠNG NỘI DUNG YÊU CẦU SẢN XUẤT NHIỀU NHẤT
Khi tôi giao chủ đề, bạn cần luân phiên phác thảo hoặc sáng tạo các dạng nội dung sau:
${formatsFormatted}

## 8. CÔNG THỨC HOOK (TIÊU ĐỀ) TIÊU CHUẨN DÀNH RIÊNG
Bạn bắt buộc sử dụng một trong 3 định hướng hook dưới đây để mở bài viết:
1. *Tấn công nỗi đau:* "Nếu vẫn tiếp tục bị [Nỗi đau], [Khách hàng mục tiêu] đang tự giới hạn bản thân bởi..."
2. *Thúc đẩy khát vọng:* "Làm thế nào để đạt được [Mong muốn] một cách an toàn mà không phải chịu đựng [Rào cản]?"
3. *Đập tan hiểu lầm:* "Sự thật về [Hiểu lầm thường gặp] mà đa số [Khách hàng mục tiêu] đều mắc sai lầm nghiêm trọng..."

## 9. QUY TẮC VIẾT KỊCH BẢN VIDEO NGẮN (TIKTOK/REELS/SHORTS)
- **Độ dài lý tưởng:** Kịch bản dưới 90 giây (Dao động 150 - 250 từ nói).
- **Văn phong nói chân thật:** Không dùng từ hoa mỹ khó đọc. Câu ngắn gọn, giàu hình ảnh, nhịp nhanh.
- **Gợi ý phân cảnh bối cảnh:** Thêm các từ khóa bối cảnh hành động chỉ dẫn kỹ thuật dạng \`[B-roll: mô tả cảnh thực tế]\`, \`[Chèn Text trên màn hình]\` hoặc \`[Hiệu ứng âm thanh phù hợp]\`.

## 10. QUY TẮC VIẾT BÀI ĐĂNG TRÊN MẠNG XÃ HỘI (FACEBOOK/ZALO)
- Trình bày trực quan bằng cách sử dụng các dòng cách thoáng đãng, lồng ghép emoji tinh tế để dẫn dắt mạch đọc cảm xúc.
- Tiêu đề viết hoa dòng đầu để lôi cuốn mắt nhìn.
- Cuối bài viết đính kèm 3-5 hashtag thương hiệu nhằm tăng khả năng tiếp cận: \`#${bName.replace(/\s+/g, "")} #SứcKhỏeKhoaHọc #${plat.replace(/\s+/g, "")}\`.

## 11. QUY TẮC BÁN HÀNG TỰ NHIÊN (SOFT-SELLING)
- Tập trung sâu sắc vào chia sẻ trải nghiệm thực phẩm/dịch vụ lành mạnh, thay đổi trước và sau quá trình sử dụng thay vì chào hàng giảm giá liên tục.
- Lồng ghép tinh tế câu chuyện một người cụ thể có xuất phát điểm khốn khó vượt qua khó khăn nhờ sản phẩm của chúng ta.

## 12. CHIẾN THUẬT AN TOÀN NỘI DUNG & CAM KẾT
- Tuyệt đối giữ uy tín, không lừa dối người tiêu dùng.
- Tránh xa quy tắc hạ bệ đối thủ khác, tập trung làm nổi bật thế mạnh của bản thân.
- Nguyên tắc loại trừ: ${avoid}

## 13. TỪ KHÓA BẮT BUỘC PHẢI TRÁNH (FORBIDDEN WORDS)
Khi sáng tạo bất kỳ nội dung hoặc câu trả lời nào, bạn **TUYỆT ĐỐI CẤM** dùng các từ ngữ nhạy cảm hoặc dễ vi phạm chính sách hiển thị sau:
- [${forbid}]

## 14. TỪ KHÓA AN TOÀN KHUYÊN DÙNG THAY THẾ
Hãy thông minh sử dụng các từ trung lập, khách quan hơn để xây dựng niềm tin lớn:
- [${replaceK}]

## 15. HƯỚNG DẪN XỬ LÝ KHI TÔI HỎI: "Hôm nay nên viết gì?"
Khi tôi đưa ra câu hỏi này, bạn không được lười biếng. Hãy:
1. Đề xuất ngay lập tức 3 ý tưởng nội dung cực hấp dẫn xoay quanh việc giải quyết bài toán ${pain} của ${audience} trên nền tảng ${plat}.
2. Phân rõ: Ý tưởng này thuộc Trụ cột nội dung nào (Kiến thức/Thương hiệu/Bán lẻ) và hướng viết bài viết sơ bộ.

## 16. HƯỚNG DẪN XỬ LÝ KHI TÔI YÊU CẦU: "Hãy viết lại nội dung này..."
1. Hỏi rõ điểm chưa ưng ý của tôi (giọng văn quá sến, nội dung quá dài, thiếu ví dụ...).
2. Viết lại bản mới chất lượng cao hơn, giữ đúng các quy chuẩn đại từ xưng xô "${address}" và nguyên tắc từ khóa tránh sử dụng.

## 17. HƯỚNG DẪN XỬ LÝ KHI TÔI YÊU CẦU: "Lên kế hoạch content"
Tạo lịch biểu rõ ràng dạng bảng 7 ngày với 3 cột trụ cột tỉ lệ phân phối:
- 45% Content chia sẻ kiến thức hữu ích, tháo gỡ hiểu lầm phổ biến.
- 30% Content xây dựng phong thái cá nhân/thương hiệu, chia sẻ giá trị kinh nghiệm.
- 25% Content giải pháp giới thiệu khéo léo sản phẩm dịch vụ thúc đẩy cơ hội mua hàng.

## 18. QUY TẮC ĐỊNH DẠNG ĐẦU RA (OUTPUT FORMAT)
Phản hồi trực tiếp bằng câu chữ chỉnh chu, sử dụng ngôn ngữ Tiếng Việt, trình bày Markdown sáng sủa. Không vòng vo dạo đầu giải thích thừa thãi trước hoặc sau bài viết. Viết xong là dừng lại.

## 19. CÁC CÂU LỆNH KÍCH HOẠT NHANH (FAST COMMANDS)
Khi tôi nhập bất cứ câu lệnh ngắn nào, bạn hãy tự hiểu cần ánh xạ sang vai trò chuyên gia để soạn thảo:
- *"Viết bài Facebook về sản phẩm [Sản phẩm]"* -> Lập tức biên soạn bài truyền bá tính năng dựa theo các quy tắc trên.
- *"Kịch bản Reels: [Chủ đề]"* -> Sáng tạo kịch bản 90s chuẩn video ngắn.
- *"Gợi ý 5 Hook cho chủ đề [Chủ đề]"* -> Sản xuất các kiểu hook lôi cuốn.

## 20. CÂU LỆNH KHỞI ĐỘNG HỆ THỐNG
Tôi vừa kích hoạt hệ thống Prompt Master của bạn thành công. Hãy chào tôi một cách nhiệt thành nhất, giới thiệu sứ mệnh hỗ trợ cho thương hiệu **${bName}** trong lĩnh vực **${ind}**, và mời tôi lựa chọn yêu cầu tạo nội dung đầu tiên ngay bây giờ!`;
  };

  // Trigger prompt construction on step 5
  const handleGeneratePrompt = () => {
    if (!isValid) {
      setAiError("Vui lòng bổ sung đầy đủ các thông tin bắt buộc tại Bước 1 và Bước 3: Tên thương hiệu, Lĩnh vực, Chuyên đề ngách và Khách hàng mục tiêu.");
      // Auto redirect to step with missing info
      if (!formData.brandName.trim() || !formData.industry.trim() || !formData.nicheTopic.trim()) {
        setActiveStep(1);
      } else {
        setActiveStep(3);
      }
      return;
    }
    setAiError(null);
    setIsPromptLoading(true);

    setTimeout(() => {
      const prompt = assemblePromptMaster(formData);
      setGeneratedPrompt(prompt);
      setIsPromptLoading(false);
      setActiveStep(5);
      setAiSuccessMessage("🎉 Đã tạo Prompt Master Chuyên Gia xuất sắc!");
      setTimeout(() => setAiSuccessMessage(null), 3000);
    }, 800);
  };

  // Calling server-side Gemini API on user action request
  const handleAIEnhance = async (action: "shorten" | "expand" | "chatgpt" | "gemini" | "optimize") => {
    if (!generatedPrompt) {
      setAiError("Bạn cần tạo Prompt Master trước khi thực hiện các tối ưu nâng cao bằng AI.");
      return;
    }

    setIsPromptLoading(true);
    setAiError(null);
    setAiSuccessMessage(null);

    const actionTextMap = {
      shorten: "Rút gọn Prompt Master...",
      expand: "Mở rộng chi tiết...",
      chatgpt: "Tối ưu hóa thuật toán tương thích với ChatGPT...",
      gemini: "Tối ưu hóa cấu trúc suy nghĩ cho Google Gemini...",
      optimize: "Cải thiện diễn đạt và cấu trúc..."
    };

    setAiSuccessMessage(`✨ AI đang ${actionTextMap[action]} Xin vui lòng chờ giây lát...`);

    try {
      const response = await fetch("/api/gemini/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: generatedPrompt,
          action: action
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errorType === "MISSING_API_KEY") {
          throw new Error(data.message);
        } else {
          throw new Error(data.error || "Gặp sự cố không mong muốn trong quá trình tối ưu.");
        }
      }

      setGeneratedPrompt(data.result);
      if (data.isFallback) {
        setAiSuccessMessage(`✨ Đã cải tiến thành công qua Chế độ Dự phòng Cục bộ (máy chủ AI quá tải hoặc hết Quota)!`);
      } else {
        setAiSuccessMessage(`🎉 Chúc mừng! AI đã xử lý và tối ưu hóa thành công phiên bản mới.`);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra lại thiết lập.");
    } finally {
      setIsPromptLoading(false);
    }
  };

  // Utilities: Copy clipboard
  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setCopyFeedback("Đã sao chép vào bộ nhớ tạm thành công!");
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Utilities: Download as physical TXT file
  const handleDownload = () => {
    if (!generatedPrompt) return;
    const cleanBrandName = formData.brandName ? formData.brandName.trim().replace(/[^a-zA-Z0-9_ÁÀẢÃẠÁÂẬẤẦẨẪẬĂẰẮẲẴẶẺẼẸÉÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸYĐđ]/g, "_") : "ChuyenGia";
    const filename = `PromptMaster_${cleanBrandName}.txt`;
    const element = document.createElement("a");
    const file = new Blob([generatedPrompt], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setCopyFeedback("Đã tải tập tin .txt về máy của bạn!");
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const currentProgressPercent = (activeStep / 5) * 100;

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* HEADER BAR */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-white border-b border-slate-200 shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Mobile menu indicator toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Prompt Master <span className="text-indigo-600 font-extrabold text-sm px-1.5 py-0.5 bg-indigo-50 rounded-md">Pro</span>
            </h1>
            <p className="hidden xs:block text-[10px] text-slate-400 font-medium">Bản lắp ráp cấu trúc an toàn độc quyền</p>
          </div>
        </div>

        {/* Action Indicators & AutoSaves */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-end text-right">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isAutoSaved ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`}></span>
              {isAutoSaved ? "Đang lưu..." : `Lưu nháp: ${lastSavedTime || "Tự động"}`}
            </span>
          </div>
          <button 
            id="btn_clear_form"
            onClick={handleClearForm}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw size={12} />
            Làm mới sạch
          </button>
        </div>
      </header>

      {/* BODY WORKSPACE CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* MOBILE SIDEBAR DROPDOWN / ASIDE */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 w-72 bg-white p-6 shrink-0 border-r border-slate-200 flex flex-col gap-5 z-40 transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Quy trình 5 bước</h2>
              <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setMobileMenuOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <nav className="space-y-1.5" id="navigation_steps">
              {[
                { step: 1, name: "Thông tin thương hiệu", desc: "Tên, ngành và đóng vai" },
                { step: 2, name: "Sản phẩm & Mục tiêu", desc: "Sản phẩm thực tế & mục tiêu AI" },
                { step: 3, name: "Khách hàng mục tiêu", desc: "Hiểu nỗi đau & rào cản" },
                { step: 4, name: "Phong cách & Quy tắc", desc: "Xưng hô, giọng văn & từ khóa" },
                { step: 5, name: "Xuất Prompt Master", desc: "Nhận Prompt & tối ưu hóa" }
              ].map((s) => {
                const isActive = activeStep === s.step;
                const isCompleted = activeStep > s.step;
                return (
                  <button
                    key={s.step}
                    id={`step_nav_btn_${s.step}`}
                    onClick={() => {
                      setActiveStep(s.step);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
                      isActive 
                        ? "bg-indigo-50 border-l-4 border-indigo-600 shadow-sm" 
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className={`mt-0.5 w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold transition-all ${
                      isActive 
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" 
                        : isCompleted
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                    }`}>
                      {isCompleted ? <Check size={12} className="stroke-[3]" /> : s.step}
                    </div>
                    <div className="space-y-0.5">
                      <div className={`text-sm font-semibold transition-colors ${isActive ? "text-indigo-800" : "text-slate-700"}`}>
                        {s.name}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-none">{s.desc}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto pointer-events-none">
            <div id="inspiration_quote_card" className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 shadow-sm">
              <span className="inline-block px-2 py-0.5 bg-indigo-100 text-[10px] font-bold text-indigo-700 rounded mb-2">Lời khuyên</span>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                &ldquo;Bí quyết của một Prompt Master nằm ở việc định hình chi tiết nỗi sợ, rào cản và hiểu lầm của độc giả. AI sẽ viết thu hút hơn gấp 10 lần.&rdquo;
              </p>
            </div>
          </div>
        </aside>

        {/* OVERLAY FOR MOBILE VIEW */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 transition-opacity"
          ></div>
        )}

        {/* MAIN WORKSPACE VIEWPORTS CONTAINER */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 relative">
          
          <section className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
            <div className="max-w-3xl w-full mx-auto space-y-8 pb-10">
            
            {/* GLOBAL ERROR / STATE ALERTS */}
            {aiError && (
              <div id="alert_error_box" className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-3 animate-fade-in shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">Vui lòng kiểm tra lại thiết lập</p>
                  <p className="text-xs text-rose-700 leading-relaxed whitespace-pre-line">{aiError}</p>
                </div>
              </div>
            )}

            {aiSuccessMessage && (
              <div id="alert_success_box" className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3 animate-fade-in shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-800 leading-relaxed">{aiSuccessMessage}</p>
                </div>
              </div>
            )}

            {/* TOP POPULAR TEMPLATES PICKER ON STEP 1 */}
            {activeStep === 1 && (
              <div id="templates_selection_module" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-yellow-100 rounded-lg text-yellow-700">
                    <Zap size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Mẫu ngành chọn nhanh (Khuyên dùng)</h3>
                    <p className="text-xs text-slate-400">Chọn ngành để tự động đề xuất nỗi đau khách hàng, giọng văn và quy tắc chuẩn xác</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {INDUSTRY_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      id={`template_choice_${tmpl.id}`}
                      onClick={() => handleApplyTemplate(tmpl.id)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl text-center border transition-all ${
                        selectedTemplateId === tmpl.id
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300"
                      }`}
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
                {selectedTemplateId && (
                  <p className="text-[11px] text-indigo-600 italic font-medium">
                    ✨ Hệ thống đã tự động điền thông tin của mẫu <strong>{INDUSTRY_TEMPLATES.find(t=>t.id===selectedTemplateId)?.name}</strong> vào toàn bộ 5 bước. Bạn có thể bấm tiếp tục hoặc thoải mái chỉnh sửa theo ý mình.
                  </p>
                )}
              </div>
            )}


            {/* ======================= STEP 1: THÔNG TIN THƯƠNG HIỆU ======================= */}
            {activeStep === 1 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Thiết lập nền tảng</div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Bước 1: Thông tin thương hiệu cá nhân</h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Định hình danh tính của thương hiệu để AI nhận dạng chính xác phong thái và lĩnh vực khi viết bài.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      Tên cá nhân / Thương hiệu / Doanh nghiệp <span className="text-rose-500">* bắt buộc</span>
                    </label>
                    <input
                      type="text"
                      id="input_brand_name"
                      value={formData.brandName}
                      onChange={(e) => handleInputChange("brandName", e.target.value)}
                      placeholder="Ví dụ: Dược sĩ Ngoan, Thanh Thúy Beauty Center, Nhà thuốc An Tâm..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    {renderFieldLabel("Vai trò trên hệ thống khi AI xưng hô", "userRole")}
                    <input
                      type="text"
                      id="input_user_role"
                      value={formData.userRole}
                      onChange={(e) => handleInputChange("userRole", e.target.value)}
                      placeholder="Ví dụ: Dược sĩ chính, Nhà sáng lập, Bác sĩ chuyên khoa, Chuyên viên Spa..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">
                      Số năm kinh nghiệm muốn AI đóng vai
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {EXPERIENCE_OPTIONS.map((year) => {
                        const isSelected = formData.experienceYears === year;
                        return (
                          <button
                            key={year}
                            type="button"
                            onClick={() => handleInputChange("experienceYears", year)}
                            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                              isSelected
                                ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      Lĩnh vực / Ngành nghề hoạt động chính <span className="text-rose-500">* bắt buộc</span>
                    </label>
                    <input
                      type="text"
                      id="input_industry"
                      value={formData.industry}
                      onChange={(e) => handleInputChange("industry", e.target.value)}
                      placeholder="Ví dụ: Dược phẩm, Nhà thuốc, Spa, Mẹ và bé, Bất động sản, Gia dụng, Mỹ phẩm..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    {renderFieldLabel("Chuyên đề / Ngách cụ thể muốn sáng tạo", "nicheTopic", true)}
                    <input
                      type="text"
                      id="input_niche_topic"
                      value={formData.nicheTopic}
                      onChange={(e) => handleInputChange("nicheTopic", e.target.value)}
                      placeholder="Ví dụ: Viết content Facebook và chia sẻ kiến thức sử dụng thuốc điều trị..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            )}


            {/* ======================= STEP 2: SẢN PHẨM & MỤC TIÊU ======================= */}
            {activeStep === 2 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Thông tin cốt lõi</div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Bước 2: Sản phẩm và mục tiêu sáng tạo</h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Nêu bật các thế mạnh độc bản của sản phẩm dịch vụ và đặt khuôn khổ đích đến hành vi cho Prompt Master.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-2">
                  <div className="space-y-2">
                    {renderFieldLabel("Sản phẩm / Dịch vụ chính", "mainProduct")}
                    <textarea
                      rows={2}
                      value={formData.mainProduct}
                      onChange={(e) => handleInputChange("mainProduct", e.target.value)}
                      placeholder="Ví dụ: Liệu trình trị mụn y khoa, sữa công thức tăng chiều cao, đất nền sổ đỏ ven sông..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    {renderFieldLabel("Điểm mạnh / Thế mạnh vượt trội của thương hiệu", "strengths")}
                    <textarea
                      rows={2}
                      value={formData.strengths}
                      onChange={(e) => handleInputChange("strengths", e.target.value)}
                      placeholder="Ví dụ: Có kỹ thuật viên lành nghề chuẩn y khoa, sở hữu thâm niên thực chiến dày dặn, hỗ trợ sửa bài chi tiết..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-600">
                      Mục tiêu sử dụng Prompt Master chính (chọn nhiều mục)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {SUGGESTED_GOALS.map((goal) => {
                        const isChecked = formData.goals.includes(goal);
                        return (
                          <label
                            key={goal}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                              isChecked
                                ? "bg-indigo-50/40 border-indigo-400 text-indigo-800"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleGoal(goal)}
                              className="accent-indigo-600"
                            />
                            <span>{goal}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">
                      Yêu cầu / Mục tiêu tùy chỉnh khác (nếu có)
                    </label>
                    <input
                      type="text"
                      value={formData.customGoal}
                      onChange={(e) => handleInputChange("customGoal", e.target.value)}
                      placeholder="Ví dụ: Nhấn mạnh vào việc xây dựng quy trình khép kín tự vận hành..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">
                      Nền tảng sử dụng chính của nội dung
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PLATFORM_OPTIONS.map((plat) => {
                        const isSelected = formData.mainPlatform === plat;
                        return (
                          <button
                            key={plat}
                            type="button"
                            onClick={() => handleInputChange("mainPlatform", plat)}
                            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                              isSelected
                                ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {plat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* ======================= STEP 3: KHÁCH HÀNG MỤC TIÊU ======================= */}
            {activeStep === 3 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Nghiên cứu thị trường</div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Bước 3: Bản phác họa khách hàng mục tiêu</h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Cố định chân dung độc giả để AI học cách đồng cảm và viết trúng mạch suy tư của họ.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-2">
                  <div className="space-y-2">
                    {renderFieldLabel("Khách hàng mục tiêu là ai?", "targetAudience", true)}
                    <textarea
                      rows={2}
                      id="input_target_audience"
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                      placeholder="Ví dụ: Mẹ bỉm nuôi con hay ốm vặt, dân công sở đau vai gáy, cặp vợ chồng trẻ mua nhà lần đầu..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    {renderFieldLabel("Nỗi đau hoặc vấn đề băn khoăn hàng ngày của họ", "customerPainPoints")}
                    <textarea
                      rows={2}
                      value={formData.customerPainPoints}
                      onChange={(e) => handleInputChange("customerPainPoints", e.target.value)}
                      placeholder="Ví dụ: Thiếu thâm niên bỉm sữa, con lười ăn hay đi ngoài, lo lắng lãi thả nổi, sợ mua trúng hàng nhái..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    {renderFieldLabel("Niềm khát khao hoặc mong ước thầm kín của họ", "customerDesires")}
                    <textarea
                      rows={2}
                      value={formData.customerDesires}
                      onChange={(e) => handleInputChange("customerDesires", e.target.value)}
                      placeholder="Ví dụ: Nuôi con an nhàn, có hướng giải quyết an toàn không lạm dụng thuốc tây, sở hữu làn da căng tràn..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    {renderFieldLabel("Rào cản khiến họ rụt rè chưa hành động mua hàng ngay", "customerBarriers")}
                    <textarea
                      rows={2}
                      value={formData.customerBarriers}
                      onChange={(e) => handleInputChange("customerBarriers", e.target.value)}
                      placeholder="Ví dụ: Sợ hàng nhái, rụt rè chưa tin vì đã từng dùng thử nhiều giải pháp không có tiến triển..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    {renderFieldLabel("Điều khách hàng thường hay hiểu sai nghiêm trọng về ngành", "customerMisconceptions")}
                    <textarea
                      rows={2}
                      value={formData.customerMisconceptions}
                      onChange={(e) => handleInputChange("customerMisconceptions", e.target.value)}
                      placeholder="Ví dụ: Cứ cảm cúm là mua kháng sinh ngay, nghĩ rằng đi spa một lần là duy trì độ trẻ đẹp trọn đời..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-xs sm:text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            )}


            {/* ======================= STEP 4: PHONG CÁCH & QUY TẮC ======================= */}
            {activeStep === 4 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Kỹ thuật trình bày</div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Bước 4: Phong cách nội dung & Quy tắc an toàn</h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Điều phối văn phong và lập rào cản ngăn chặn AI nói sai quy tắc hay dùng từ nhạy cảm có ảnh hưởng thương hiệu.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        Giọng văn (Tone-of-voice) mong muốn
                      </label>
                      <select
                        value={formData.toneOfVoice}
                        onChange={(e) => handleInputChange("toneOfVoice", e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none shadow-sm"
                      >
                        {TONE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">
                        Đại từ xưng hô mong muốn (Ví dụ: Mình - bạn)
                      </label>
                      <input
                        type="text"
                        value={formData.addressingStyle}
                        onChange={(e) => handleInputChange("addressingStyle", e.target.value)}
                        placeholder="Em - anh/chị, Chuyên gia - khách hàng, Tôi - bạn, Cô - các mẹ..."
                        className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-600">
                      Định dạng dạng bài AI cần hỗ trợ thiết kịch nhiều nhất (chọn nhiều mục)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {SUGGESTED_FORMATS.map((fmt) => {
                        const isChecked = formData.requiredFormats.includes(fmt);
                        return (
                          <label
                            key={fmt}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                              isChecked
                                ? "bg-indigo-50/40 border-indigo-400 text-indigo-800"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleFormat(fmt)}
                              className="accent-indigo-600"
                            />
                            <span>{fmt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {renderFieldLabel("Điều bắt buộc phải có trong nội dung (Ví dụ: Hook mạnh, CTA...)", "mustHaves")}
                    <textarea
                      rows={2}
                      value={formData.mustHaves}
                      onChange={(e) => handleInputChange("mustHaves", e.target.value)}
                      placeholder="Ví dụ: Luôn bắt đầu bài viết bằng hook, văn phong nói tự nhiên dễ nghe..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    {renderFieldLabel("Những chi tiết cần tránh tuyệt đối khi lồng ghép", "thingsToAvoid")}
                    <textarea
                      rows={2}
                      value={formData.thingsToAvoid}
                      onChange={(e) => handleInputChange("thingsToAvoid", e.target.value)}
                      placeholder="Ví dụ: Thần thánh hóa dược trị của thuốc tây, không nói quá công dụng gây xói mòn uy tín..."
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {renderFieldLabel("Từ khóa cần TRÁNH tuyệt đối (Ngăn vi phạm chính sách)", "forbiddenKeywords")}
                      <input
                        type="text"
                        value={formData.forbiddenKeywords}
                        onChange={(e) => handleInputChange("forbiddenKeywords", e.target.value)}
                        placeholder="Ví dụ: Chữa khỏi hoàn toàn, dứt điểm 100%, thuốc thần kỳ..."
                        className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-xs sm:text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      {renderFieldLabel("Từ khóa nên dùng thay thế lành mạnh, khách quan", "replacementKeywords")}
                      <input
                        type="text"
                        value={formData.replacementKeywords}
                        onChange={(e) => handleInputChange("replacementKeywords", e.target.value)}
                        placeholder="Ví dụ: Hỗ trợ cải thiện dần, bổ sung dưỡng chất lành tính..."
                        className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* ======================= STEP 5: XUẤT PROMPT MASTER ======================= */}
            {activeStep === 5 && (
              <div className="space-y-6">
                
                {/* TOOLBAR FOR QUICK ACTIONS */}
                <div id="ai_advanced_options_panel" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1 px-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800">Bộ công cụ Tối Ưu Hóa AI đặc quyền</h3>
                      <p className="text-[10px] sm:text-xs text-slate-400">Tận dụng mô hình Gemini xử lý cấu trúc để nâng cấp Prompt Master của bạn</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      id="opt_btn_shorten"
                      onClick={() => handleAIEnhance("shorten")}
                      disabled={isPromptLoading}
                      className="px-3 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <Layers size={13} />
                      Rút gọn
                    </button>
                    <button
                      id="opt_btn_expand"
                      onClick={() => handleAIEnhance("expand")}
                      disabled={isPromptLoading}
                      className="px-3 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <ArrowRight size={13} />
                      Mở rộng
                    </button>
                    <button
                      id="opt_btn_chatgpt"
                      onClick={() => handleAIEnhance("chatgpt")}
                      disabled={isPromptLoading}
                      className="px-3 py-2 text-xs font-semibold bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-100 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <Cpu size={13} />
                      Tối ưu cho ChatGPT
                    </button>
                    <button
                      id="opt_btn_gemini"
                      onClick={() => handleAIEnhance("gemini")}
                      disabled={isPromptLoading}
                      className="px-3 py-2 text-xs font-semibold bg-violet-50/60 hover:bg-violet-100/80 text-violet-700 border border-violet-100 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <Sparkles size={13} />
                      Tối ưu cho Gemini
                    </button>
                    <button
                      id="opt_btn_optimize"
                      onClick={() => handleAIEnhance("optimize")}
                      disabled={isPromptLoading}
                      className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <RefreshCw size={13} />
                      Sửa diễn đạt
                    </button>
                  </div>
                </div>

                {/* VISUAL MARKDOWN / TEXT AREA PREVIEW ZONE */}
                <div id="output_textarea_container" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col min-h-[480px]">
                  
                  {/* BAR CONTROLS */}
                  <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-slate-500" />
                      <div>
                        <div className="text-xs font-extrabold text-slate-700 tracking-tight">KẾT QUẢ PROMPT MASTER CHUYÊN GIA</div>
                        <p className="text-[9px] text-slate-400">Bạn có thể chỉnh sửa trực tiếp nội dung bên dưới trước khi lưu</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id="btn_copy_prompt"
                        onClick={handleCopy}
                        disabled={!generatedPrompt}
                        className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-100 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Copy size={13} />
                        Sao chép Prompt
                      </button>

                      <button
                        id="btn_download_prompt"
                        onClick={handleDownload}
                        disabled={!generatedPrompt}
                        className="px-3.5 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Download size={13} />
                        Tải file .txt
                      </button>
                    </div>
                  </div>

                  {/* LOADING/SKELETON OR ACTUAL TEXTAREA */}
                  <div className="flex-1 relative flex flex-col">
                    {isPromptLoading ? (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-10 z-10 space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-800 animate-pulse">Lắp ráp và chuẩn hóa cấu trúc...</p>
                          <p className="text-xs text-slate-400">Tiến trình tối ưu hóa ngôn liệu có thể mất vài giây</p>
                        </div>
                      </div>
                    ) : null}

                    {copyFeedback && (
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 p-2 px-4 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-md z-30 transition-all flex items-center gap-1.5 animate-bounce">
                        <Check size={14} className="text-emerald-400" />
                        {copyFeedback}
                      </div>
                    )}

                    {!generatedPrompt && !isPromptLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
                        <FileText size={48} className="stroke-[1] text-slate-300" />
                        <div>
                          <p className="text-sm font-bold">Chưa có kết quả lắp ráp</p>
                          <p className="text-xs">Hãy cập nhập dữ liệu và nhấn nút tạo ở chân trang hoặc ở bước 5 nhé.</p>
                        </div>
                        <button
                          onClick={handleGeneratePrompt}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold rounded-lg transition-colors"
                        >
                          Tạo ngay bây giờ
                        </button>
                      </div>
                    ) : (
                      <textarea
                        id="prompt_output_editor"
                        rows={28}
                        value={generatedPrompt}
                        onChange={(e) => setGeneratedPrompt(e.target.value)}
                        className="w-full flex-1 p-5 text-[13px] leading-relaxed font-mono text-slate-800 bg-white focus:outline-none resize-none"
                        placeholder="Kết quả câu lệnh của bạn..."
                      />
                    )}
                  </div>
                </div>

                {/* SYSTEM INTEGRATION FEEDBACK EXPLAINER */}
                <div id="api_key_configuration_help_card" className="bg-slate-100/80 p-4 border border-slate-200 rounded-xl space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-[10px] font-bold text-amber-800 rounded">
                    <Info size={10} /> CẤU HÌNH API KEY
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tính năng <strong>Rút gọn, Mở rộng, Tối ưu hóa ChatGPT & Gemini</strong> sử dụng Trí Tuệ Nhân Tạo để phân tích ngữ cảnh. Thiết lập biến môi trường <strong>GEMINI_API_KEY</strong> trong bảng <strong>Settings &gt; Secrets</strong> trên AI Studio của bạn để kích hoạt đầy đủ các thuật toán nâng cao này.
                  </p>
                </div>
              </div>
            )}
            
          </div>
        </section>

        {/* FOOTER NAVIGATION & PROGRESS BAR */}
        <footer className="h-20 bg-white border-t border-slate-200 px-4 sm:px-10 flex items-center justify-between shrink-0 z-10 shadow-sm">
            
            {/* Steps bar */}
            <div className="flex items-center gap-3">
              <div className="w-20 sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${currentProgressPercent}%` }}
                ></div>
              </div>
              <span id="footer_step_index" className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                Bước {activeStep} / 5
              </span>
            </div>

            {/* Back Continue triggers */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                id="btn_prev_step"
                onClick={() => {
                  if (activeStep > 1) {
                    setActiveStep(activeStep - 1);
                  }
                }}
                disabled={activeStep === 1}
                className={`px-4 sm:px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeStep === 1 
                    ? "text-slate-300 cursor-not-allowed" 
                    : "text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95"
                }`}
              >
                Quay lại
              </button>

              {activeStep < 5 ? (
                <button
                  id="btn_next_step"
                  onClick={() => {
                    // Check if they want to build prior to finishing 
                    if (activeStep === 4) {
                      handleGeneratePrompt();
                    } else {
                      setActiveStep(activeStep + 1);
                    }
                  }}
                  className="px-5 sm:px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-100 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  {activeStep === 4 ? "Tạo Prompt Master" : "Tiếp tục"}
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  id="btn_recreate_prompt"
                  onClick={handleGeneratePrompt}
                  className="px-5 sm:px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-100 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw size={13} />
                  Tái tạo lại bản khác
                </button>
              )}
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}
