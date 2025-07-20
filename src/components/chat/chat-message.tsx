"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User, Database, FileCode2 } from "lucide-react";
import type { AIResponse } from "@/app/actions";
import { StreamingText } from "./streaming-text";
import { Skeleton } from "../ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "../ui/badge";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string | React.ReactNode;
  isLoading?: boolean;
};

export function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const isUser = role === "user";
  const aiResponse = typeof content === "object" ? (content as AIResponse) : null;

  return (
    <div
      className={cn(
        "flex items-start gap-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 border">
          <AvatarFallback>
            <Bot className="w-5 h-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[80%] p-4 rounded-2xl",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card rounded-bl-none border"
        )}
      >
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            {aiResponse ? (
              <div className="space-y-4">
                <StreamingText text={aiResponse.answer} />
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="details" className="border-none">
                    <AccordionTrigger className="text-sm p-2 hover:no-underline -mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Show Details</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                          <FileCode2 className="w-4 h-4" /> Generated SQL Query
                        </h4>
                        <pre className="bg-muted p-3 rounded-lg text-xs font-code overflow-x-auto">
                          <code>{aiResponse.sql}</code>
                        </pre>
                      </div>
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                          <Database className="w-4 h-4" /> Returned Data
                        </h4>
                        <pre className="bg-muted p-3 rounded-lg text-xs font-code overflow-x-auto max-h-48">
                          <code>
                            {JSON.stringify(aiResponse.data, null, 2)}
                          </code>
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ) : (
              <p>{content as string}</p>
            )}
          </>
        )}
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 border">
          <AvatarFallback>
            <User className="w-5 h-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
