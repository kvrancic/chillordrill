import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function LandingPage() {
  const supabase = createClient();

  // Step 1: Check if the user is logged in
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect('/login');
  }

  // Step 2: Check if the user has courses
  const { data: coursesData, error: coursesError } = await supabase
    .from('user_courses')
    .select('id')
    .eq('user_id', userData.user.id);

  if (coursesError || !coursesData || coursesData.length === 0) {
    redirect('/finish-profile');
  }

  // Step 3: Redirect to /home if all checks pass
  redirect('/home');

  // Optional: Add a placeholder in case the redirection doesn't work (fallback)
  return <p>Redirecting...</p>;
}
