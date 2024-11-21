"use client";
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import { ForgottenPassword } from "@supabase/auth-ui-react";
import { classAppearance } from "@/app/formStyle";

export default function ForgotPasswordForm() {
  const supabase = createClient();

  return (
    <div className="w-11/12 p-6 sm:p-10 rounded-lg sm:w-8/12 md:w-6/12 lg:w-5/12 xl:w-4/12 bg-white shadow-2xl">
      <h2 className="font-semibold text-4xl mb-4">Forgot Password</h2>
      <p className="font-medium mb-6">
        It happens! Enter your email to reset your password.
      </p>
      <ForgottenPassword
        supabaseClient={supabase}
        appearance={classAppearance}
        localization={{
          variables: {
            forgotten_password: {
              email_label: "Email",
              button_label: "Send reset link",
            },
          },
        }}
      />
      <div className="pt-6 text-center">
        Not registered yet?{" "}
        <Link href="/auth/signup" className="underline text-blue-500">
          Create an account
        </Link>
      </div>
    </div>
  );
}
