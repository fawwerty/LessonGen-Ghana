const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  Header, Footer, SimpleField
} = require('docx');

// STRICTLY BLACK AND WHITE FOR PRINTING
const BLACK = '000000';
const WHITE = 'FFFFFF';
const LIGHT_GRAY = 'EEEEEE';
const DARK_GRAY = '333333';
const BORDER_COLOR = '000000';

const border = { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function cell(text, opts = {}) {
  const { fill = WHITE, bold = false, size = 20, color = BLACK, align = AlignmentType.LEFT,
    vAlign = VerticalAlign.TOP, width = null, cellBorders = borders, italic = false } = opts;
  const cellOpts = {
    borders: cellBorders, shading: { fill, type: ShadingType.CLEAR }, verticalAlign: vAlign,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: align,
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: String(text || ''), bold, italic, size, color, font: 'Arial' })]
    })]
  };
  if (width) cellOpts.width = { size: width, type: WidthType.DXA };
  return new TableCell(cellOpts);
}

function multiCell(paragraphs, opts = {}) {
  const { fill = WHITE, width = null, vAlign = VerticalAlign.TOP, cellBorders = borders } = opts;
  const children = paragraphs.map(p => new Paragraph({
    alignment: p.align || AlignmentType.LEFT,
    spacing: { before: 40, after: 40 },
    children: (p.runs || [{ text: p.text || '', bold: p.bold }]).map(r =>
      new TextRun({ text: String(r.text || ''), bold: r.bold, size: r.size || 20, font: 'Arial', color: r.color || BLACK, italic: r.italic })
    )
  }));
  const cellOpts = { borders: cellBorders, shading: { fill, type: ShadingType.CLEAR }, verticalAlign: vAlign, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children };
  if (width) cellOpts.width = { size: width, type: WidthType.DXA };
  return new TableCell(cellOpts);
}

function spacer(ht = 80) { return new Paragraph({ spacing: { before: ht, after: ht }, children: [new TextRun('')] }); }

// ── PRIMARY/KG FORMAT ────────────────────
function generatePrimaryDoc(lessonData) {
  const { classCode, className, subject, term, week, lesson } = lessonData;
  const termStr = `TERM ${['ONE','TWO','THREE'][term-1] || term}`;
  const weekStr = `WEEK ${week}`;

  const W1 = 2200, W2 = 7160, WTotal = 9360;
  function metaRow(label, value, valueBold = false) {
    return new TableRow({ children: [
      cell(label, { fill: LIGHT_GRAY, bold: true, size: 20, width: W1, cellBorders: borders }),
      cell(value, { bold: valueBold, size: 20, width: W2 })
    ]});
  }

  const metaTable = new Table({
    width: { size: WTotal, type: WidthType.DXA },
    columnWidths: [W1, W2],
    rows: [
      metaRow('Week Ending', lesson.weekEnding || ''),
      metaRow('Class', className || classCode),
      metaRow('Subject', subject, true),
      metaRow('Reference', lesson.reference || `NaCCA ${subject} Curriculum for ${classCode}`),
      new TableRow({ children: [
        cell('Strand', { fill: LIGHT_GRAY, bold: true, size: 20, width: W1 }),
        cell('Sub-strand', { fill: LIGHT_GRAY, bold: true, size: 20, width: W2 })
      ]}),
      new TableRow({ children: [
        cell(lesson.strand || '', { size: 20, width: W1 }),
        cell(lesson.subStrand || '', { size: 20, width: W2 })
      ]}),
      metaRow('Learning Indicator(s)', lesson.indicator || ''),
      metaRow('Performance Indicator', lesson.performanceIndicator || ''),
      metaRow('Teaching/Learning Resources', lesson.teachingResources || ''),
      new TableRow({ children: [
        multiCell([{ runs: [{ text: 'Core Competencies: ', bold: true }, { text: lesson.coreCompetencies || '' }] }],
          { fill: LIGHT_GRAY, width: WTotal }),
      ].slice(0, 1).concat([cell('', { width: 1, cellBorders: noBorders })]) })
    ]
  });

  const WDay = 1000, WP1 = 2440, WP2 = 3800, WP3 = 2120;
  const phasesTable = new Table({
    width: { size: WTotal, type: WidthType.DXA },
    columnWidths: [WDay, WP1, WP2, WP3],
    rows: [
      new TableRow({
        children: [
          cell('DAYS', { fill: DARK_GRAY, bold: true, size: 20, color: WHITE, align: AlignmentType.CENTER, width: WDay, vAlign: VerticalAlign.CENTER }),
          cell('PHASE 1: STARTER\n10 MINS', { fill: DARK_GRAY, bold: true, size: 18, color: WHITE, align: AlignmentType.CENTER, width: WP1 }),
          cell('PHASE 2: MAIN\n40 MINS', { fill: DARK_GRAY, bold: true, size: 18, color: WHITE, align: AlignmentType.CENTER, width: WP2 }),
          cell('PHASE 3:\nREFLECTION\n10 MINS', { fill: DARK_GRAY, bold: true, size: 18, color: WHITE, align: AlignmentType.CENTER, width: WP3 })
        ]
      }),
      ...(lesson.days || []).map((d, i) => new TableRow({
        children: [
          cell(d.day, { fill: LIGHT_GRAY, bold: true, size: 20, align: AlignmentType.CENTER, width: WDay, vAlign: VerticalAlign.CENTER }),
          cell(d.phase1 || '', { fill: WHITE, size: 19, width: WP1 }),
          cell(d.phase2 || '', { fill: WHITE, size: 19, width: WP2 }),
          cell(d.phase3 || '', { fill: WHITE, size: 19, width: WP3 })
        ]
      }))
    ]
  });

  return { metaTable, phasesTable, termStr, weekStr };
}

