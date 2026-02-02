"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  Paperclip,
  X,
  Upload,
  Trash2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Message, PDFDocument } from "@/lib/types";

interface ChatInterfaceProps {
  apiKey: string | null;
  documents: PDFDocument[];
  onNeedApiKey: () => void;
  onDocumentsChange: (docs: PDFDocument[]) => void;
}

export function ChatInterface({
  apiKey,
  documents,
  onNeedApiKey,
  onDocumentsChange,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getContext = () => {
    if (documents.length === 0) return null;
    return documents.map((doc) => `[${doc.name}]\n${doc.content}`).join("\n\n---\n\n");
  };

  const ALLOWED_EXTENSIONS = ['.pdf', '.pptx', '.ppt', '.docx', '.doc'];
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB - DigitalOcean Spaces

  const isAllowedFile = (filename: string): boolean => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return ALLOWED_EXTENSIONS.includes(ext);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getMimeType = (filename: string): string => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!isAllowedFile(file.name)) {
        setUploadError('Use: PDF, PowerPoint ou Word');
        return;
      }

      // Check file size limit (500MB via Spaces)
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`Arquivo muito grande (${formatFileSize(file.size)}). Máximo: 500MB`);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      try {
        // Step 1: Get presigned upload URL from Spaces
        setUploadProgress(10);
        const urlResponse = await fetch('/api/spaces/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: getMimeType(file.name),
          }),
        });

        if (!urlResponse.ok) {
          const urlData = await urlResponse.json();
          throw new Error(urlData.error || 'Erro ao obter URL de upload');
        }

        const { uploadUrl, fileKey } = await urlResponse.json();
        setUploadProgress(20);

        // Step 2: Upload directly to DigitalOcean Spaces
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': getMimeType(file.name),
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Erro ao fazer upload para o storage');
        }

        setUploadProgress(60);

        // Step 3: Process the file (extract text)
        const processResponse = await fetch('/api/spaces/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileKey,
            filename: file.name,
          }),
        });

        const processData = await processResponse.json();

        if (!processResponse.ok) {
          throw new Error(processData.error || 'Erro ao processar arquivo');
        }

        setUploadProgress(100);

        const newDocument: PDFDocument = {
          id: crypto.randomUUID(),
          name: processData.name,
          content: processData.content,
          uploadedAt: new Date(),
        };

        onDocumentsChange([...documents, newDocument]);

        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 500);
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Erro desconhecido"
        );
        setIsUploading(false);
      }
    },
    [documents, onDocumentsChange]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      handleFileUpload(acceptedFiles[0]);
    },
    [handleFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  });

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== id));
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
    { icon: FileText, text: "Principais sintomas discutidos?" },
    { icon: Heart, text: "Tratamentos mencionados" },
    { icon: BookOpen, text: "Resuma o conteúdo" },
    { icon: PawPrint, text: "Doenças abordadas" },
  ];

  const features = [
    { icon: Zap, title: "Respostas Rápidas", description: "Análise instantânea" },
    { icon: BookOpen, title: "Base em PDFs", description: "Seu material" },
    { icon: MessageSquare, title: "Chat Natural", description: "Tire dúvidas" },
  ];

  return (
    <div {...getRootProps()} className="flex flex-col h-full bg-mesh relative">
      <input {...getInputProps()} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.pptx,.ppt,.docx,.doc"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drag overlay */}
      {isDragActive && (
        <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card p-8 rounded-2xl shadow-2xl border-2 border-dashed border-primary">
            <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-lg font-semibold text-center">Solte o arquivo aqui</p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              PDF, PowerPoint ou Word
            </p>
          </div>
        </div>
      )}

      {/* Header - Documents indicator (mobile) */}
      <div className="flex items-center justify-between p-3 border-b bg-card/50 backdrop-blur-sm md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">VetAI</span>
        </div>

        <Sheet open={showDocuments} onOpenChange={setShowDocuments}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <FileText className="w-4 h-4" />
              <span className="text-xs">{documents.length} arquivo{documents.length !== 1 ? 's' : ''}</span>
              <ChevronRight className="w-3 h-3" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
            <SheetHeader className="pb-4">
              <SheetTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Material de Estudo
              </SheetTitle>
            </SheetHeader>

            {/* Upload area in sheet */}
            <div
              onClick={handleAttachClick}
              className="border-2 border-dashed rounded-xl p-4 mb-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              {isUploading ? (
                <div className="space-y-2">
                  <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
                  <p className="text-sm">Processando...</p>
                  <Progress value={uploadProgress} className="h-1" />
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Adicionar arquivo</p>
                  <p className="text-xs text-muted-foreground">PDF, PowerPoint ou Word</p>
                </>
              )}
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {uploadError}
                </p>
              </div>
            )}

            {/* Documents list */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Nenhum documento</p>
                  <p className="text-sm text-muted-foreground/70">
                    Adicione PDFs para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.content.length / 1000).toFixed(0)}k caracteres
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-3 md:p-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 md:py-12 text-center px-2">
              {/* Hero Icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-primary/30">
                  <Bot className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                <span className="gradient-text">Olá! Sou o VetAI</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-lg mb-6 max-w-md">
                Seu assistente veterinário inteligente
              </p>

              {/* Upload CTA - More prominent */}
              {documents.length === 0 ? (
                <div
                  onClick={handleAttachClick}
                  className="w-full max-w-sm p-6 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all mb-6"
                >
                  {isUploading ? (
                    <div className="space-y-3">
                      <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
                      <p className="text-sm font-medium">Processando arquivo...</p>
                      <Progress value={uploadProgress} className="h-1.5" />
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center mb-3">
                        <Upload className="w-7 h-7 text-primary" />
                      </div>
                      <p className="font-semibold mb-1">Envie seus slides ou documentos</p>
                      <p className="text-sm text-muted-foreground">
                        PDF, PowerPoint ou Word
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <Card className="p-4 mb-6 max-w-sm w-full bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">
                        {documents.length} arquivo{documents.length > 1 ? 's' : ''} carregado{documents.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                        Pronto para responder!
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {uploadError && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 max-w-sm w-full">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {uploadError}
                  </p>
                </div>
              )}

              {/* Features Grid */}
              {documents.length === 0 && (
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 w-full max-w-sm md:max-w-lg">
                  {features.map((feature, i) => (
                    <div key={i} className="p-3 md:p-4 text-center rounded-xl bg-card/80 border">
                      <div className="w-8 h-8 md:w-10 md:h-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <p className="font-medium text-xs md:text-sm">{feature.title}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 hidden md:block">{feature.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Questions */}
              {documents.length > 0 && (
                <div className="w-full max-w-md space-y-3">
                  <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Sugestões
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestedQuestions.map((question, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="justify-start text-left h-auto py-2.5 px-3 hover:bg-primary/5 hover:border-primary/30 transition-all text-xs"
                        onClick={() => {
                          setInput(question.text);
                          textareaRef.current?.focus();
                        }}
                      >
                        <question.icon className="w-3.5 h-3.5 mr-2 text-primary shrink-0" />
                        <span className="truncate">{question.text}</span>
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
                className={`flex gap-2 md:gap-4 message-animate ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar
                  className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-lg md:rounded-xl ${
                    message.role === "assistant"
                      ? "bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20"
                      : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-center w-full h-full">
                    {message.role === "assistant" ? (
                      <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    ) : (
                      <User className="w-4 h-4 md:w-5 md:h-5 text-slate-600 dark:text-slate-300" />
                    )}
                  </div>
                </Avatar>
                <Card
                  className={`flex-1 p-3 md:p-4 shadow-sm max-w-[85%] md:max-w-none ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-primary to-emerald-600 text-white border-0"
                      : "bg-card"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
                  <span className={`text-[10px] md:text-xs mt-2 block ${
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
            <div className="flex gap-2 md:gap-4 message-animate">
              <Avatar className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20 shrink-0">
                <div className="flex items-center justify-center w-full h-full">
                  <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
              </Avatar>
              <Card className="p-3 md:p-4 bg-card">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
                  </div>
                  <span className="text-xs md:text-sm text-muted-foreground">
                    Analisando...
                  </span>
                </div>
              </Card>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 message-animate">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t glass p-3 md:p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* Uploading indicator */}
          {isUploading && (
            <div className="mb-2 p-2 rounded-lg bg-primary/10 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs text-primary flex-1">Processando arquivo...</span>
              <Progress value={uploadProgress} className="w-20 h-1" />
            </div>
          )}

          <div className="flex gap-2 items-end">
            {/* Attach button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 md:h-12 md:w-12 rounded-xl shrink-0"
              onClick={handleAttachClick}
              disabled={isUploading}
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            {/* Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  documents.length > 0
                    ? "Pergunte sobre o material..."
                    : "Envie um arquivo para começar..."
                }
                className="min-h-[44px] md:min-h-[48px] max-h-[120px] resize-none rounded-xl bg-background shadow-sm border-2 focus:border-primary transition-colors text-sm"
                disabled={isLoading}
              />
            </div>

            {/* Send button */}
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 md:h-12 md:w-12 rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/25 shrink-0"
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
            <div className="mt-2 text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onNeedApiKey}
                className="text-primary hover:text-primary/80 text-xs h-8"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Configure sua API Key
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
