import React from "react";
import { PageTransition } from "@/components/layout/PageTransition";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-full h-full relative flex flex-col">
      <PageTransition>{children}</PageTransition>
    </section>
  );
}