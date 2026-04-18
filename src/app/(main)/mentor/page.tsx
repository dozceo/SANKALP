
"use client";

import { useState, useRef, useEffect } from "react";
import { getMotivationalAdvice } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, Bot, User, HeartHandshake } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type Message = {
    id: number;
    role: "user" | "bot";
    content: string;
};

export default function MentorPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            role: "bot",
            content: "Hello! I'm your Mindful Mentor. How are you feeling today? Whether you're stressed about exams or just need some encouragement, I'm here to help."
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now(), role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        const result = await getMotivationalAdvice(input, user?.uid);

        const botMessage: Message = { id: Date.now() + 1, role: "bot", content: result.content };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-headline">Mindful Mentor</h1>
                <p className="text-muted-foreground">
                    Your personal AI counselor for academic and emotional support.
                </p>
            </div>
            <Card className="flex flex-col flex-1">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <HeartHandshake className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle>Your Private Counselor</CardTitle>
                            <CardDescription>A safe space to talk about your challenges.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full p-6" ref={scrollAreaRef as any}>
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div key={message.id} className={cn("flex items-start gap-4", message.role === "user" ? "justify-end" : "justify-start")}>
                                    {message.role === "bot" && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback><Bot /></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className="group relative">
                                        <div className={cn("max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    </div>
                                    {message.role === "user" && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback><User /></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-4 justify-start">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><Bot /></AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted p-3 rounded-lg">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter>
                    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Tell me what's on your mind..."
                            disabled={isLoading}
                            aria-label="Your message"
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            aria-label="Send message"
                            title="Send message"
                        >
                            <Send className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
