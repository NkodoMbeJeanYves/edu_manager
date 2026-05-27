export type MessageFolder = 'INBOX' | 'SENT';
export type MessagePriority = 'NORMAL' | 'HIGH';

export interface Message {
  id: string;
  tenantId: string;
  folder: MessageFolder;
  fromName: string;
  toName: string;
  subject: string;
  body: string;
  priority: MessagePriority;
  read: boolean;
  sentAt: string;
}

export interface MessageFilter {
  search?: string;
  folder?: MessageFolder;
}

export type MessageDraft = Omit<Message, 'id' | 'tenantId' | 'sentAt' | 'read'>;
