"use client";
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import { SignUp } from "@supabase/auth-ui-react";
import { classAppearance } from "@/app/formStyle";
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUpForm() {
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
    <div className="w-11/12 p-6 sm:p-10 rounded-lg sm:w-8/12 shadow-2xl bg-white">
      <h2 className="font-semibold text-4xl mb-4 text-gray-900">Create an Account</h2>
      <p className="font-medium mb-6 text-gray-900">Let&apos;s get started</p>
      <SignUp
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        localization={{
          variables: {
            sign_up: {
              email_label: "Email",
              password_label: "Password",
              button_label: "Create account",
            },
          },
        }}
        providers={[]}
      />
      <div className="pt-6 text-center text-gray-900">
        Already have an account?{" "}
        <Link href="/login" className="underline text-blue-500">
          Sign In
        </Link>
      </div>
    </div>
  );
}
