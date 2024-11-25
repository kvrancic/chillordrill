"use client"; // Keep this directive for client component

import { usePathname } from "next/navigation";
import { createClient } from '@/utils/supabase/client';
import RootLayout from './RootLayout';
import { useEventLogger } from '@/utils/hooks/useEventLogger';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const pathname = usePathname();
  // events logging
  useEventLogger(supabase, pathname);

  return (
    <RootLayout>
      {children}
    </RootLayout>
  );
}