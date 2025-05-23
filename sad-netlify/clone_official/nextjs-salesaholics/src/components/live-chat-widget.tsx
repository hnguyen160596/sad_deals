"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, X, Send, Image, Paperclip, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Types
interface Message {
  id: string;
  content: string;
  sender: "user" | "agent" | "bot";
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  attachments?: string[];
}

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Initialize chat with a welcome message
  useEffect(() => {
    // Simulate connection delay
    const timer = setTimeout(() => {
      setIsConnecting(false);
      setMessages([
        {
          id: "welcome",
          content: "👋 Hi there! How can we help you today?",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
        },
      ]);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!messageInput.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageInput,
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageInput("");

    // Simulate sending and update status
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "sent" } : msg
        )
      );

      // Simulate agent typing
      setIsTyping(true);

      // Simulate agent response
      setTimeout(() => {
        setIsTyping(false);

        // Generate an automated response
        let responseContent = "";
        const lowercaseMessage = messageInput.toLowerCase();

        if (lowercaseMessage.includes("price") || lowercaseMessage.includes("discount")) {
          responseContent = "We have great deals with up to 70% off on selected items! Check our deals page for more information.";
        } else if (lowercaseMessage.includes("shipping") || lowercaseMessage.includes("delivery")) {
          responseContent = "Most of our partner stores offer free shipping for orders above $35. Delivery times vary by retailer.";
        } else if (lowercaseMessage.includes("return") || lowercaseMessage.includes("refund")) {
          responseContent = "Return policies depend on the retailer. Most offer 30-day returns. Please check the specific store's policy.";
        } else if (lowercaseMessage.includes("coupon") || lowercaseMessage.includes("promo")) {
          responseContent = "You can find all available coupons on our coupons page. For exclusive promo codes, subscribe to our newsletter!";
        } else if (lowercaseMessage.includes("hello") || lowercaseMessage.includes("hi")) {
          responseContent = "Hello there! How can I assist you with finding deals today?";
        } else {
          responseContent = "Thanks for your message! Our team will get back to you shortly. In the meantime, feel free to browse our latest deals.";
        }

        const agentMessage: Message = {
          id: `agent-${Date.now()}`,
          content: responseContent,
          sender: "agent",
          timestamp: new Date(),
          status: "delivered",
        };

        setMessages((prev) => [...prev, agentMessage]);
      }, 2000);
    }, 1000);
  };

  // When Enter key is pressed without Shift, send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        className={cn(
          "fixed bottom-20 md:bottom-6 right-6 z-40 rounded-full shadow-lg h-14 w-14 p-0",
          isOpen && "bg-red-500 hover:bg-red-600"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Widget */}
      <div
        className={cn(
          "fixed bottom-20 md:bottom-24 right-6 z-30 w-[90%] max-w-md rounded-lg shadow-lg transition-all duration-300 ease-in-out transform origin-bottom-right bg-background border",
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-8 pointer-events-none"
        )}
      >
        {/* Chat Header */}
        <div className="bg-primary text-primary-foreground rounded-t-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="/images/support-avatar.png" alt="Support" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">Sales Aholics Support</h3>
              {isConnecting ? (
                <p className="text-xs">Connecting...</p>
              ) : (
                <p className="text-xs">Online | Typically replies in minutes</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="h-80 overflow-y-auto p-4 flex flex-col">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "mb-4 max-w-[80%]",
                message.sender === "user"
                  ? "self-end"
                  : "self-start"
              )}
            >
              {message.sender !== "user" && (
                <div className="flex items-center mb-1">
                  <Avatar className="h-6 w-6 mr-2">
                    {message.sender === "agent" ? (
                      <AvatarImage src="/images/support-avatar.png" alt="Agent" />
                    ) : (
                      <AvatarImage src="/images/bot-avatar.png" alt="Bot" />
                    )}
                    <AvatarFallback>
                      {message.sender === "agent" ? "A" : "B"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {message.sender === "agent" ? "Support Agent" : "Assistant"}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  "p-3 rounded-lg",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.attachments.map((attachment, i) => (
                      <div
                        key={i}
                        className="relative h-14 w-14 rounded bg-background/50"
                      >
                        <img
                          src={attachment}
                          alt="Attachment"
                          className="h-full w-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div
                className={cn(
                  "text-xs text-muted-foreground mt-1 flex",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                {new Intl.DateTimeFormat("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                }).format(message.timestamp)}
                {message.sender === "user" && (
                  <span className="ml-2">
                    {message.status === "sending" && "Sending..."}
                    {message.status === "sent" && "Sent"}
                    {message.status === "delivered" && "Delivered"}
                    {message.status === "read" && "Read"}
                    {message.status === "failed" && (
                      <span className="text-red-500">Failed to send</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="self-start mb-4 max-w-[80%]">
              <div className="flex items-center mb-1">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src="/images/support-avatar.png" alt="Agent" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">Support Agent</span>
              </div>
              <div className="bg-muted p-3 rounded-lg rounded-bl-none flex items-center">
                <div className="flex space-x-1">
                  <span className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Info Message */}
        <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/50 flex items-center">
          <Info className="h-3 w-3 mr-2" />
          <p>This is a demo chat. In a real app, this would connect to a support system.</p>
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none min-h-[80px]"
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isConnecting}
              />
              <div className="absolute bottom-2 right-2 flex space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={isConnecting}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={isConnecting}
                >
                  <Image className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!messageInput.trim() || isConnecting}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </>
  );
}
