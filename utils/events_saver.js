import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const logEvent = async (userId, sessionId, pageName, event_type, elementText='', elementClass='') => {
  const { error } = await supabase
    .from('events')
    .insert([
      {
        user_id: userId,
        session_id: sessionId,
        page_name: pageName,
        created_at: new Date().toISOString(),
        event_type: event_type,
        element_text: elementText,
        element_class: elementClass
      },
    ]);

  if (error) {
    console.error('Error logging event:', error);
  }
};

export const logPageView = async (supabase, pathname) => {
    if (!sessionStorage.getItem('sessionId')) {
      const sessionId = `session_${Date.now()}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    const sessionId = sessionStorage.getItem('sessionId');
  
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user ? user.id : '00000000-0000-0000-0000-000000000000';
    logEvent(userId, sessionId, pathname, 'PAGE_VIEWED');
  };
  
  export const handleButtonClick = async (supabase, pathname, target) => {
    const sessionId = sessionStorage.getItem('sessionId') || 'unknown_session';
  
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user ? user.id : '00000000-0000-0000-0000-000000000000';
    logEvent(userId, sessionId, pathname, 'BUTTON_CLICKED', target.textContent, target.classList.value);
  };
  
  export const handleLinkClick = async (supabase, pathname, target) => {
    const sessionId = sessionStorage.getItem('sessionId') || 'unknown_session';
  
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user ? user.id : '00000000-0000-0000-0000-000000000000';
    logEvent(userId, sessionId, pathname, 'LINK_CLICKED', target.textContent, target.classList.value);
  };