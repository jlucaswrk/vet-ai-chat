"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { PDFDocument } from "@/lib/types";

export default function Home() {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem("vet-ai-api-key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        documents={documents}
        onDocumentsChange={setDocuments}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        showApiKeyDialog={showApiKeyDialog}
        onShowApiKeyDialogChange={setShowApiKeyDialog}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <ChatInterface
          apiKey={apiKey}
          documents={documents}
          onNeedApiKey={() => setShowApiKeyDialog(true)}
        />
      </main>
    </div>
  );
}
