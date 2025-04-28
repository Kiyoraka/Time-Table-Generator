// assets/js/pdf_export.js

class PDFExporter {
    constructor() {
        // Reference to jsPDF library (will be loaded dynamically)
        this.jsPDF = null;
    }
    
    // Main export function
    exportToPDF(timetableContainer) {
        return new Promise((resolve, reject) => {
            this.loadLibraries()
                .then(() => {
                    this.generatePDF(timetableContainer)
                        .then(resolve)
                        .catch(reject);
                })
                .catch(error => {
                    console.error('Failed to load PDF libraries:', error);
                    reject('Failed to load required libraries for PDF export.');
                });
        });
    }
    
    // Load required libraries
    loadLibraries() {
        return new Promise((resolve, reject) => {
            // Check if libraries are already loaded
            if (window.jspdf && window.html2canvas) {
                this.jsPDF = window.jspdf.jsPDF;
                resolve();
                return;
            }
            
            // Load html2canvas first if needed
            const loadHTML2Canvas = new Promise((resolveCanvas, rejectCanvas) => {
                if (window.html2canvas) {
                    resolveCanvas();
                    return;
                }
                
                const html2canvasScript = document.createElement('script');
                html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                html2canvasScript.onload = resolveCanvas;
                html2canvasScript.onerror = () => rejectCanvas('Failed to load html2canvas library.');
                document.head.appendChild(html2canvasScript);
            });
            
            // Load jsPDF after html2canvas
            loadHTML2Canvas
                .then(() => {
                    return new Promise((resolvePDF, rejectPDF) => {
                        const jsPDFScript = document.createElement('script');
                        jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                        jsPDFScript.onload = () => {
                            this.jsPDF = window.jspdf.jsPDF;
                            resolvePDF();
                        };
                        jsPDFScript.onerror = () => rejectPDF('Failed to load jsPDF library.');
                        document.head.appendChild(jsPDFScript);
                    });
                })
                .then(resolve)
                .catch(reject);
        });
    }
    
    // Generate the PDF using html2canvas and jsPDF
    generatePDF(timetableContainer) {
        return new Promise((resolve, reject) => {
            const title = document.querySelector('.timetable-header').textContent || 'Timetable';
            const subtitle = document.querySelector('.timetable-subheader').textContent || '';
            
            // Render HTML to canvas
            html2canvas(timetableContainer, {
                scale: 2, // Higher scale for better quality
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            }).then(canvas => {
                // Create new PDF document (landscape)
                const pdf = new this.jsPDF({
                    orientation: 'landscape',
                    unit: 'mm'
                });
                
                // Get the width and height of the PDF page in mm
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                // Calculate the aspect ratio of the canvas
                const canvasAspectRatio = canvas.width / canvas.height;
                
                // Calculate dimensions to fit in PDF
                let imgWidth = pageWidth - 20; // 10mm margins on both sides
                let imgHeight = imgWidth / canvasAspectRatio;
                
                // Ensure the image fits on the page with margins
                if (imgHeight > pageHeight - 30) { // 15mm margins top and bottom
                    imgHeight = pageHeight - 30;
                    imgWidth = imgHeight * canvasAspectRatio;
                }
                
                // Calculate position to center the image
                const x = (pageWidth - imgWidth) / 2;
                const y = 15; // 15mm from top
                
                // Add the image to the PDF
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
                
                // Add metadata
                pdf.setProperties({
                    title: title,
                    subject: subtitle,
                    creator: 'Timetable Generator',
                    author: 'Timetable Generator'
                });
                
                // Save the PDF
                const dateTime = new Date().toLocaleString().replace(/[/\\:]/g, '-');
                const fileName = `timetable-${dateTime}.pdf`;
                pdf.save(fileName);
                
                resolve(fileName);
            }).catch(error => {
                console.error('Error generating PDF:', error);
                reject('Failed to generate PDF. Please try again.');
            });
        });
    }
}