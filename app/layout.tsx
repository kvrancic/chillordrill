"use client"; // Keep this directive for client component

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from '@/utils/supabase/client';
import { logEvent } from '@/utils/events_saver';
import RootLayout from './RootLayout';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const pathname = usePathname();

  useEffect(() => {
    const logPageView = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user ? user.id : '00000000-0000-0000-0000-000000000000';
      logEvent(userId, pathname);
    };

    // Log the initial page view
    logPageView();
  }, [supabase, pathname]);

  return (
    <RootLayout>
      {children}
    </RootLayout>
  );
}