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
  randomEnabled: boolean;
  randomPerDay: number; // 하루 랜덤 알림 횟수
  randomWindowStart: string; // "HH:MM" — 랜덤 알림이 발송될 수 있는 시간 범위 시작
  randomWindowEnd: string;
  dndEnabled: boolean;
  dndStart: string; // "HH:MM" — 이 범위에는 어떤 알림도 보내지 않음(자정을 넘길 수 있음)
  dndEnd: string;
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
