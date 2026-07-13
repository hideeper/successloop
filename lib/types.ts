export interface RoadmapData {
  dislikes: string[];
  likes: string[];
  compass: string;
  realizations: string[];
}

export interface SmartGoal {
  specific: string;
  measurable: string;
  agreed: string;
  realistic: string;
  timely: string;
  important: boolean;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  goals: SmartGoal[];
  action: string;
}

export interface AuthUser {
  email: string;
  marketingOptIn: boolean;
}

export interface ReminderSettings {
  morningAt: string | null; // "HH:MM" 또는 꺼짐(null)
  nightAt: string | null;
}

export type InquiryType = "버그" | "제안" | "계정" | "기타";
export type InquiryStatus = "received" | "in_progress" | "done";

export interface Inquiry {
  id: number;
  type: InquiryType;
  content: string;
  status: InquiryStatus;
  adminReply: string | null;
  createdAt: string;
}
