import { NextRequest, NextResponse } from 'next/server';
import officeParser from 'officeparser';

export const runtime = 'nodejs';

// Increase body size limit to 10MB
export const maxDuration = 60; // 60 seconds timeout

const ALLOWED_EXTENSIONS = ['.pdf', '.pptx', '.ppt', '.docx', '.doc'];

function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

function isAllowedFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ALLOWED_EXTENSIONS.includes(ext);
}

function getFileType(filename: string): string {
  const ext = getFileExtension(filename);
  if (ext === '.pdf') return 'PDF';
  if (ext === '.pptx' || ext === '.ppt') return 'PowerPoint';
  if (ext === '.docx' || ext === '.doc') return 'Word';
  return 'Documento';
}

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

    if (!isAllowedFile(file.name)) {
      return NextResponse.json(
        { error: `Formato não suportado. Use: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileType = getFileType(file.name);

    let extractedText = '';

    try {
      // Use officeparser for all document types (PDF, PPTX, DOCX, etc.)
      const result = await officeParser.parseOffice(buffer);

      // Extract text from AST result
      if (typeof result === 'string') {
        extractedText = result;
      } else if (result && typeof result === 'object') {
        // Handle AST format - extract text content
        extractedText = JSON.stringify(result);
        // Try to extract just text if it's an object with text property
        if ('text' in result) {
          extractedText = String(result.text);
        } else if ('body' in result) {
          extractedText = String(result.body);
        }
      }
    } catch (parseError) {
      console.error('Erro no parser:', parseError);
      return NextResponse.json(
        { error: `Erro ao processar ${fileType}. Verifique se o arquivo não está corrompido.` },
        { status: 400 }
      );
    }

    // Clean and format the extracted text
    if (extractedText) {
      extractedText = extractedText
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim();
    }

    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json(
        { error: `Não foi possível extrair texto do ${fileType}. O arquivo pode estar vazio, ser uma imagem ou estar protegido.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      content: extractedText,
      name: file.name,
      type: fileType,
      size: buffer.length,
    });
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar o arquivo. Tente novamente.' },
      { status: 500 }
    );
  }
}
