

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
                
                // Extract data from the timetable as a simple 2D array
                const data = this.extractTimetableData(timetable);
                
                // Create a new workbook
                const wb = this.xlsx.utils.book_new();
                
                // Create a worksheet from the data
                const ws = this.xlsx.utils.aoa_to_sheet([
                    [title],
                    [subtitle],
                    [''], // Empty row for spacing
                    ...data
                ]);
                
                // Merge cells for title and subtitle
                if (!ws['!merges']) ws['!merges'] = [];
                // Merge cells for title (A1 to last column)
                ws['!merges'].push({ 
                    s: { r: 0, c: 0 }, 
                    e: { r: 0, c: data[0].length - 1 } 
                });
                // Merge cells for subtitle (A2 to last column)
                ws['!merges'].push({ 
                    s: { r: 1, c: 0 }, 
                    e: { r: 1, c: data[0].length - 1 } 
                });
                
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
    
    // Extract data from the timetable HTML into a simple 2D array
    extractTimetableData(timetable) {
        const data = [];
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
        
        // Second pass: extract data ensuring consistent columns
        for (let i = 0; i < rows.length; i++) {
            const rowData = new Array(maxCols).fill(''); // Initialize with empty strings
            const cells = rows[i].cells;
            let colIndex = 0;
            
            for (let j = 0; j < cells.length; j++) {
                const cell = cells[j];
                const colspan = parseInt(cell.getAttribute('colspan')) || 1;
                
                // Skip already filled cells (from previous colspan)
                while (rowData[colIndex] !== '') {
                    colIndex++;
                }
                
                // Extract cell content
                let cellContent = '';
                
                // Handle header cells
                if (cell.tagName === 'TH') {
                    cellContent = cell.textContent.trim();
                } 
                // Handle data cells
                else {
                    // If it's a subject cell
                    if (cell.classList.contains('subject-cell') || cell.querySelector('.subject-cell')) {
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
                    } else {
                        cellContent = cell.textContent.trim();
                    }
                }
                
                // Set the cell content
                rowData[colIndex] = cellContent;
                
                // Handle colspan
                for (let k = 1; k < colspan; k++) {
                    if (colIndex + k < maxCols) {
                        rowData[colIndex + k] = ''; // Mark as used by colspan
                    }
                }
                
                // Move to the next column position
                colIndex += colspan;
            }
            
            data.push(rowData);
        }
        
        return data;
    }
}