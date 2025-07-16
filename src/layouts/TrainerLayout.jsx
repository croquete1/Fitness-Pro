// src/layouts/TrainerLayout.jsx
import React from "react";
import SidebarTrainer from "../components/SidebarTrainer";

export default function TrainerLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <SidebarTrainer />
      <main className="flex-1 bg-gray-100">{children}</main>
    </div>
  );
}
