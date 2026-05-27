export type NotificationType = 'GRADE' | 'ABSENCE' | 'PAYMENT' | 'EXAM' | 'ANNOUNCEMENT' | 'SYSTEM';
export type NotificationStatus = 'UNREAD' | 'READ';

export interface Notification {
  id: string;
  tenantId: string;
  type: NotificationType;
  title: string;
  body: string;
  status: NotificationStatus;
  createdAt: string;
}
