
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ListTodo,
  FileQuestion,
  MessageCircle,
  Trophy,
  UserCheck,
  Settings,
  BrainCircuit,
  HeartHandshake,
  BookCopy,
} from "lucide-react";

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/home", icon: LayoutGrid, label: "Home" },
  { href: "/planner", icon: ListTodo, label: "My Planner" },
  { href: "/syllabus", icon: BookCopy, label: "Syllabus" },
  { href: "/quiz", icon: FileQuestion, label: "Quiz" },
  { href: "/chat", icon: MessageCircle, label: "Chatbot" },
  { href: "/rewards", icon: Trophy, label: "Rewards" },
  { href: "/mentor", icon: HeartHandshake, label: "Mindful Mentor" },
  { type: "separator" },
  { href: "/teacher", icon: UserCheck, label: "Teacher Mode" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <BrainCircuit className="w-8 h-8 text-primary" />
          <h2 className="text-xl font-bold font-headline">SANKALP</h2>
        </div>
      </SidebarHeader>
      <div className="flex-1 overflow-y-auto">
        <SidebarMenu className="p-2">
          {navItems.map((item, index) => {
            // Hide Teacher Mode if not a teacher
            if (item.label === "Teacher Mode" && role !== 'teacher') {
              return null;
            }

            return item.type === "separator" ? (
              <Separator key={index} className="my-2" />
            ) : (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href!}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </div>
      <SidebarFooter>
        <div className="p-2">
          <Button variant="outline" className="w-full">
            Help & Feedback
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
