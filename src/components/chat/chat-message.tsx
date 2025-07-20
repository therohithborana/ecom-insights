"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User, Database, FileCode2, BarChart } from "lucide-react";
import type { AIResponse } from "@/app/actions";
import { StreamingText } from "./streaming-text";
import { Skeleton } from "../ui/skeleton";
import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DataChart } from "./data-chart";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string | React.ReactNode;
  isLoading?: boolean;
};

export function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const [isChartVisible, setIsChartVisible] = React.useState(false);
  const isUser = role === "user";
  const aiResponse = typeof content === "object" ? (content as AIResponse) : null;

  const canVisualize = aiResponse?.visualization?.isVisualizable && aiResponse.data.rows.length > 0;

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

                {canVisualize && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChartVisible(!isChartVisible)}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    {isChartVisible ? "Hide" : "Visualize"}
                  </Button>
                )}

                {isChartVisible && canVisualize && (
                  <div className="w-full min-w-[400px] h-[300px] bg-background p-4 rounded-lg">
                    <DataChart
                      data={aiResponse.data.rows}
                      chartType={aiResponse.visualization.chartType}
                      title={aiResponse.visualization.chartTitle}
                    />
                  </div>
                )}


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
