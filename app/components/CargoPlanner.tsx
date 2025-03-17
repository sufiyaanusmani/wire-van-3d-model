"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { ChatBox } from "./forms/ChatBox";
import { extractBoxesFromText } from "@/lib/groqService";
import { useBoxStore } from "@/lib/store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function CargoPlanner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const addBox = useBoxStore(state => state.addBox);

  const handleSubmit = async (content: string) => {
    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Extract boxes from text using Groq
      const boxes = await extractBoxesFromText(content);
      
      // Add boxes to the store
      boxes.forEach(box => {
        // Handle multiple quantities by adding the same box multiple times
        addBox({
          length: box.length,
          width: box.width,
          height: box.height,
          weight: box.weight
        });
      });
      
      // Add assistant response
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `I've added ${boxes.length} cargo items to your van.`
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error processing cargo:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I couldn't process your cargo request. Please try describing your items with more details."
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <CardTitle className="text-lg">Cargo Planner</CardTitle>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <RefreshCw size={16} className="mr-2" />
            Clear Chat
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 mb-3 h-[200px] overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p>Describe what you need to transport in your van</p>
              <p className="text-sm mt-1">For example: &quot;I need to move 3 boxes and a bicycle&quot;</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-2 rounded-lg text-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-8"
                    : "bg-muted mr-8"
                }`}
              >
                {message.content}
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted mr-8 text-sm">
              <Loader2 className="h-3 w-3 animate-spin" />
              <p>Planning your cargo...</p>
            </div>
          )}
        </div>
        <ChatBox onSubmit={handleSubmit} isProcessing={isProcessing} />
      </CardContent>
    </Card>
  );
}