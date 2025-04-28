// assets/js/excel_export.js

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
                
                // Extract data from the timetable
                const data = this.extractTimetableData(timetable);
                
                // Create workbook and worksheet
                const wb = this.xlsx.utils.book_new();
                const ws = this.xlsx.utils.aoa_to_sheet(data);
                
                // Add worksheet to workbook
                this.xlsx.utils.book_append_sheet(wb, ws, 'Timetable');
                
                // Set column widths
                const colWidths = data[0].map(() => ({ wch: 15 })); // Default width for all columns
                colWidths[0] = { wch: 8 }; // Day column is narrower
                ws['!cols'] = colWidths;
                
                // Apply styles (basic styling using cell comments as the free version doesn't support full styling)
                // Title in cell A1
                if (!ws.A1) ws.A1 = { v: title };
                ws.A1.c = { a: 'Timetable Generator', t: { color: { rgb: "2F75B5" } } };
                
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
    
    // Extract data from the timetable HTML into a 2D array
    extractTimetableData(timetable) {
        const rows = timetable.querySelectorAll('tr');
        const data = [];
        
        // Process each row
        rows.forEach((row, rowIndex) => {
            const rowData = [];
            const cells = row.querySelectorAll('th, td');
            
            // Process each cell in the row
            cells.forEach((cell, cellIndex) => {
                // Handle header cells
                if (cell.tagName === 'TH') {
                    // Skip empty corner cell
                    if (rowIndex === 0 && cellIndex === 0 && !cell.textContent.trim()) {
                        rowData.push('');
                    } else {
                        rowData.push(cell.textContent.trim());
                    }
                } 
                // Handle data cells
                else {
                    // For the first column (days)
                    if (cellIndex === 0) {
                        rowData.push(cell.textContent.trim());
                    } 
                    // For empty cells
                    else if (!cell.querySelector('.subject-cell') && !cell.classList.contains('subject-cell')) {
                        rowData.push('');
                    } 
                    // For cells with subjects
                    else {
                        let cellContent = '';
                        
                        // Get subject code
                        const subjectCode = cell.querySelector('.subject-code');
                        if (subjectCode) {
                            cellContent += subjectCode.textContent.trim() + '\n';
                        }
                        
                        // Get subject name
                        const subjectName = cell.querySelector('.subject-name');
                        if (subjectName) {
                            cellContent += subjectName.textContent.trim() + '\n';
                        }
                        
                        // Get lecturer
                        const lecturer = cell.querySelector('.lecturer');
                        if (lecturer) {
                            cellContent += lecturer.textContent.trim() + '\n';
                        }
                        
                        // Get location
                        const location = cell.querySelector('.location');
                        if (location) {
                            cellContent += location.textContent.trim();
                        }
                        
                        rowData.push(cellContent.trim());
                    }
                }
                
                // Handle colspan
                const colspan = cell.getAttribute('colspan');
                if (colspan) {
                    const colspanValue = parseInt(colspan);
                    for (let i = 1; i < colspanValue; i++) {
                        rowData.push('');  // Add empty cells for the spanned columns
                    }
                }
            });
            
            data.push(rowData);
        });
        
        return data;
    }
}