// ── JHS FORMAT ─────────────────────────────────────────────────────────────
function generateJHSDoc(lessonData) {
  const { classCode, subject, term, week, lesson } = lessonData;
  const termStr = `TERM ${['ONE','TWO','THREE'][term-1] || term}`;
  const weekStr = `WEEK ${week}`;

  const W1 = 3120, W2 = 3120, W3 = 3120, WTotal = 9360;
  const headerTable = new Table({
    width: { size: WTotal, type: WidthType.DXA },
    columnWidths: [W1, W2, W3],
    rows: [
      new TableRow({ children: [
        cell(`Week Ending: ${lesson.weekEnding || ''}`, { bold: true, size: 20, width: W1 }),
        cell(`Day: ${lesson.day || 'Thursday'}`, { bold: true, size: 20, width: W2 }),
        cell(`Subject: ${subject}`, { bold: true, size: 20, width: W3 })
      ]}),
      new TableRow({ children: [
        cell(`Duration: ${lesson.duration || '60mins'}`, { bold: true, size: 20, width: W1 }),
        cell(`Strand: ${lesson.strand || ''}`, { bold: true, size: 20, width: W2 }),
        cell('', { width: W3 })
      ]}),
      new TableRow({ children: [
        cell(`Class: ${classCode}`, { bold: true, size: 20, width: W1 }),
        cell(`Class Size: ${lesson.classSize || '35'}`, { bold: true, size: 20, width: W2 }),
        cell(`Sub Strand: ${lesson.subStrand || ''}`, { bold: true, size: 20, width: W3 })
      ]}),
      new TableRow({ children: [
        multiCell([{ runs: [{ text: 'Content Standard:   ', bold: true }, { text: lesson.contentStandard || '' }] }], { width: W1 }),
        multiCell([{ runs: [{ text: 'Indicator:   ', bold: true }, { text: lesson.indicator || '' }] }], { width: W2 }),
        multiCell([{ runs: [{ text: 'Lesson:   ', bold: true }, { text: lesson.lessonNumber || '1 of 1' }] }], { width: W3 })
      ]}),
      new TableRow({ children: [
        multiCell([{ runs: [{ text: 'Performance Indicator:  ', bold: true }, { text: lesson.performanceIndicator || '' }] }], { width: W1 + W2, colspan: 2 }),
        multiCell([{ runs: [{ text: 'Core Competencies: ', bold: true }, { text: lesson.coreCompetencies || '' }] }], { width: W3 })
      ].slice(0, 2) }),
      new TableRow({ children: [
        multiCell([{ runs: [{ text: 'Reference : ', bold: true }, { text: lesson.reference || '' }] }], { width: WTotal }),
      ].slice(0,1).concat([cell('',{width:1,cellBorders:noBorders})]) }),
      new TableRow({ children: [
        multiCell([{ runs: [{ text: 'Keywords: ', bold: true }, { text: lesson.keywords || '' }] }], { width: WTotal })
      ].slice(0,1).concat([cell('',{width:1,cellBorders:noBorders})]) })
    ]
  });

  const WPh = 1800, WAct = 5760, WRes = 1800;
  const phasesTable = new Table({
    width: { size: WTotal, type: WidthType.DXA },
    columnWidths: [WPh, WAct, WRes],
    rows: [
      new TableRow({ children: [
        cell('Phase/Duration', { fill: DARK_GRAY, bold: true, size: 20, color: WHITE, width: WPh }),
        cell('Learners Activities', { fill: DARK_GRAY, bold: true, size: 20, color: WHITE, width: WAct }),
        cell('Resources', { fill: DARK_GRAY, bold: true, size: 20, color: WHITE, width: WRes })
      ]}),
      new TableRow({ children: [
        multiCell([{ runs: [{ text: 'PHASE 1: ', bold: true }, { text: 'STARTER', bold: true }] }], { fill: LIGHT_GRAY, width: WPh }),
        cell(lesson.phase1 || '', { size: 19, width: WAct }),
        cell('', { width: WRes })
      ]}),
      new TableRow({ children: [
        multiCell([{ runs: [{ text: 'PHASE 2: ', bold: true }, { text: 'NEW LEARNING', bold: true }] }], { fill: LIGHT_GRAY, width: WPh }),
        cell(lesson.phase2 || '', { size: 19, width: WAct }),
        cell(lesson.resources || 'Resources', { size: 18, width: WRes })
      ]}),
      new TableRow({ children: [
        multiCell([{ runs: [{ text: 'PHASE 3: ', bold: true }, { text: 'REFLECTION', bold: true }] }], { fill: LIGHT_GRAY, width: WPh }),
        cell(lesson.phase3 || '', { size: 19, width: WAct }),
        cell('', { width: WRes })
      ]})
    ]
  });

  return { headerTable, phasesTable, termStr, weekStr };
}

