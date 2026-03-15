// ============================================
// Enums / Literal Types
// ============================================

export type IntentCategory =
  | 'technical'
  | 'billing'
  | 'account'
  | 'sales'
  | 'feature_request'
  | 'general';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type RoutingOutcome =
  | 'auto_replied'
  | 'escalated_techsupport'
  | 'pending_human'
  | 'pending';

export type InteractionStatus =
  | 'received'
  | 'classifying'
  | 'classified'
  | 'responding'
  | 'responded'
  | 'escalated'
  | 'resolved'
  | 'failed';

// ============================================
// Email Classification
// ============================================

export interface EmailClassification {
  product: string;
  intent: IntentCategory;
  severity: Severity;
  summary: string;
  confidence: number;
  language: string;
}

// ============================================
// Core Models
// ============================================

export interface Interaction {
  id: string;
  emailId: string;
  threadId?: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  body: string;
  classification?: EmailClassification;
  response?: string;
  routingOutcome: RoutingOutcome;
  status: InteractionStatus;
  techSupportCaseId?: string;
  techSupportTicketNumber?: string;
  slackNotified: boolean;
  errorMessage?: string;
  receivedAt: Date;
  classifiedAt?: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  supportEmail: string;
  techSupportTenantId: string;
  description?: string;
  autoReplyEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  pollingIntervalMinutes: number;
  autoReplyEnabled: boolean;
  slackNotificationsEnabled: boolean;
  defaultProduct: string;
  supportEmailAddress: string;
  maxAutoRepliesPerDay: number;
}

// ============================================
// TechSupport-AI Integration
// ============================================

export interface TechSupportCaseRequest {
  product: string;
  category: string;
  severity: Severity;
  language: string;
  customerContact: {
    phone: string;
    email: string;
    name?: string;
  };
  problem: string;
}

export interface TechSupportCaseResponse {
  id: string;
  ticketNumber: string;
  tenantId: string;
  product: string;
  category: string;
  severity: Severity;
  status: string;
  currentLevel: string;
  customerContact: {
    phone: string;
    email: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TechSupportWebhookPayload {
  caseId: string;
  ticketNumber: string;
  status: 'resolved' | 'escalated_human' | 'pending';
  resolution?: string;
  responseToCustomer?: string;
  resolvedAt?: string;
}

// ============================================
// Slack Notification
// ============================================

export interface SlackNotificationData {
  interactionId: string;
  from: string;
  subject: string;
  product: string;
  intent: IntentCategory;
  severity: Severity;
  summary: string;
  routingOutcome: RoutingOutcome;
  responseSent: boolean;
  needsHumanAttention: boolean;
  dashboardUrl?: string;
}

// ============================================
// API Types
// ============================================

export interface ProcessEmailResult {
  interactionId: string;
  classification: EmailClassification;
  routingOutcome: RoutingOutcome;
  responseSent: boolean;
  techSupportCaseId?: string;
}

export interface DashboardStats {
  emailsToday: number;
  autoReplied: number;
  escalated: number;
  pending: number;
  avgResponseTimeMs: number;
}

export interface PollResult {
  emailsFound: number;
  emailsProcessed: number;
  errors: string[];
}

// ============================================
// Subscriber Authorization
// ============================================

export type SubscriptionStatus = 'active' | 'trial' | 'cancelled' | 'past_due' | 'unpaid';

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: SubscriptionStatus;
  plan: string;
  products: string[]; // Products they have access to
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriberVerificationResult {
  isSubscriber: boolean;
  subscriber?: Subscriber;
  reason?: 'active' | 'trial' | 'not_found' | 'cancelled' | 'expired';
}

// ============================================
// Knowledge Base
// ============================================

export type KBFileType = 'pdf' | 'md' | 'txt';
export type KBDocumentStatus = 'uploading' | 'processing' | 'embedded' | 'error';

export interface KBDocument {
  id: string;
  product: string;
  filename: string;
  fileType: KBFileType;
  fileSize: number;
  status: KBDocumentStatus;
  chunkCount: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
