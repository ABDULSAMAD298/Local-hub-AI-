// Types mirror the existing Supabase schema (see build spec). Do not add fields
// that aren't backed by a real column — this file is a read model of the DB.

export type UserRole = "super_admin" | "admin";

export type BusinessType =
  | "real_estate"
  | "restaurant"
  | "apparel"
  | "salon"
  | "beauty"
  | "other";

export type BusinessStatus = "active" | "inactive" | "suspended";

export type ConversationStatus = "active" | "closed" | "follow_up";

export type PlanName = "trial" | "starter" | "growth" | "pro";

export type PlanStatus = "trialing" | "active" | "past_due" | "canceled";

export type MediaFileType = "video" | "image";

export type ConversationRole = "user" | "assistant";

export type OrderSessionStatus = "pending" | "confirmed" | "cancelled";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  plan: PlanName;
  plan_status: PlanStatus;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  business_type: BusinessType;
  phone_number_id: string | null;
  display_phone: string | null;
  wa_token: string | null;
  knowledge_base: string | null;
  upsell_message: string | null;
  owner_phone: string | null;
  response_threshold_min: number;
  status: BusinessStatus;
  created_at: string;
}

export interface BusinessTypeConfigField {
  key: string;
  label: string;
  type: "text" | "number" | "url" | "textarea" | "select" | "tags" | "toggle" | "date";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  maxLength?: number;
}

export interface BusinessTypeConfig {
  type_key: BusinessType;
  display_name: string;
  icon: string;
  media_label: string;
  fields: BusinessTypeConfigField[];
}

export interface Media {
  id: string;
  business_id: string;
  business_type: BusinessType;
  title: string;
  price: number | null;
  description: string | null;
  file_url: string;
  file_type: MediaFileType;
  thumbnail_url: string | null;
  active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Conversation {
  id: string;
  business_id: string;
  customer_phone: string;
  contact_name: string | null;
  status: ConversationStatus;
  language: string | null;
  video_sent: boolean;
  upsell_sent: boolean;
  follow_up_count: number;
  last_message: string | null;
  last_message_time: string | null;
  supervisor_triggered: boolean;
  created_at: string;
}

export interface ConversationHistory {
  id: string;
  business_id: string;
  customer_phone: string;
  role: ConversationRole;
  content: string;
  action_taken: string | null;
  created_at: string;
}

export interface FollowupSchedule {
  id: string;
  business_id: string;
  customer_phone: string;
  fu_msg_1: string | null;
  fu_msg_2: string | null;
  fu_msg_3: string | null;
  fu_msg_4: string | null;
  fu_msg_5: string | null;
  fu_msg_6: string | null;
  fu_1_time: string | null;
  fu_2_time: string | null;
  fu_3_time: string | null;
  fu_4_time: string | null;
  fu_5_time: string | null;
  fu_6_time: string | null;
  last_sent: number;
  active: boolean;
}

export interface FollowupLog {
  id: string;
  business_id: string;
  customer_phone: string;
  followup_number: number;
  message_sent: string;
  sent_at: string;
}

export interface OrderSession {
  id: string;
  business_id: string;
  customer_phone: string;
  order_summary: string | null;
  total_amount: number | null;
  status: OrderSessionStatus;
  created_at: string;
}

export interface Analytics {
  id: string;
  business_id: string;
  date: string;
  messages_received: number;
  messages_sent: number;
  follow_ups_sent: number;
  responses_received: number;
  videos_sent: number;
  conversions: number;
}

export interface BroadcastListEntry {
  id: string;
  business_id: string;
  customer_phone: string;
  contact_name: string | null;
  opted_in: boolean;
}
