import XLSX from 'xlsx-js-style';

export const EXCEL_COLORS = {
  NAVY_HEADER: '0F172A',      // Slate 900
  EMERALD_HEADER: '064E3B',   // Emerald 900
  BLUE_HEADER: '1E3A8A',      // Blue 900
  TEXT_WHITE: 'FFFFFF',
  TEXT_DARK: '0F172A',
  TEXT_MUTED: '475569',
  BORDER_LIGHT: 'E2E8F0',     // Slate 200
  BORDER_DARK: '0F172A',
  BORDER_HEADER: '334155',    // Slate 700
  ROW_ZEBRA_EVEN: 'F8FAFC',   // Slate 50
  ROW_ZEBRA_ODD: 'FFFFFF',
  TOTAL_BG: 'FEF3C7',         // Warm Amber 100 for accounting totals
  SUBTOTAL_BG: 'EFF6FF',      // Soft Blue 50 for entry balances
  ACCENT_GREEN_BG: 'DCFCE7',  // Emerald 100
  TITLE_BANNER_BG: 'F1F5F9',  // Slate 100
};

export const THIN_BORDER = {
  top: { style: 'thin', color: { rgb: EXCEL_COLORS.BORDER_LIGHT } },
  bottom: { style: 'thin', color: { rgb: EXCEL_COLORS.BORDER_LIGHT } },
  left: { style: 'thin', color: { rgb: EXCEL_COLORS.BORDER_LIGHT } },
  right: { style: 'thin', color: { rgb: EXCEL_COLORS.BORDER_LIGHT } }
};

export const TOTAL_BORDER = {
  top: { style: 'thin', color: { rgb: EXCEL_COLORS.BORDER_DARK } },
  bottom: { style: 'double', color: { rgb: EXCEL_COLORS.BORDER_DARK } },
  left: { style: 'thin', color: { rgb: EXCEL_COLORS.BORDER_LIGHT } },
  right: { style: 'thin', color: { rgb: EXCEL_COLORS.BORDER_LIGHT } }
};

export const SUBTOTAL_BORDER = {
  top: { style: 'thin', color: { rgb: '93C5FD' } },
  bottom: { style: 'thin', color: { rgb: '93C5FD' } },
  left: { style: 'thin', color: { rgb: EXCEL_COLORS.BORDER_LIGHT } },
  right: { style: 'thin', color: { rgb: EXCEL_COLORS.BORDER_LIGHT } }
};

export interface StyledCell {
  v: any;
  t: 's' | 'n' | 'b' | 'd';
  z?: string;
  s?: any;
}

/**
 * Creates a styled table column header cell
 */
export function createHeaderCell(
  text: string,
  align: 'center' | 'left' | 'right' = 'center',
  headerBg: string = EXCEL_COLORS.NAVY_HEADER
): StyledCell {
  return {
    v: text,
    t: 's',
    s: {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: EXCEL_COLORS.TEXT_WHITE } },
      alignment: { horizontal: align, vertical: 'center', wrapText: true },
      fill: { fgColor: { rgb: headerBg } },
      border: {
        top: { style: 'thin', color: { rgb: EXCEL_COLORS.BORDER_HEADER } },
        bottom: { style: 'medium', color: { rgb: EXCEL_COLORS.BORDER_DARK } },
        left: { style: 'thin', color: { rgb: EXCEL_COLORS.BORDER_HEADER } },
        right: { style: 'thin', color: { rgb: EXCEL_COLORS.BORDER_HEADER } }
      }
    }
  };
}

/**
 * Creates a styled data cell formatted as a number with 2 decimals (#,##0.00)
 */
export function createDataNumberCell(
  value: number | null | undefined,
  rowIndex: number,
  format: string = '#,##0.00',
  isBold: boolean = false
): StyledCell {
  const num = Number(value ?? 0);
  const isEven = rowIndex % 2 === 0;
  return {
    v: num,
    t: 'n',
    z: format,
    s: {
      numFmt: format,
      font: { name: 'Calibri', sz: 10, bold: isBold, color: { rgb: EXCEL_COLORS.TEXT_DARK } },
      alignment: { horizontal: 'right', vertical: 'center' },
      fill: { fgColor: { rgb: isEven ? EXCEL_COLORS.ROW_ZEBRA_EVEN : EXCEL_COLORS.ROW_ZEBRA_ODD } },
      border: THIN_BORDER
    }
  };
}

/**
 * Creates a styled data cell formatted as percentage (0.00%)
 */
export function createDataPercentCell(
  ratioValue: number | null | undefined,
  rowIndex: number
): StyledCell {
  const num = Number(ratioValue ?? 0);
  const isEven = rowIndex % 2 === 0;
  return {
    v: num,
    t: 'n',
    z: '0.00%',
    s: {
      numFmt: '0.00%',
      font: { name: 'Calibri', sz: 10, color: { rgb: EXCEL_COLORS.TEXT_DARK } },
      alignment: { horizontal: 'right', vertical: 'center' },
      fill: { fgColor: { rgb: isEven ? EXCEL_COLORS.ROW_ZEBRA_EVEN : EXCEL_COLORS.ROW_ZEBRA_ODD } },
      border: THIN_BORDER
    }
  };
}

