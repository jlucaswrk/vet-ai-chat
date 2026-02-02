# VetAI - Assistente Veterinário Inteligente

Uma aplicação de chat com IA que responde perguntas veterinárias baseadas em conteúdo de documentos (PDF, PowerPoint, Word).

## Funcionalidades

- **Upload de Documentos**: Carregue PDFs, PowerPoint e Word
- **Chat com IA**: Faça perguntas sobre o conteúdo dos slides
- **Respostas Contextuais**: A IA responde baseada no material carregado
- **Interface Responsiva**: Funciona em desktop e mobile (mobile-first)
- **Modo Escuro/Claro**: Tema adaptável às suas preferências
- **Arquivos Grandes**: Suporte a arquivos de qualquer tamanho via DigitalOcean Spaces

## Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes de UI
- **OpenAI GPT-4o-mini** - Modelo de IA
- **officeparser** - Extração de texto de PDF, PPTX, DOCX
- **DigitalOcean Spaces** - Object Storage para arquivos grandes
- **AWS SDK S3** - Client para upload direto ao Spaces

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

## Configuração do DigitalOcean Spaces (para arquivos > 4MB)

Para suportar arquivos grandes, o app usa DigitalOcean Spaces (Object Storage):

### 1. Criar um Spaces Bucket
```bash
# Via doctl CLI
doctl spaces keys create vet-ai-files --grants "bucket=;permission=fullaccess"
s3cmd mb s3://vet-ai-files
```

### 2. Configurar CORS no Bucket
Crie um arquivo `cors.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>https://vet-ai-chat.vercel.app</AllowedOrigin>
    <AllowedOrigin>http://localhost:3000</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```
```bash
s3cmd setcors cors.xml s3://vet-ai-files
```

### 3. Adicionar variáveis de ambiente no Vercel
```
NEXT_PUBLIC_USE_SPACES=true
DO_SPACES_KEY=sua-access-key
DO_SPACES_SECRET=sua-secret-key
DO_SPACES_BUCKET=vet-ai-files
DO_SPACES_REGION=nyc3
```

## Arquitetura

```
┌─────────────┐     < 4MB      ┌──────────────┐
│   Browser   │ ──────────────>│ Vercel API   │
└─────────────┘                └──────────────┘
       │
       │ > 4MB
       v
┌─────────────┐  presigned URL  ┌──────────────┐
│   Browser   │ <──────────────│ Vercel API   │
└─────────────┘                └──────────────┘
       │
       │ PUT file
       v
┌─────────────────────────────────────────────┐
│         DigitalOcean Spaces (S3)            │
│         vet-ai-files.nyc3.digitaloceanspaces.com │
└─────────────────────────────────────────────┘
       │
       │ process
       v
┌─────────────┐  extract text   ┌──────────────┐
│   Browser   │ <──────────────│ Vercel API   │
└─────────────┘                └──────────────┘
```

## Licença

MIT
