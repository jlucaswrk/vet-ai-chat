"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Message, PDFDocument } from "@/lib/types";

interface ChatInterfaceProps {
  apiKey: string | null;
  documents: PDFDocument[];
  onNeedApiKey: () => void;
}

export function ChatInterface({
  apiKey,
  documents,
  onNeedApiKey,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getContext = () => {
    if (documents.length === 0) return null;
    return documents.map((doc) => `[${doc.name}]\n${doc.content}`).join("\n\n---\n\n");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim()) return;

    if (!apiKey) {
      onNeedApiKey();
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          apiKey,
          context: getContext(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar mensagem");
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestedQuestions = [
    "Quais são os principais sintomas discutidos no material?",
    "Explique os tratamentos mencionados nos slides",
    "Resuma os pontos principais do conteúdo",
    "Quais são as doenças abordadas no material?",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 gradient-text">
                Olá! Sou sua IA Veterinária
              </h2>
              <p className="text-muted-foreground max-w-md mb-8">
                {documents.length > 0
                  ? `Tenho ${documents.length} documento(s) carregado(s). Faça suas perguntas sobre o conteúdo!`
                  : "Faça upload de seus slides em PDF na barra lateral para começar a tirar suas dúvidas."}
              </p>

              {documents.length > 0 && (
                <div className="space-y-3 w-full max-w-md">
                  <p className="text-sm text-muted-foreground">
                    Sugestões de perguntas:
                  </p>
                  <div className="grid gap-2">
                    {suggestedQuestions.map((question, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 px-4"
                        onClick={() => {
                          setInput(question);
                          textareaRef.current?.focus();
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-2 text-primary shrink-0" />
                        <span className="text-sm">{question}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 message-animate ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar
                  className={`w-10 h-10 shrink-0 ${
                    message.role === "assistant"
                      ? "bg-primary/10"
                      : "bg-secondary"
                  }`}
                >
                  <div className="flex items-center justify-center w-full h-full">
                    {message.role === "assistant" ? (
                      <Bot className="w-5 h-5 text-primary" />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </Avatar>
                <Card
                  className={`flex-1 p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
                  <span className="text-xs opacity-60 mt-2 block">
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </Card>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-4 message-animate">
              <Avatar className="w-10 h-10 bg-primary/10 shrink-0">
                <div className="flex items-center justify-center w-full h-full">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              </Avatar>
              <Card className="p-4 bg-card">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Analisando...
                  </span>
                </div>
              </Card>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex gap-3 items-end"
        >
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                documents.length > 0
                  ? "Digite sua pergunta sobre o material..."
                  : "Faça upload de um PDF primeiro..."
              }
              className="min-h-[52px] max-h-[200px] resize-none pr-4"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="h-[52px] w-[52px] shrink-0"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>

        {!apiKey && (
          <p className="text-center text-sm text-muted-foreground mt-3">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={onNeedApiKey}
            >
              Configure sua API Key para começar
            </Badge>
          </p>
        )}
      </div>
    </div>
  );
}
