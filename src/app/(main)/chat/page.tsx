
"use client";

import { useState, useRef, useEffect } from "react";
import { getExplanation, getTextToSpeech } from "./actions";
import type { ChatMessage } from "@/ai/rag/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, Bot, User, Volume2, CircleStop, Mic } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AudioConversation } from "@/components/app/audio-conversation";
import { useTranslations } from 'next-intl';


type Message = {
  id: number;
  role: "user" | "bot";
  content: string;
};

export default function ChatPage() {
    const t = useTranslations('Chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [language, setLanguage] = useState("English");
    const [isLoading, setIsLoading] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState<number | null>(null);
    const [audioLoading, setAudioLoading] = useState<number | null>(null);
    const [isAudioChatOpen, setIsAudioChatOpen] = useState(false);
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load chat history
    useEffect(() => {
        const savedMessages = localStorage.getItem('chat_messages');
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
    }, []);

    // Save chat history
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_messages', JSON.stringify(messages));
        }
    }, [messages]);

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
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        // Send the full chat history so the RAG pipeline can build an enriched
        // query from conversational context, not just the current message.
        const chatHistory: ChatMessage[] = updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
        }));
        
        const result = await getExplanation(input, language, chatHistory);
        
        const botMessage: Message = { id: Date.now() + 1, role: "bot", content: result.content };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    const handlePlayAudio = async (message: Message) => {
        if (audioPlaying === message.id) {
            audioRef.current?.pause();
            setAudioPlaying(null);
            return;
        }

        setAudioLoading(message.id);
        const audioDataUri = await getTextToSpeech(message.content);
        setAudioLoading(null);
        
        if (audioDataUri) {
            if (!audioRef.current) {
                audioRef.current = new Audio();
                audioRef.current.onended = () => setAudioPlaying(null);
            }
            audioRef.current.src = audioDataUri;
            audioRef.current.play();
            setAudioPlaying(message.id);
        }
    }

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
                <p className="text-muted-foreground">
                    {t('description')}
                </p>
            </div>
            <Card className="flex flex-col flex-1">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                    <div className="flex items-center gap-2">
                         <Button variant="ghost" size="icon" onClick={() => setIsAudioChatOpen(true)}>
                            <Mic className="h-6 w-6 text-primary" />
                            <span className="sr-only">Start Audio Conversation</span>
                        </Button>
                        <div>
                            <CardTitle>{t('botName')}</CardTitle>
                            <CardDescription>{t('botDescription')}</CardDescription>
                        </div>
                    </div>
                     <Select defaultValue={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder={t('selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="Hindi">Hindi</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full p-6" ref={scrollAreaRef as any}>
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-muted-foreground">
                                    <p>{t('emptyState')}</p>
                                </div>
                            )}
                            {messages.map((message) => (
                                <div key={message.id} className={cn("flex items-start gap-4", message.role === "user" ? "justify-end" : "justify-start")}>
                                    {message.role === "bot" && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback><Bot/></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className="group relative">
                                        <div className={cn("max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                            <p className="text-sm">{message.content}</p>
                                        </div>
                                         {message.role === 'bot' && (
                                            <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute -bottom-4 -right-4 h-8 w-8 rounded-full bg-background opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                            onClick={() => handlePlayAudio(message)}
                                            disabled={audioLoading === message.id}
                                            title={audioPlaying === message.id ? "Stop reading" : "Read aloud"}
                                            >
                                                {audioLoading === message.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                                                 audioPlaying === message.id ? <CircleStop className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />
                                                }
                                                <span className="sr-only">
                                                    {audioPlaying === message.id ? "Stop reading" : "Read aloud"}
                                                </span>
                                            </Button>
                                        )}
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
                                        <AvatarFallback><Bot/></AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted p-3 rounded-lg">
                                        <Loader2 className="h-5 w-5 animate-spin"/>
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
                            placeholder={t('placeholder')}
                            disabled={isLoading}
                            aria-label="Chat message"
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            aria-label="Send message"
                            title="Send message"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>

            <Dialog open={isAudioChatOpen} onOpenChange={setIsAudioChatOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('audioTitle')}</DialogTitle>
                    </DialogHeader>
                    <AudioConversation />
                </DialogContent>
            </Dialog>
        </div>
    );
}
