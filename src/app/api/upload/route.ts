import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Apenas arquivos PDF são aceitos' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamic require for pdf-parse (CommonJS module)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer);

    // Clean and format the extracted text
    let extractedText = pdfData.text || '';

    // Remove excessive whitespace and clean up the text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json(
        { error: 'Não foi possível extrair texto do PDF. O arquivo pode estar vazio ou protegido.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      content: extractedText,
      name: file.name,
      pages: pdfData.numpages || 0,
    });
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o arquivo PDF' },
      { status: 500 }
    );
  }
}
