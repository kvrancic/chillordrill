"use client";
import Link from "next/link";
import { createClient } from '@/utils/supabase/client'
import { SignIn } from "@supabase/auth-ui-react";
import { classAppearance } from "@/app/formStyle";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function SignInForm() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
  });

  return (
    <div className="w-11/12 p-12 px-6 py-10 rounded-lg sm:w-9/12 md:w-8/12 lg:w-7/12 2xl:w-5/12 sm:px-10 sm:py-6 shadow-2xl bg-white">
      <h2 className="font-semibold text-4xl mb-4">Sign in</h2>
      <p className="font-medium mb-4">Hi, Welcome back</p>
      <SignIn
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        
      />
      <div className="pt-4 text-center">
        <Link className="block pb-2 text-blue-500" href="/forgotpassword">
          Forgot Password?
        </Link>
      </div>
      <div className="pt-4 text-center">
        Not registered yet?{" "}
        <Link href="/signup" className="underline text-blue-500">
          Create an account
        </Link>
      </div>
    </div>
  );
}