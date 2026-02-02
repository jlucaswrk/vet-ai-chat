# VetAI - Assistente Veterinário Inteligente

Uma aplicação de chat com IA que responde perguntas veterinárias baseadas em conteúdo de slides em PDF.

## Funcionalidades

- **Upload de PDF**: Carregue seus slides de aulas veterinárias
- **Chat com IA**: Faça perguntas sobre o conteúdo dos slides
- **Respostas Contextuais**: A IA responde baseada no material carregado
- **Interface Responsiva**: Funciona em desktop e mobile
- **Modo Escuro/Claro**: Tema adaptável às suas preferências

## Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes de UI
- **OpenAI GPT-4o-mini** - Modelo de IA
- **pdf-parse** - Extração de texto de PDFs

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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/vet-ai-chat)

## Licença

MIT
