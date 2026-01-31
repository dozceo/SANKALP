"use client";

import { Header } from "@/components/app/header";
import { SidebarNav } from "@/components/app/sidebar-nav";
import { TeacherSidebarNav } from "@/components/app/teacher-sidebar-nav";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { StudentProvider } from "@/contexts/StudentContext";
import { EventTrackerInit } from "@/components/EventTrackerInit";
import { useAuth } from "@/contexts/AuthContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = useAuth();

  return (
    <StudentProvider>
      <EventTrackerInit />
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar className="border-r">
            {role === 'teacher' ? <TeacherSidebarNav /> : <SidebarNav />}
          </Sidebar>
          <SidebarInset>
            <div className="flex flex-col h-screen w-full">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/30">
                {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </StudentProvider>
  );
}
