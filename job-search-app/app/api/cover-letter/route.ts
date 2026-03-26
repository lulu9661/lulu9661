import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

export async function POST(request: NextRequest) {
  try {
    const { content, jobTitle, organisation, folderPath, authorName } = await request.json();

    if (!content || !folderPath) {
      return NextResponse.json({ error: 'Missing content or folder path' }, { status: 400 });
    }

    // Resolve ~ to home directory
    const resolvedPath = folderPath.replace(/^~/, homedir());

    // Ensure directory exists
    await mkdir(resolvedPath, { recursive: true });

    // Clean filename
    const safeName = `Cover Letter - ${organisation} - ${jobTitle}`
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
    const fileName = `${safeName}.docx`;
    const filePath = join(resolvedPath, fileName);

    // Split content into paragraphs
    const lines = content.split('\n');
    const paragraphs = lines.map((line: string) => {
      // Skip pattern notes (internal)
      if (line.startsWith('[Note:')) return null;

      return new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: line,
            font: 'Calibri',
            size: 22, // 11pt
          }),
        ],
      });
    }).filter(Boolean) as Paragraph[];

    // Add header with author name if provided
    if (authorName) {
      paragraphs.unshift(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: authorName,
              font: 'Calibri',
              size: 22,
              bold: true,
            }),
          ],
        })
      );
    }

    const doc = new Document({
      sections: [{
        children: paragraphs,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    await writeFile(filePath, buffer);

    return NextResponse.json({ fileName, filePath });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to save: ${message}` }, { status: 500 });
  }
}
