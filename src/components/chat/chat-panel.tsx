"use client";

import * as React from "react";
import { SendHorizonal, LoaderCircle } from "lucide-react";
import { askQuestion, type AIResponse } from "@/app/actions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string | React.ReactNode;
  isLoading?: boolean;
};

const PRESET_QUESTIONS = [
  "What are my sales in the last 7 days?",
  "Calculate the RoAS (Return on Ad Spend).",
  "Which product had the highest CPC (Cost Per Click)?",
];

export function ChatPanel() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    const assistantPlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userInput, assistantPlaceholder]);
    setInput("");
    setIsPending(true);

    try {
      const response: AIResponse = await askQuestion(input);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholder.id
            ? { ...msg, isLoading: false, content: response }
            : msg
        )
      );
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantPlaceholder.id)
      );
    } finally {
      setIsPending(false);
    }
  };

  const handlePresetQuestionClick = (question: string) => {
    setInput(question);
    const form = document.getElementById("chat-form") as HTMLFormElement;
    if (form) {
      // Small timeout to allow state to update before submitting
      setTimeout(() => form.requestSubmit(), 100);
    }
  };

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <Card className="w-full max-w-3xl h-[70vh] flex flex-col shadow-2xl rounded-2xl">
      <CardHeader className="border-b">
        <p className="text-muted-foreground text-sm text-center">
          This is a demo application. Database interactions are mocked.
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p className="mb-4">No messages yet. Ask a question to start!</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {PRESET_QUESTIONS.map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 leading-normal"
                      onClick={() => handlePresetQuestionClick(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => <ChatMessage key={msg.id} {...msg} />)
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form id="chat-form" onSubmit={handleSubmit} className="w-full flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What's the trend on product sales?"
            disabled={isPending}
            className="flex-1"
            aria-label="Chat input"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isPending || !input.trim()}
            aria-label="Send message"
          >
            {isPending ? (
              <LoaderCircle className="w-5 h-5 animate-spin" />
            ) : (
              <SendHorizonal className="w-5 h-5" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
