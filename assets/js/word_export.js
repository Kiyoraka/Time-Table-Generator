// assets/js/word_export.js

class WordExporter {
    constructor() {
        // Reference to docx library (will be loaded dynamically)
        this.docx = null;
    }
    
    // Main export function
    exportToWord(timetableContainer) {
        return new Promise((resolve, reject) => {
            this.loadLibraries()
                .then(() => {
                    this.generateWord(timetableContainer)
                        .then(resolve)
                        .catch(reject);
                })
                .catch(error => {
                    console.error('Failed to load Word export libraries:', error);
                    reject('Failed to load required libraries for Word export.');
                });
        });
    }
    
    // Load required libraries
    loadLibraries() {
        return new Promise((resolve, reject) => {
            // Check if html2canvas is already loaded
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
            
            // Use a fallback approach for Word export
            loadHTML2Canvas
                .then(() => {
                    // Since docx.js is giving issues, let's use a simpler alternative approach
                    // We'll create a Word-like HTML document and offer it for download
                    resolve();
                })
                .catch(reject);
        });
    }
    
    // Generate a Word-like HTML document
    generateWord(timetableContainer) {
        return new Promise((resolve, reject) => {
            const title = document.querySelector('.timetable-header').textContent || 'Timetable';
            const subtitle = document.querySelector('.timetable-subheader').textContent || '';
            
            // Render HTML to canvas
            html2canvas(timetableContainer, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            }).then(canvas => {
                // Get the image as base64
                const imgData = canvas.toDataURL('image/png');
                
                // Create an HTML document that can be opened in Word
                const wordDoc = `
                    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                          xmlns:w="urn:schemas-microsoft-com:office:word" 
                          xmlns="http://www.w3.org/TR/REC-html40">
                    <head>
                        <meta charset="utf-8">
                        <title>${title}</title>
                        <style>
                            body { font-family: Arial, sans-serif; }
                            h1, h2 { text-align: center; }
                            .timetable-image { 
                                width: 100%; 
                                max-width: 1000px; 
                                display: block; 
                                margin: 20px auto; 
                            }
                            .footer { 
                                text-align: center; 
                                margin-top: 20px; 
                                color: #666; 
                                font-size: 12px; 
                            }
                        </style>
                    </head>
                    <body>
                        <h1>${title}</h1>
                        <h2>${subtitle}</h2>
                        <img src="${imgData}" class="timetable-image" alt="Timetable">
                        <div class="footer">Generated with Timetable Generator</div>
                    </body>
                    </html>
                `;
                
                // Create a blob and download it
                const blob = new Blob([wordDoc], {type: 'application/msword'});
                const dateTime = new Date().toLocaleString().replace(/[/\\:]/g, '-');
                const fileName = `timetable-${dateTime}.doc`;
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = url;
                a.download = fileName;
                a.click();
                
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                resolve(fileName);
            }).catch(error => {
                console.error('Error generating Word document:', error);
                reject('Failed to generate Word document. Please try again.');
            });
        });
    }
}