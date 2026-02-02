import { NextRequest, NextResponse } from 'next/server';
import { getUploadUrl } from '@/lib/spaces';

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'filename e contentType são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate file extension
    const allowedExtensions = ['.pdf', '.pptx', '.ppt', '.docx', '.doc'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use PDF, PowerPoint ou Word.' },
        { status: 400 }
      );
    }

    const { uploadUrl, fileKey } = await getUploadUrl(filename, contentType);

    return NextResponse.json({ uploadUrl, fileKey });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar URL de upload' },
      { status: 500 }
    );
  }
}