// ── ASSEMBLE FULL DOCUMENT BATCH ─────────────────────────────────────────────
async function buildDocx(lessonsArray) {
  // Always work with an array of lessons to support batch export
  const lessons = Array.isArray(lessonsArray) ? lessonsArray : [lessonsArray];
  if (lessons.length === 0) throw new Error("No lessons provided");

  const term = lessons[0].term;
  const week = lessons[0].week;
  const termStr = `TERM ${['ONE','TWO','THREE'][term-1] || term}`;
  const weekStr = `WEEK ${week}`;

  const header = new Header({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLACK, space: 4 } },
      spacing: { after: 80 },
      children: [new TextRun({ text: `${termStr} LESSON NOTES — ${weekStr}  |  NaCCA Standards-Based Curriculum`, bold: true, size: 22, font: 'Arial', color: BLACK })]
    })]
  });

  const footer = new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: BLACK, space: 4 } },
      children: [
        new TextRun({ text: 'LessonGen Ghana  |  Page ', size: 16, font: 'Arial', color: BLACK }),
        new SimpleField('PAGE', { size: 16, font: 'Arial', color: BLACK })
      ]
    })]
  });

  const sectionChildren = [];

  lessons.forEach((lessonData, index) => {
    const { classCode, className, subject, isJHS } = lessonData;

    // Header Title for the specific subject
    sectionChildren.push(
      new Paragraph({ 
        alignment: AlignmentType.CENTER, 
        spacing: { before: index === 0 ? 0 : 400 },
        children: [
          new TextRun({ text: `${termStr} WEEKLY LESSON NOTES — ${weekStr}`, bold: true, size: 26, color: BLACK, font: 'Arial' })
        ] 
      }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER, 
        spacing: { before: 20 },
        children: [
          new TextRun({ text: `${subject.toUpperCase()}  |  BASIC ${(className || classCode).toUpperCase()}`, bold: true, size: 22, color: BLACK, font: 'Arial' })
        ] 
      }),
      spacer(100)
    );

    if (isJHS) {
      const { headerTable, phasesTable } = generateJHSDoc(lessonData);
      sectionChildren.push(headerTable, spacer(80), phasesTable);
    } else {
      const { metaTable, phasesTable } = generatePrimaryDoc(lessonData);
      sectionChildren.push(metaTable, spacer(80), phasesTable);
    }

    // Signatures
    sectionChildren.push(
      spacer(160),
      new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [4680, 4680],
        rows: [
          new TableRow({ children: [cell('Class Teacher\'s Signature:', { fill: LIGHT_GRAY, bold: true, width: 4680 }), !!isJHS ? cell('Head Teacher\'s Signature:', { fill: LIGHT_GRAY, bold: true, width: 4680 }) : cell('Date:', { fill: LIGHT_GRAY, bold: true, width: 4680 })] }),
          new TableRow({ children: [cell('________________________________', { width: 4680 }), cell('________________________________', { width: 4680 })] }),
          ...(!isJHS ? [
            new TableRow({ children: [cell('Head Teacher\'s Signature:', { fill: LIGHT_GRAY, bold: true, width: 4680 }), cell('Date:', { fill: LIGHT_GRAY, bold: true, width: 4680 })] }),
            new TableRow({ children: [cell('________________________________', { width: 4680 }), cell('________________________________', { width: 4680 })] })
          ] : [
            new TableRow({ children: [cell('Date: ___________________________', { width: 4680 }), cell('Date: ___________________________', { width: 4680 })] })
          ])
        ]
      })
    );

    // Page break after every subject except the last
    if (index < lessons.length - 1) {
      sectionChildren.push(new Paragraph({ pageBreakBefore: true }));
    }
  });

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      headers: { default: header },
      footers: { default: footer },
      children: sectionChildren
    }]
  });

  return Packer.toBuffer(doc);
}

module.exports = { buildDocx };
