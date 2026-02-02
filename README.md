# VetAI - Assistente Veterinário Inteligente

Uma aplicação de chat com IA que responde perguntas veterinárias baseadas em conteúdo de documentos (PDF, PowerPoint, Word).

## Funcionalidades

- **Upload de Documentos**: Carregue PDFs, PowerPoint e Word
- **Chat com IA**: Faça perguntas sobre o conteúdo dos slides
- **Respostas Contextuais**: A IA responde baseada no material carregado
- **Interface Responsiva**: Funciona em desktop e mobile (mobile-first)
- **Modo Escuro/Claro**: Tema adaptável às suas preferências
- **Arquivos Grandes**: Suporte a arquivos até 50MB via DigitalOcean

## Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes de UI
- **OpenAI GPT-4o-mini** - Modelo de IA
- **officeparser** - Extração de texto de PDF, PPTX, DOCX
- **DigitalOcean App Platform** - Processamento de arquivos grandes

## Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/vet-ai-chat.git

# Entre no diretório
cd vet-ai-chat

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## Configuração

1. Acesse a aplicação em `http://localhost:3000`
2. Clique em "Configurar" na seção de API Key
3. Insira sua chave de API da OpenAI
4. Faça upload de um PDF com conteúdo veterinário
5. Comece a fazer perguntas!

## Obter API Key

Você pode obter sua API key da OpenAI em:
[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

## Deploy na Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jlucaswrk/vet-ai-chat)

## Deploy do File Processor (DigitalOcean) - Para arquivos > 4MB

1. Acesse https://cloud.digitalocean.com/apps/new
2. Conecte o repositório `jlucaswrk/vet-file-processor`
3. Mantenha as configurações padrão (Node.js será detectado)
4. Após deploy, copie a URL gerada (ex: `https://vet-file-processor-xxxxx.ondigitalocean.app`)
5. No Vercel, adicione a variável de ambiente:
   ```
   NEXT_PUBLIC_FILE_PROCESSOR_URL=https://sua-url.ondigitalocean.app
   ```

## Licença

MIT
