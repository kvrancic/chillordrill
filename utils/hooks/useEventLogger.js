import { useEffect } from 'react';
import { logPageView, handleButtonClick, handleLinkClick } from '@/utils/events_saver';

export function useEventLogger(supabase, pathname) {
  useEffect(() => {
    logPageView(supabase, pathname);
  }, [supabase, pathname]);

  useEffect(() => {
    const handleClick = async (event) => {
      const target = event.target;

      if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
        await handleButtonClick(supabase, pathname, target);
      } else if (target.tagName === 'A') {
        await handleLinkClick(supabase, pathname, target);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [supabase, pathname]);
}
