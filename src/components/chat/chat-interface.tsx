"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  AlertCircle,
  FileText,
  Zap,
  MessageSquare,
  BookOpen,
  Heart,
  PawPrint,
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
    { icon: FileText, text: "Quais são os principais sintomas discutidos?" },
    { icon: Heart, text: "Explique os tratamentos mencionados" },
    { icon: BookOpen, text: "Resuma os pontos principais" },
    { icon: PawPrint, text: "Quais doenças são abordadas?" },
  ];

  const features = [
    { icon: Zap, title: "Respostas Rápidas", description: "Análise instantânea do conteúdo" },
    { icon: BookOpen, title: "Base em PDFs", description: "Respostas baseadas no seu material" },
    { icon: MessageSquare, title: "Conversas", description: "Tire dúvidas de forma natural" },
  ];

  return (
    <div className="flex flex-col h-full bg-mesh">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-16 text-center px-4">
              {/* Hero Icon */}
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-primary/30">
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="gradient-text">Olá! Sou o VetAI</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-md">
                Seu assistente veterinário inteligente, pronto para ajudar com suas dúvidas.
              </p>

              {/* Status Cards */}
              {documents.length === 0 ? (
                <Card className="p-6 mb-8 max-w-md w-full border-dashed border-2 bg-card/50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                      <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold mb-1">Nenhum documento carregado</p>
                      <p className="text-sm text-muted-foreground">
                        Faça upload de seus slides em PDF na barra lateral para começar
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-4 mb-8 max-w-md w-full bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {documents.length} documento{documents.length > 1 ? 's' : ''} carregado{documents.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                        Pronto para responder suas perguntas!
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Features Grid */}
              {documents.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
                  {features.map((feature, i) => (
                    <Card key={i} className="p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/80">
                      <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="font-medium text-sm">{feature.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                    </Card>
                  ))}
                </div>
              )}

              {/* Suggested Questions */}
              {documents.length > 0 && (
                <div className="w-full max-w-lg space-y-3">
                  <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Sugestões de perguntas
                  </p>
                  <div className="grid gap-2">
                    {suggestedQuestions.map((question, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                        onClick={() => {
                          setInput(question.text);
                          textareaRef.current?.focus();
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                          <question.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm">{question.text}</span>
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
                className={`flex gap-3 md:gap-4 message-animate ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar
                  className={`w-10 h-10 shrink-0 rounded-xl ${
                    message.role === "assistant"
                      ? "bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20"
                      : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-center w-full h-full">
                    {message.role === "assistant" ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    )}
                  </div>
                </Avatar>
                <Card
                  className={`flex-1 p-4 shadow-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-primary to-emerald-600 text-white border-0"
                      : "bg-card"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
                  <span className={`text-xs mt-3 block ${
                    message.role === "user" ? "text-white/70" : "text-muted-foreground"
                  }`}>
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </Card>
              </div>
            ))
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex gap-4 message-animate">
              <Avatar className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20 shrink-0">
                <div className="flex items-center justify-center w-full h-full">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </Avatar>
              <Card className="p-4 bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary typing-dot" />
                    <span className="w-2.5 h-2.5 rounded-full bg-primary typing-dot" />
                    <span className="w-2.5 h-2.5 rounded-full bg-primary typing-dot" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Analisando seu material...
                  </span>
                </div>
              </Card>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 message-animate">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-destructive text-sm">Erro ao processar</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t glass p-4 md:p-6">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto"
        >
          <div className="flex gap-3 items-end">
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
                className="min-h-[56px] max-h-[200px] resize-none pr-4 rounded-xl bg-background shadow-sm border-2 focus:border-primary transition-colors"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-14 w-14 rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Helper Text */}
          {!apiKey && (
            <div className="mt-3 text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onNeedApiKey}
                className="text-primary hover:text-primary/80"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Configure sua API Key para começar
              </Button>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground mt-3">
            Pressione Enter para enviar ou Shift+Enter para nova linha
          </p>
        </form>
      </div>
    </div>
  );
}
