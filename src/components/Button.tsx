// components/Button.tsx
"use client";
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

export default function Button({ children, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
      {...props}
    >
      {children}
    </button>
  );
}
