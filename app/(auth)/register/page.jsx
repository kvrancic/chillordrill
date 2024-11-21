'use client';

import { useState } from 'react';
import { PasswordInput, TextInput, rem } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';
import { signup } from '@/app/(auth)/actions';
import LogoMotto from '@/components/LogoMotto';
import { useDisclosure } from '@mantine/hooks';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [visible, { toggle }] = useDisclosure(false);

  const validateEmail = (email) => {
    if (!email.endsWith('@epfl.ch')) {
      setEmailError('Only @epfl.ch emails are allowed');
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-darkblue to-black">
      {/* Left Section */}
      <div className="w-full md:w-1/2">
        <LogoMotto />
      </div>
      {/* Right Section */}
      <div className="w-full md:w-1/2 p-8">
        <form className="space-y-4 w-2/3 ml-[100px]" onSubmit={(e) => e.preventDefault()}>
          <h1 className="text-2xl font-bold text-center">Register</h1>
          <TextInput
            withAsterisk
            label="Email"
            placeholder="Your email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              validateEmail(event.target.value);
            }}
            error={emailError}
          />
          <PasswordInput
            withAsterisk
            label="Password"
            placeholder="Your password"
            value={password}
            visible={visible}
            onVisibilityChange={toggle}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            formAction={signup}
            disabled={!!emailError || !password}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
