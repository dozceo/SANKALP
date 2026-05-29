
"use client";

import { useState } from "react";
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
  Copy,
  Check,
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
  { href: "/classes", icon: UserCheck, label: "Classroom" },
  { href: "/planner", icon: ListTodo, label: "My Planner" },
  { href: "/syllabus", icon: BookCopy, label: "Syllabus" },
  { href: "/quiz", icon: FileQuestion, label: "Quiz" },
  { href: "/chat", icon: MessageCircle, label: "Chatbot" },
  { href: "/rewards", icon: Trophy, label: "Rewards" },
  { href: "/mentor", icon: HeartHandshake, label: "Mindful Mentor" },
  { href: "/brain-map", icon: BrainCircuit, label: "Brain Map" },
  { type: "separator" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const [isCopied, setIsCopied] = useState(false);

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
          {navItems.map((item, index) =>
            item.type === "separator" ? (
              <Separator key={index} className="my-2" />
            ) : (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href!}>
                    {item.icon && <item.icon />}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </div>
      <SidebarFooter>
        <div className="p-4 space-y-4">
          {user && (
            <div className="p-3 bg-secondary/50 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  My User ID
                </span>
                <Button
                  variant="ghost"
                  size="icon" aria-label="Toggle section"
                  className="h-6 w-6"
                  onClick={() => {
                    navigator.clipboard.writeText(user.uid);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  title={isCopied ? "Copied" : "Copy ID"}
                  aria-label={isCopied ? "Copied User ID" : "Copy User ID"}
                >
                  {isCopied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="text-xs font-mono truncate text-foreground/80">
                {user.uid}
              </div>
            </div>
          )}
          <Button variant="outline" className="w-full">
            Help & Feedback
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
