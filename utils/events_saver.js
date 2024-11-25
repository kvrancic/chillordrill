import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const logEvent = async (userId, pageName, event_type) => {
  const { error } = await supabase
    .from('events')
    .insert([
      {
        user_id: userId,
        page_name: pageName,
        created_at: new Date().toISOString(),
        event_type: 'PAGE_VIEWED',
      },
    ]);

  if (error) {
    console.error('Error logging event:', error);
  }
};