import { ChatPanel } from "@/components/chat/chat-panel";
import { LogoIcon } from "@/components/icons";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-4">
          <LogoIcon className="w-10 h-10 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-headline">
            Ecom Insights AI
          </h1>
        </div>
        <p className="text-muted-foreground text-base sm:text-lg mb-8">
          Ask questions about your e-commerce data and get intelligent, real-time answers.
        </p>
      </div>
      <ChatPanel />
    </main>
  );
}
