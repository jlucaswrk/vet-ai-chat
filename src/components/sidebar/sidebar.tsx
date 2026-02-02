"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Upload,
  Trash2,
  Key,
  Moon,
  Sun,
  Menu,
  CheckCircle2,
  XCircle,
  Stethoscope,
  BookOpen,
  Loader2,
  Github,
  Sparkles,
  Shield,
  ExternalLink,
  Heart,
} from "lucide-react";
import { useTheme } from "next-themes";
import { PDFDocument } from "@/lib/types";

interface SidebarProps {
  documents: PDFDocument[];
  onDocumentsChange: (docs: PDFDocument[]) => void;
  apiKey: string | null;
  onApiKeyChange: (key: string | null) => void;
  showApiKeyDialog: boolean;
  onShowApiKeyDialogChange: (show: boolean) => void;
}

export function Sidebar({
  documents,
  onDocumentsChange,
  apiKey,
  onApiKeyChange,
  showApiKeyDialog,
  onShowApiKeyDialogChange,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      try {
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao fazer upload");
        }

        setUploadProgress(100);

        const newDocument: PDFDocument = {
          id: crypto.randomUUID(),
          name: data.name,
          content: data.content,
          uploadedAt: new Date(),
        };

        onDocumentsChange([...documents, newDocument]);

        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Erro desconhecido"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [documents, onDocumentsChange]
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
    disabled: isUploading,
  });

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== id));
  };

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      onApiKeyChange(tempApiKey.trim());
      localStorage.setItem("vet-ai-api-key", tempApiKey.trim());
    }
    onShowApiKeyDialogChange(false);
    setTempApiKey("");
  };

  const handleRemoveApiKey = () => {
    onApiKeyChange(null);
    localStorage.removeItem("vet-ai-api-key");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-card to-background">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-card" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">
              <span className="gradient-text">VetAI</span>
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Assistente Inteligente
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-4 py-6">
        {/* API Key Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm font-semibold">API Key</span>
          </div>

          <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-muted/50 to-muted/30">
            <CardContent className="p-4">
              {apiKey ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Conectada</p>
                      <p className="text-xs text-muted-foreground">OpenAI GPT-4</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveApiKey}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Não configurada</p>
                      <p className="text-xs text-muted-foreground">Necessário para usar</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onShowApiKeyDialogChange(true)}
                    className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-md shadow-primary/20"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Configurar API Key
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-semibold">Material de Estudo</span>
          </div>

          <div
            {...getRootProps()}
            className={`
              relative overflow-hidden rounded-xl border-2 border-dashed p-6 text-center cursor-pointer
              transition-all duration-300 group
              ${
                isDragActive
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }
              ${isUploading ? "pointer-events-none" : ""}
            `}
          >
            <input {...getInputProps()} />

            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            {isUploading ? (
              <div className="relative space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-medium">Processando...</p>
                  <p className="text-xs text-muted-foreground mt-1">Extraindo conteúdo</p>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            ) : (
              <div className="relative space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive ? "Solte o arquivo aqui" : "Upload de arquivo"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, PowerPoint ou Word
                  </p>
                </div>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                {uploadError}
              </p>
            </div>
          )}
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Documentos</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {documents.length}
              </span>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-card to-muted/30">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.content.length / 1000).toFixed(1)}k caracteres
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-xl"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <a
              href="https://github.com/jlucaswrk/vet-ai-chat"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                <Github className="w-4 h-4" />
              </Button>
            </a>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Feito com <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 border-r h-screen flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 h-10 w-10 rounded-xl shadow-lg bg-card/80 backdrop-blur-sm"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={onShowApiKeyDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-2">
              <Key className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-xl">Configurar API Key</DialogTitle>
            <DialogDescription>
              Insira sua chave da OpenAI para habilitar o assistente veterinário.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium">
                Chave de API
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-proj-..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Armazenamento seguro</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sua chave é salva apenas no seu navegador (localStorage) e nunca é enviada para nossos servidores.
                </p>
              </div>
            </div>

            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Obter chave em platform.openai.com
            </a>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => onShowApiKeyDialogChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveApiKey}
              disabled={!tempApiKey.trim()}
              className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
