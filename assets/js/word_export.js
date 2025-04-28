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
            // Check if libraries are already loaded
            if (window.html2canvas && window.JSZip && window.docx) {
                this.docx = window.docx;
                resolve();
                return;
            }
            
            // Load html2canvas if needed
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
            
            // Load JSZip after html2canvas
            const loadJSZip = loadHTML2Canvas.then(() => {
                return new Promise((resolveJSZip, rejectJSZip) => {
                    if (window.JSZip) {
                        resolveJSZip();
                        return;
                    }
                    
                    const jsZipScript = document.createElement('script');
                    jsZipScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                    jsZipScript.onload = resolveJSZip;
                    jsZipScript.onerror = () => rejectJSZip('Failed to load JSZip library.');
                    document.head.appendChild(jsZipScript);
                });
            });
            
            // Load docx.js after JSZip
            loadJSZip
                .then(() => {
                    return new Promise((resolveDocx, rejectDocx) => {
                        const docxScript = document.createElement('script');
                        docxScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/docx/7.8.2/docx.js';
                        docxScript.onload = () => {
                            this.docx = window.docx;
                            resolveDocx();
                        };
                        docxScript.onerror = () => rejectDocx('Failed to load docx.js library.');
                        document.head.appendChild(docxScript);
                    });
                })
                .then(resolve)
                .catch(reject);
        });
    }
    
    // Generate the Word document
    generateWord(timetableContainer) {
        return new Promise((resolve, reject) => {
            const title = document.querySelector('.timetable-header').textContent || 'Timetable';
            const subtitle = document.querySelector('.timetable-subheader').textContent || '';
            
            // Render HTML to canvas for the image
            html2canvas(timetableContainer, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            }).then(canvas => {
                // Convert canvas to blob
                canvas.toBlob(blob => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        // Create Word document with docx.js
                        const { Document, Paragraph, TextRun, AlignmentType, HeadingLevel, ImageRun, Packer } = this.docx;
                        
                        // Create document
                        const doc = new Document({
                            sections: [{
                                properties: { page: { size: { orientation: 'landscape' } } },
                                children: [
                                    new Paragraph({
                                        text: title,
                                        heading: HeadingLevel.HEADING_1,
                                        alignment: AlignmentType.CENTER
                                    }),
                                    new Paragraph({
                                        text: subtitle,
                                        heading: HeadingLevel.HEADING_2,
                                        alignment: AlignmentType.CENTER
                                    }),
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new ImageRun({
                                                data: reader.result,
                                                transformation: {
                                                    width: 650,
                                                    height: 330,
                                                }
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        text: 'Generated with Timetable Generator',
                                        alignment: AlignmentType.CENTER,
                                        style: 'small'
                                    })
                                ]
                            }]
                        });
                        
                        // Save the document
                        Packer.toBlob(doc).then(docBlob => {
                            // Create a download link
                            const dateTime = new Date().toLocaleString().replace(/[/\\:]/g, '-');
                            const fileName = `timetable-${dateTime}.docx`;
                            
                            const url = window.URL.createObjectURL(docBlob);
                            const a = document.createElement('a');
                            document.body.appendChild(a);
                            a.style.display = 'none';
                            a.href = url;
                            a.download = fileName;
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                            
                            resolve(fileName);
                        });
                    };
                    reader.readAsArrayBuffer(blob);
                });
            }).catch(error => {
                console.error('Error generating Word document:', error);
                reject('Failed to generate Word document. Please try again.');
            });
        });
    }
}