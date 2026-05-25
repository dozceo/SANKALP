
"use client";

import { usePathname } from "next/navigation";
import {
  BookOpen,
  User,
  LogOut,
  Moon,
  Sun,
  Laptop,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "../theme-provider";
import { StudentSelector } from "@/components/StudentSelector";
import { LogoutButton } from "@/components/LogoutButton";

const pathToTitle: { [key: string]: string } = {
  "/home": "Dashboard",
  "/planner": "My Planner",
  "/quiz": "Quiz Engine",
  "/chat": "Mentorship & Chatbot",
  "/rewards": "Rewards",
  "/teacher": "Teacher Mode",
  "/settings": "Settings",
  "/syllabus": "Academic Syllabus",
  "/profile": "Student Profile"
};

export function Header() {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const title = pathToTitle[pathname] || "SANKALP";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl font-headline">
        {title}
      </h1>
      <div className="ml-auto flex items-center gap-4">
        <StudentSelector />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Laptop className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <LogoutButton />
      </div>
    </header>
  );
}
