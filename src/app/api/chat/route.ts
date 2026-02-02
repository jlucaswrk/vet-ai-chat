import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { messages, apiKey, context } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key não fornecida' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const systemMessage = `Você é um assistente veterinário especializado e educado.
Seu papel é ajudar estudantes e profissionais de veterinária a entender conceitos baseados no material de estudo fornecido.

INSTRUÇÕES IMPORTANTES:
1. Responda SEMPRE em português brasileiro
2. Base suas respostas no contexto do material de slides fornecido
3. Se a pergunta não estiver relacionada ao conteúdo dos slides, informe educadamente que você só pode responder sobre o material disponível
4. Seja didático e explique conceitos de forma clara
5. Use terminologia técnica veterinária quando apropriado, mas sempre explique termos complexos
6. Quando apropriado, mencione de qual parte do material a informação foi extraída
7. Se não tiver certeza sobre algo, admita e sugira que o usuário consulte um profissional

CONTEXTO DOS SLIDES DE VETERINÁRIA:
${context || 'Nenhum documento carregado ainda. Peça ao usuário para fazer upload de slides em PDF.'}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const assistantMessage = response.choices[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'Não foi possível gerar uma resposta' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (error: unknown) {
    console.error('Erro na API de chat:', error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'API key inválida. Verifique sua chave OpenAI.' },
          { status: 401 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
