// src/app/login/LoginClient.tsx
"use client";

import LoginForm from "@/components/auth/LoginForm";

type Props = {
  error?: string;
  callbackUrl?: string;
};

export default function LoginClient({ error, callbackUrl }: Props) {
  return <LoginForm error={error} callbackUrl={callbackUrl} />;
}
