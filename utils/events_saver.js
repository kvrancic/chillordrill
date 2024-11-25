import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const logEvent = async (userId, sessionId, pageName, event_type) => {
  const { error } = await supabase
    .from('events')
    .insert([
      {
        user_id: userId,
        session_id: sessionId,
        page_name: pageName,
        created_at: new Date().toISOString(),
        event_type: event_type,
      },
    ]);

  if (error) {
    console.error('Error logging event:', error);
  }
};