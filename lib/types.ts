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
