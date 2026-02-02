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
    let extractedText = '';

    try {
      const result = await officeParser.parseOffice(buffer);

      // Extract text from AST result
      if (typeof result === 'string') {
        extractedText = result;
      } else if (result && typeof result === 'object') {
        // Handle AST format
        if ('text' in result) {
          extractedText = String(result.text);
        } else if ('body' in result) {
          extractedText = String(result.body);
        } else {
          extractedText = JSON.stringify(result);
        }
      }

      // Clean the text
      if (extractedText) {
        extractedText = extractedText
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .replace(/[ \t]+/g, ' ')
          .trim();
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      await deleteFile(fileKey).catch(console.error);
      return NextResponse.json(
        { error: 'Erro ao processar arquivo. Verifique se não está corrompido.' },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length < 10) {
      // Clean up the file if extraction failed
      await deleteFile(fileKey).catch(console.error);

      return NextResponse.json(
        { error: 'Não foi possível extrair texto do arquivo. Verifique se o arquivo contém texto.' },
        { status: 400 }
      );
    }

    console.log(`Extracted ${extractedText.length} characters from ${filename}`);

    // Optionally delete the file after processing (to save storage)
    // Uncomment if you don't need to keep files:
    // await deleteFile(fileKey).catch(console.error);

    return NextResponse.json({
      success: true,
      name: filename,
      content: extractedText,
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
