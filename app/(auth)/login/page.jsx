import SignInForm from "./sign-in-form";
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import LogoMotto from "@/components/LogoMotto";

export default async function LoginPage() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (user?.id) {
    redirect('/home');
  }

  return (
    <div className="flex h-screen w-full">
      <div className="flex justify-center items-center w-1/2">
        <LogoMotto />
      </div>
      <div className="flex justify-center items-center w-full xl:w-1/2 p-6">
        <SignInForm />
      </div>
    </div>
  );
}
