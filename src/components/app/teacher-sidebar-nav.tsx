"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    BarChart3,
    AlertTriangle,
    Settings,
    BrainCircuit,
    Copy,
} from "lucide-react";

import {
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";

const teacherNavItems = [
    { href: "/teacher", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/teacher/students", icon: Users, label: "Students" },
    { href: "/teacher/classes", icon: BookOpen, label: "Classes" },
    { href: "/teacher/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/teacher/interventions", icon: AlertTriangle, label: "Interventions" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

export function TeacherSidebarNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <>
            <SidebarHeader>
                <div className="flex items-center gap-2 p-2">
                    <BrainCircuit className="w-8 h-8 text-primary" />
                    <div>
                        <h2 className="text-xl font-bold font-headline">SANKALP</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Teacher Portal</p>
                    </div>
                </div>
            </SidebarHeader>
            <div className="flex-1 overflow-y-auto">
                <SidebarMenu className="p-2">
                    {teacherNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === item.href}
                                tooltip={{ children: item.label }}
                            >
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </div>
            <SidebarFooter>
                <div className="p-4 space-y-4">
                    {user && (
                        <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                    My Teacher ID
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                        navigator.clipboard.writeText(user.uid);
                                    }}
                                    title="Copy ID"
                                >
                                    <Copy className="h-3 w-3" />
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
