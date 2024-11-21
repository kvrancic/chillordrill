import SignUpForm from "./sign-up-form";
import LogoMotto from '@/components/LogoMotto';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
//import RandomImage from '@/components/RandomImage';

export default async function SignupPage() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (user?.id) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen w-full"> 
      <div className="flex justify-center items-center w-full xl:w-1/2 p-6">
        <LogoMotto />
      </div>
      <div className="flex justify-center items-center w-full xl:w-1/2 p-6">
        <SignUpForm />
      </div>
    </div>
  );
}
