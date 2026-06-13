export interface FormData {
  // Step 1: Thông tin thương hiệu
  brandName: string;
  userRole: string;
  industry: string;
  nicheTopic: string;
  experienceYears: string;

  // Step 2: Sản phẩm và mục tiêu
  mainProduct: string;
  strengths: string;
  goals: string[]; // multi-select checkboxes
  customGoal: string;
  mainPlatform: string;

  // Step 3: Khách hàng mục tiêu
  targetAudience: string;
  customerPainPoints: string;
  customerDesires: string;
  customerBarriers: string;
  customerMisconceptions: string;

  // Step 4: Phong cách và quy tắc
  toneOfVoice: string;
  addressingStyle: string;
  requiredFormats: string[]; // multi-select checkboxes
  mustHaves: string;
  thingsToAvoid: string;
  forbiddenKeywords: string;
  replacementKeywords: string;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  formData: Partial<FormData>;
}
