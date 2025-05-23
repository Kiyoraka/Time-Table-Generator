class ExcelExporter {
    constructor() {
        // Reference to xlsx library (will be loaded dynamically)
        this.xlsx = null;
    }
    
    // Main export function
    exportToExcel(timetableContainer) {
        return new Promise((resolve, reject) => {
            this.loadLibraries()
                .then(() => {
                    this.generateExcel(timetableContainer)
                        .then(resolve)
                        .catch(reject);
                })
                .catch(error => {
                    console.error('Failed to load Excel export libraries:', error);
                    reject('Failed to load required libraries for Excel export.');
                });
        });
    }
    
    // Load required libraries
    loadLibraries() {
        return new Promise((resolve, reject) => {
            // Check if the library is already loaded
            if (window.XLSX) {
                this.xlsx = window.XLSX;
                resolve();
                return;
            }
            
            // Load SheetJS (xlsx) library
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
            script.onload = () => {
                this.xlsx = window.XLSX;
                resolve();
            };
            script.onerror = () => reject('Failed to load Excel library.');
            document.head.appendChild(script);
        });
    }
    
    // Generate Excel file from timetable
    generateExcel(timetableContainer) {
        return new Promise((resolve, reject) => {
            try {
                // Get the title and subtitle
                const title = document.querySelector('.timetable-header').textContent || 'Timetable';
                const subtitle = document.querySelector('.timetable-subheader').textContent || '';
                
                // Get the timetable element
                const timetable = timetableContainer.querySelector('.timetable');
                if (!timetable) {
                    reject('Timetable not found');
                    return;
                }
                
                // Extract data and styling information
                const { data, merges, styles } = this.extractTimetableDataAndStyles(timetable);
                
                // Create a new workbook
                const wb = this.xlsx.utils.book_new();
                
                // Create a worksheet from the data
                const ws = this.xlsx.utils.aoa_to_sheet([
                    [title],
                    [subtitle],
                    [''], // Empty row for spacing
                    ...data
                ]);
                
                // Set column widths for better readability
                ws['!cols'] = this.generateColumnWidths(data[0].length);
                
                // Set row heights
                ws['!rows'] = this.generateRowHeights(data.length + 3);
                
                // Apply cell merges
                if (!ws['!merges']) ws['!merges'] = [];
                
                // Merge cells for title and subtitle
                ws['!merges'].push({ 
                    s: { r: 0, c: 0 }, 
                    e: { r: 0, c: data[0].length - 1 } 
                });
                ws['!merges'].push({ 
                    s: { r: 1, c: 0 }, 
                    e: { r: 1, c: data[0].length - 1 } 
                });
                
                // Add all the content merges
                merges.forEach(merge => {
                    // Adjust row index for title, subtitle, and spacing rows
                    ws['!merges'].push({
                        s: { r: merge.s.r + 3, c: merge.s.c },
                        e: { r: merge.e.r + 3, c: merge.e.c }
                    });
                });
                
                // Apply styles to cells
                this.applyCellStyles(ws, styles, data.length + 3, data[0].length);
                
                // Style the title and subtitle
                this.styleTitleAndSubtitle(ws, data[0].length);
                
                // Add worksheet to workbook
                this.xlsx.utils.book_append_sheet(wb, ws, 'Timetable');
                
                // Save the Excel file
                const dateTime = new Date().toLocaleString().replace(/[/\\:]/g, '-');
                const fileName = `timetable-${dateTime}.xlsx`;
                
                this.xlsx.writeFile(wb, fileName);
                resolve(fileName);
            } catch (error) {
                console.error('Error generating Excel:', error);
                reject('Failed to generate Excel file. Please try again.');
            }
        });
    }
    
    // Extract data and styling from the timetable
    extractTimetableDataAndStyles(timetable) {
        const data = [];
        const merges = [];
        const styles = [];
        const rows = timetable.rows;
        let maxCols = 0;
        
        // First pass: determine the maximum number of columns
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].cells;
            let colCount = 0;
            
            for (let j = 0; j < cells.length; j++) {
                const colspan = parseInt(cells[j].getAttribute('colspan')) || 1;
                colCount += colspan;
            }
            
            maxCols = Math.max(maxCols, colCount);
        }
        
        // Second pass: extract data and styling
        for (let i = 0; i < rows.length; i++) {
            const rowData = new Array(maxCols).fill(''); // Initialize with empty strings
            const cells = rows[i].cells;
            let colIndex = 0;
            
            for (let j = 0; j < cells.length; j++) {
                const cell = cells[j];
                const colspan = parseInt(cell.getAttribute('colspan')) || 1;
                
                // Skip already filled cells (from previous colspan)
                while (colIndex < maxCols && rowData[colIndex] !== '') {
                    colIndex++;
                }
                
                // Extract cell content
                let cellContent = '';
                let cellStyle = {};
                
                // Handle header cells
                if (cell.tagName === 'TH') {
                    cellContent = cell.textContent.trim();
                    cellStyle = {
                        font: { bold: true },
                        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'F2F2F2' } },
                        border: this.getBorderStyle()
                    };
                } 
                // Handle data cells
                else {
                    // If it's the day column (first column)
                    if (j === 0) {
                        cellContent = cell.textContent.trim();
                        cellStyle = {
                            font: { bold: true },
                            alignment: { horizontal: 'center', vertical: 'center' },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'F2F2F2' } },
                            border: this.getBorderStyle()
                        };
                    }
                    // If it's a subject cell
                    else if (cell.classList.contains('subject-cell') || cell.querySelector('.subject-cell')) {
                        const targetCell = cell.classList.contains('subject-cell') ? cell : cell.querySelector('.subject-cell');
                        
                        // Get subject parts
                        const subjectCode = targetCell.querySelector('.subject-code');
                        const subjectName = targetCell.querySelector('.subject-name');
                        const lecturer = targetCell.querySelector('.lecturer');
                        const location = targetCell.querySelector('.location');
                        
                        // Build cell content
                        const parts = [];
                        if (subjectCode) parts.push(subjectCode.textContent.trim());
                        if (subjectName) parts.push(subjectName.textContent.trim());
                        if (lecturer) parts.push(lecturer.textContent.trim());
                        if (location) parts.push(location.textContent.trim());
                        
                        cellContent = parts.join('\n');
                        
                        // Get the background color
                        const colorClass = this.getColorClass(targetCell);
                        const fillColor = this.colorClassToHex(colorClass);
                        
                        cellStyle = {
                            font: { bold: subjectCode !== null },
                            alignment: { vertical: 'center', wrapText: true },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: fillColor } },
                            border: this.getBorderStyle()
                        };
                    } else {
                        cellContent = cell.textContent.trim();
                        cellStyle = {
                            alignment: { horizontal: 'center', vertical: 'center' },
                            border: this.getBorderStyle()
                        };
                    }
                }
                
                // Set the cell content
                rowData[colIndex] = cellContent;
                
                // Add cell style
                styles.push({
                    row: i,
                    col: colIndex,
                    style: cellStyle
                });
                
                // Handle colspan
                if (colspan > 1) {
                    // Add merge info
                    merges.push({
                        s: { r: i, c: colIndex },
                        e: { r: i, c: colIndex + colspan - 1 }
                    });
                    
                    // Mark cells covered by colspan
                    for (let k = 1; k < colspan; k++) {
                        if (colIndex + k < maxCols) {
                            rowData[colIndex + k] = '';
                        }
                    }
                }
                
                // Move to the next column position
                colIndex += colspan;
            }
            
            data.push(rowData);
        }
        
        return { data, merges, styles };
    }
    
    // Apply styles to cells
    applyCellStyles(ws, styles, rowCount, colCount) {
        // Initialize cell styles if not already
        if (!ws['!data']) ws['!data'] = [];
        
        // Apply borders to all cells in the table
        for (let i = 3; i < rowCount; i++) { // Skip title, subtitle, and spacing rows
            for (let j = 0; j < colCount; j++) {
                const cellRef = this.xlsx.utils.encode_cell({ r: i, c: j });
                if (!ws[cellRef]) {
                    ws[cellRef] = { t: 's', v: '' };
                }
                if (!ws[cellRef].s) {
                    ws[cellRef].s = {
                        border: this.getBorderStyle()
                    };
                }
            }
        }
        
        // Apply specific styles
        styles.forEach(style => {
            const { row, col, style: cellStyle } = style;
            const cellRef = this.xlsx.utils.encode_cell({ r: row + 3, c: col }); // +3 for title, subtitle, and spacing rows
            
            if (!ws[cellRef]) {
                ws[cellRef] = { t: 's', v: '' };
            }
            
            ws[cellRef].s = cellStyle;
        });
    }
    
    // Style the title and subtitle rows
    styleTitleAndSubtitle(ws, colCount) {
        // Title style
        const titleRef = this.xlsx.utils.encode_cell({ r: 0, c: 0 });
        if (!ws[titleRef]) {
            ws[titleRef] = { t: 's', v: '' };
        }
        ws[titleRef].s = {
            font: { bold: true, size: 16 },
            alignment: { horizontal: 'center', vertical: 'center' }
        };
        
        // Subtitle style
        const subtitleRef = this.xlsx.utils.encode_cell({ r: 1, c: 0 });
        if (!ws[subtitleRef]) {
            ws[subtitleRef] = { t: 's', v: '' };
        }
        ws[subtitleRef].s = {
            font: { size: 14 },
            alignment: { horizontal: 'center', vertical: 'center' }
        };
    }
    
    // Generate column widths
    generateColumnWidths(colCount) {
        const widths = [];
        
        // First column (day names) gets a narrower width
        widths.push({ wch: 8 });
        
        // Time columns get a wider width
        for (let i = 1; i < colCount; i++) {
            widths.push({ wch: 15 });
        }
        
        return widths;
    }
    
    // Generate row heights
    generateRowHeights(rowCount) {
        const heights = [];
        
        // Title and subtitle rows
        heights.push({ hpt: 30 }); // Title
        heights.push({ hpt: 25 }); // Subtitle
        heights.push({ hpt: 15 }); // Spacing
        
        // Data rows (including header)
        for (let i = 3; i < rowCount; i++) {
            if (i === 3) {
                heights.push({ hpt: 40 }); // Header row
            } else {
                heights.push({ hpt: 80 }); // Data rows
            }
        }
        
        return heights;
    }
    
    // Get standard border style
    getBorderStyle() {
        return {
            top: { style: 'thin', color: { rgb: 'DDDDDD' } },
            right: { style: 'thin', color: { rgb: 'DDDDDD' } },
            bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
            left: { style: 'thin', color: { rgb: 'DDDDDD' } }
        };
    }
    
    // Get the color class from a subject cell
    getColorClass(cell) {
        for (let i = 1; i <= 8; i++) {
            if (cell.classList.contains(`color-${i}`)) {
                return `color-${i}`;
            }
        }
        return 'color-1'; // Default color
    }
    
    // Convert color class to hex color code
    colorClassToHex(colorClass) {
        const colorMap = {
            'color-1': 'E1F5FE', // Light blue
            'color-2': 'E8F5E9', // Light green
            'color-3': 'FFF8E1', // Light yellow
            'color-4': 'F3E5F5', // Light purple
            'color-5': 'E0F2F1', // Light teal
            'color-6': 'FFEBEE', // Light red
            'color-7': 'EDE7F6', // Light deep purple
            'color-8': 'FBE9E7'  // Light orange
        };
        
        return colorMap[colorClass] || 'FFFFFF'; // Default to white
    }
}