/**
 * Utility function to send email notifications for audit limits
 * This can be called manually or triggered automatically via database triggers
 */

import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'audit_limit_reached' | 'audit_limit_warning';

export interface SendAuditLimitEmailParams {
  userId: string;
  notificationType: NotificationType;
}

/**
 * Send an email notification when a user reaches their audit limit
 * @param userId - The user's UUID
 * @param notificationType - Type of notification ('audit_limit_reached' or 'audit_limit_warning')
 * @returns Promise with the result
 */
export async function sendAuditLimitEmail({ 
  userId, 
  notificationType 
}: SendAuditLimitEmailParams) {
  try {
    const { data, error } = await supabase.functions.invoke('send-audit-limit-warning', {
      body: {
        user_id: userId,
        notification_type: notificationType,
      },
    });

    if (error) {
      console.error('Failed to send audit limit email:', error);
      throw error;
    }

    console.log('Audit limit email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending audit limit email:', error);
    return { success: false, error };
  }
}

/**
 * Check if user has reached audit limit and send appropriate email
 * @param userId - The user's UUID
 * @param auditsUsed - Number of audits the user has consumed
 */
export async function checkAndNotifyAuditLimit(userId: string, auditsUsed: number) {
  // Don't send notification if less than 2 audits used
  if (auditsUsed < 2) {
    return { notificationSent: false, reason: 'Below threshold' };
  }

  // Check if notification was already sent recently (within last 7 days)
  const { data: recentNotifications, error } = await supabase
    .from('email_notifications')
    .select('*')
    .eq('user_id', userId)
    .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('sent_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error checking recent notifications:', error);
    return { notificationSent: false, error };
  }

  if (recentNotifications && recentNotifications.length > 0) {
    const lastNotification = recentNotifications[0];
    console.log('Notification already sent recently:', lastNotification);
    return { 
      notificationSent: false, 
      reason: 'Already notified within 7 days',
      lastNotification 
    };
  }

  // Send appropriate notification
  const notificationType: NotificationType = 
    auditsUsed >= 3 ? 'audit_limit_reached' : 'audit_limit_warning';

  const result = await sendAuditLimitEmail({ userId, notificationType });
  
  return {
    notificationSent: result.success,
    notificationType,
    result,
  };
}