/**
 * Creates a styled text cell with custom alignment, borders, and zebra fill
 */
export function createDataTextCell(
  text: any,
  align: 'left' | 'center' | 'right' = 'left',
  rowIndex: number,
  isBold: boolean = false
): StyledCell {
  const isEven = rowIndex % 2 === 0;
  return {
    v: String(text ?? ''),
    t: 's',
    s: {
      font: { name: 'Calibri', sz: 10, bold: isBold, color: { rgb: EXCEL_COLORS.TEXT_DARK } },
      alignment: { horizontal: align, vertical: 'center', wrapText: true },
      fill: { fgColor: { rgb: isEven ? EXCEL_COLORS.ROW_ZEBRA_EVEN : EXCEL_COLORS.ROW_ZEBRA_ODD } },
      border: THIN_BORDER
    }
  };
}

/**
 * Creates a styled Total cell for the bottom of columns with amounts
 * Uses bold 11pt, accounting double bottom line, and warm highlight fill.
 */
export function createTotalCell(
  value: number | string,
  isNumber: boolean = true,
  align: 'right' | 'left' | 'center' = 'right',
  format: string = '#,##0.00'
): StyledCell {
  if (isNumber) {
    const num = Number(value ?? 0);
    return {
      v: num,
      t: 'n',
      z: format,
      s: {
        numFmt: format,
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: EXCEL_COLORS.TEXT_DARK } },
        alignment: { horizontal: align, vertical: 'center' },
        fill: { fgColor: { rgb: EXCEL_COLORS.TOTAL_BG } },
        border: TOTAL_BORDER
      }
    };
  }

  return {
    v: String(value ?? ''),
    t: 's',
    s: {
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: EXCEL_COLORS.TEXT_DARK } },
      alignment: { horizontal: align, vertical: 'center', wrapText: true },
      fill: { fgColor: { rgb: EXCEL_COLORS.TOTAL_BG } },
      border: TOTAL_BORDER
    }
  };
}

/**
 * Creates a styled Subtotal cell for journal entry vouchers
 */
export function createSubtotalCell(
  value: number | string,
  isNumber: boolean = true,
  align: 'right' | 'left' | 'center' = 'right',
  format: string = '#,##0.00'
): StyledCell {
  if (isNumber) {
    const num = Number(value ?? 0);
    return {
      v: num,
      t: 'n',
      z: format,
      s: {
        numFmt: format,
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '1E3A8A' } },
        alignment: { horizontal: align, vertical: 'center' },
        fill: { fgColor: { rgb: EXCEL_COLORS.SUBTOTAL_BG } },
        border: SUBTOTAL_BORDER
      }
    };
  }

  return {
    v: String(value ?? ''),
    t: 's',
    s: {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '1E3A8A' } },
      alignment: { horizontal: align, vertical: 'center', wrapText: true },
      fill: { fgColor: { rgb: EXCEL_COLORS.SUBTOTAL_BG } },
      border: SUBTOTAL_BORDER
    }
  };
}

/**
 * Creates a styled title banner cell
 */
export function createTitleBannerCell(
  text: string,
  level: 'title' | 'subtitle' | 'meta' | 'warning' = 'title'
): StyledCell {
  if (level === 'title') {
    return {
      v: text,
      t: 's',
      s: {
        font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: EXCEL_COLORS.NAVY_HEADER } },
        alignment: { horizontal: 'left', vertical: 'center' },
        fill: { fgColor: { rgb: EXCEL_COLORS.TITLE_BANNER_BG } }
      }
    };
  }
  if (level === 'subtitle') {
    return {
      v: text,
      t: 's',
      s: {
        font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: '334155' } },
        alignment: { horizontal: 'left', vertical: 'center' }
      }
    };
  }
  if (level === 'warning') {
    return {
      v: text,
      t: 's',
      s: {
        font: { name: 'Calibri', sz: 9.5, bold: true, color: { rgb: '991B1B' } },
        alignment: { horizontal: 'left', vertical: 'center' }
      }
    };
  }
  return {
    v: text,
    t: 's',
    s: {
      font: { name: 'Calibri', sz: 9.5, italic: true, color: { rgb: EXCEL_COLORS.TEXT_MUTED } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  };
}

/**
 * Safely triggers download in browser or saves file
 */
export function saveExcelWorkbook(wb: any, filename: string): void {
  try {
    XLSX.writeFile(wb, filename);
  } catch (err) {
    console.warn('Standard XLSX.writeFile failed, using Blob fallback:', err);
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
