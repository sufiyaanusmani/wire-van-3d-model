"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

interface ChatBoxProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  isProcessing?: boolean;
}

export function ChatBox({ onSubmit, placeholder = "Describe what you need to transport...", isProcessing = false }: ChatBoxProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;
    
    onSubmit(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full bg-card rounded-lg border shadow-sm">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full resize-none min-h-[60px] max-h-[200px] p-4 pr-12 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
          disabled={isProcessing}
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute bottom-2 right-2"
          disabled={!message.trim() || isProcessing}
        >
          <SendHorizontal size={18} />
        </Button>
      </form>
      <div className="px-4 pb-3 text-xs text-muted-foreground">
        <p>
          Press Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}