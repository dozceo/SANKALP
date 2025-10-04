
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Bot, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { audioConversation } from "@/app/(main)/chat/actions";
import { useToast } from "@/hooks/use-toast";

type ConversationState = "idle" | "recording" | "processing" | "speaking";

export function AudioConversation() {
  const [conversationState, setConversationState] = useState<ConversationState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setConversationState("processing");
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const response = await audioConversation(base64Audio);
          if (response?.audioDataUri) {
            playAudio(response.audioDataUri);
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Could not process audio. Please try again.",
            });
            setConversationState("idle");
          }
        };
      };

      mediaRecorderRef.current.start();
      setConversationState("recording");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Could not access the microphone. Please check permissions and try again.",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && conversationState === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const playAudio = (audioDataUri: string) => {
    setConversationState("speaking");
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.onended = () => {
        setConversationState("idle");
      };
    }
    audioPlayerRef.current.src = audioDataUri;
    audioPlayerRef.current.play();
  };

  const getButtonState = () => {
    switch (conversationState) {
      case "idle":
        return {
          icon: <Mic className="h-10 w-10" />,
          text: "Tap to Speak",
          action: handleStartRecording,
          disabled: false,
          color: "bg-blue-500 hover:bg-blue-600",
        };
      case "recording":
        return {
          icon: <MicOff className="h-10 w-10" />,
          text: "Listening...",
          action: handleStopRecording,
          disabled: false,
          color: "bg-red-500 hover:bg-red-600 animate-pulse",
        };
      case "processing":
        return {
          icon: <Loader2 className="h-10 w-10 animate-spin" />,
          text: "Thinking...",
          action: () => {},
          disabled: true,
          color: "bg-gray-500",
        };
      case "speaking":
        return {
          icon: <Bot className="h-10 w-10" />,
          text: "Speaking...",
          action: () => {},
          disabled: true,
          color: "bg-purple-500",
        };
    }
  };

  const { icon, text, action, disabled, color } = getButtonState();

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4">
       <div className="relative">
        <BrainCircuit className={cn("h-24 w-24 text-muted-foreground transition-colors duration-500", 
            conversationState === 'recording' && 'text-red-500',
            conversationState === 'processing' && 'text-yellow-500',
            conversationState === 'speaking' && 'text-purple-500',
        )} />
      </div>
      <Button
        onClick={action}
        disabled={disabled}
        className={cn(
          "h-32 w-32 rounded-full flex flex-col items-center justify-center gap-2 text-white transition-all duration-300 transform hover:scale-105",
          color
        )}
      >
        {icon}
        <span className="text-sm font-semibold">{text}</span>
      </Button>
    </div>
  );
}
