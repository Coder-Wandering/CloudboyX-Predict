import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface GeneratePdfOptions {
  title?: string;
  subtitle?: string;
}

export function generateTrainingPdf(docType: 'training' | 'operator' | 'cheatsheet' | 'all'): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    bufferPages: true,
  });

  const docsDir = path.join(process.cwd(), 'docs');

  // Colors
  const primaryColor = '#312e81'; // indigo-900
  const accentColor = '#4f46e5'; // indigo-600
  const darkTextColor = '#1c1917'; // stone-900
  const bodyTextColor = '#44403c'; // stone-700
  const codeBgColor = '#f5f5f4'; // stone-100
  const dividerColor = '#e7e5e4'; // stone-200

  const drawHeader = (titleText: string, subText: string) => {
    // Top banner
    doc.rect(50, 50, 512, 60).fill('#e0e7ff');
    doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text(titleText, 65, 62, { width: 480 });
    doc.fillColor(accentColor).fontSize(10).font('Helvetica').text(subText, 65, 84, { width: 480 });
    doc.moveDown(3);
  };

  const parseAndRenderMarkdown = (rawContent: string) => {
    const lines = rawContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimEnd();

      // Check remaining space on page to prevent orphaned headers
      if (doc.y > 680) {
        doc.addPage();
      }

      if (line.startsWith('# ')) {
        // Document Title H1
        doc.moveDown(0.5);
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text(line.replace(/^#\s+/, ''));
        doc.strokeColor(accentColor).lineWidth(1.5).moveTo(doc.x, doc.y + 4).lineTo(562, doc.y + 4).stroke();
        doc.moveDown(0.8);
      } else if (line.startsWith('## ')) {
        // Section H2
        doc.moveDown(0.8);
        doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text(line.replace(/^##\s+/, ''));
        doc.strokeColor(dividerColor).lineWidth(0.8).moveTo(doc.x, doc.y + 2).lineTo(562, doc.y + 2).stroke();
        doc.moveDown(0.5);
      } else if (line.startsWith('### ')) {
        // Sub-section H3
        doc.moveDown(0.5);
        doc.fillColor(accentColor).fontSize(11).font('Helvetica-Bold').text(line.replace(/^###\s+/, ''));
        doc.moveDown(0.3);
      } else if (line.startsWith('```')) {
        // Code Block
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        const codeText = codeLines.join('\n');
        
        doc.moveDown(0.3);
        const codeStartY = doc.y;
        const estimatedHeight = Math.min(codeLines.length * 11 + 14, 250);
        
        if (doc.y + estimatedHeight > 700) {
          doc.addPage();
        }
        
        doc.rect(50, doc.y, 512, estimatedHeight).fill(codeBgColor);
        doc.fillColor('#0f172a').fontSize(8.5).font('Courier').text(codeText, 58, codeStartY + 7, {
          width: 496,
          lineGap: 1.5,
        });
        doc.font('Helvetica'); // Reset font
        doc.y = codeStartY + estimatedHeight + 8;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // Bullet points
        const text = line.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1');
        doc.fillColor(bodyTextColor).fontSize(9.5).font('Helvetica');
        doc.text('• ' + text, 65, doc.y, { width: 495, lineGap: 2 });
      } else if (line.startsWith('> ')) {
        // Callout
        const calloutText = line.replace(/^>\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1');
        doc.moveDown(0.2);
        const boxY = doc.y;
        doc.rect(50, boxY, 512, 26).fill('#fef3c7'); // amber-100
        doc.strokeColor('#f59e0b').lineWidth(3).moveTo(50, boxY).lineTo(50, boxY + 26).stroke();
        doc.fillColor('#92400e').fontSize(9).font('Helvetica-Bold').text(calloutText, 62, boxY + 7, { width: 485 });
        doc.y = boxY + 32;
      } else if (line.startsWith('---')) {
        // Divider
        doc.moveDown(0.5);
        doc.strokeColor(dividerColor).lineWidth(0.5).moveTo(50, doc.y).lineTo(562, doc.y).stroke();
        doc.moveDown(0.5);
      } else if (line.trim().length > 0) {
        // Normal paragraph
        const cleanText = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/`([^`]+)`/g, '$1');
        doc.fillColor(bodyTextColor).fontSize(9.5).font('Helvetica').text(cleanText, 50, doc.y, {
          width: 512,
          lineGap: 2.5,
        });
        doc.moveDown(0.4);
      } else {
        doc.moveDown(0.2);
      }
    }
  };

  // Determine which files to render
  const filesToInclude: { name: string; title: string; file: string }[] = [];

  if (docType === 'training' || docType === 'all') {
    filesToInclude.push({
      name: 'Training Guide',
      title: 'User Training Guide & Curriculum',
      file: 'USER_TRAINING_GUIDE.md',
    });
  }
  if (docType === 'operator' || docType === 'all') {
    filesToInclude.push({
      name: 'Operator Manual',
      title: 'Operator Instruction & Engineering Manual',
      file: 'OPERATOR_INSTRUCTION_MANUAL.md',
    });
  }
  if (docType === 'cheatsheet' || docType === 'all') {
    filesToInclude.push({
      name: 'Field Cheat Sheet',
      title: 'Operator Quick Start Field Cheat Sheet',
      file: 'QUICK_START_CHEAT_SHEET.md',
    });
  }

  // Cover Page / Header
  drawHeader(
    'CloudboyX Predict • Official Instruction & Training Documentation',
    'Curriculum for Prediction Market Probability Modeling, Kelly Risk Management & Kalshi Operations'
  );

  doc.fillColor(bodyTextColor).fontSize(10).font('Helvetica').text(
    'This PDF document contains the official operating instructions, training modules, econometric probability frameworks, and Python ingestion documentation for the CloudboyX Predict system.',
    50,
    doc.y,
    { width: 512, lineGap: 3 }
  );

  doc.moveDown(1);

  // Render each selected markdown file
  filesToInclude.forEach((item, index) => {
    if (index > 0) {
      doc.addPage();
    }
    const filePath = path.join(docsDir, item.file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      parseAndRenderMarkdown(content);
    }
  });

  // Add Page Numbers at the end
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fillColor('#a8a29e').fontSize(8).font('Helvetica').text(
      `CloudboyX Predict • Official Training Documentation • Page ${i + 1} of ${pages.count}`,
      50,
      750,
      { width: 512, align: 'center' }
    );
  }

  return doc;
}
