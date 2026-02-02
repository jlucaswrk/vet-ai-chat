import { NextRequest, NextResponse } from 'next/server';
import { getFileBuffer, deleteFile } from '@/lib/spaces';
import officeParser from 'officeparser';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { fileKey, filename } = await request.json();

    if (!fileKey || !filename) {
      return NextResponse.json(
        { error: 'fileKey e filename são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(`Processing file from Spaces: ${filename} (${fileKey})`);

    // Download file from Spaces
    const buffer = await getFileBuffer(fileKey);
    console.log(`Downloaded ${buffer.length} bytes from Spaces`);

    // Extract text using officeparser
    const content = await new Promise<string>((resolve, reject) => {
      officeParser.parseOffice(buffer, (err: Error | null, data: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(data || '');
        }
      });
    });

    if (!content || content.trim().length === 0) {
      // Clean up the file if extraction failed
      await deleteFile(fileKey).catch(console.error);

      return NextResponse.json(
        { error: 'Não foi possível extrair texto do arquivo. Verifique se o arquivo contém texto.' },
        { status: 400 }
      );
    }

    console.log(`Extracted ${content.length} characters from ${filename}`);

    // Optionally delete the file after processing (to save storage)
    // Uncomment if you don't need to keep files:
    // await deleteFile(fileKey).catch(console.error);

    return NextResponse.json({
      success: true,
      name: filename,
      content: content,
      fileKey: fileKey,
    });

  } catch (error) {
    console.error('Error processing file from Spaces:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar arquivo' },
      { status: 500 }
    );
  }
}
