// assets/js/word_export.js

class WordExporter {
    constructor() {
        // No external libraries needed for this approach
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
            
            loadHTML2Canvas.then(resolve).catch(reject);
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
                
                // Calculate proper image dimensions for portrait orientation
                // Standard A4 width: 595pt (8.26 inches), height: 842pt (11.69 inches)
                const canvasAspectRatio = canvas.width / canvas.height;
                
                // Create an HTML document that can be opened in Word - with portrait orientation
                const wordDoc = `
                    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                          xmlns:w="urn:schemas-microsoft-com:office:word" 
                          xmlns="http://www.w3.org/TR/REC-html40">
                    <head>
                        <meta charset="utf-8">
                        <title>${title}</title>
                        <!-- Page setup for Word - Portrait orientation and margins -->
                        <style>
                            @page {
                                size: portrait;
                                margin: 1cm;
                                mso-page-orientation: portrait;
                            }
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 0;
                            }
                            h1, h2 {
                                text-align: center;
                                margin: 12pt 0;
                            }
                            h1 {
                                font-size: 18pt;
                            }
                            h2 {
                                font-size: 14pt;
                                font-weight: normal;
                            }
                            .container {
                                width: 100%;
                                text-align: center;
                            }
                            .timetable-image {
                                max-width: 100%;
                                height: auto;
                                margin: 15pt auto;
                                display: block;
                                page-break-inside: avoid;
                            }
                            .footer {
                                text-align: center;
                                margin-top: 15pt;
                                color: #666;
                                font-size: 9pt;
                            }
                            /* Word-specific directives for page layout */
                            v\\:* {behavior:url(#default#VML);}
                            o\\:* {behavior:url(#default#VML);}
                            w\\:* {behavior:url(#default#VML);}
                            .shape {behavior:url(#default#VML);}
                        </style>
                        <!-- Word specific XML for page setup -->
                        <!--[if gte mso 9]>
                        <xml>
                            <w:WordDocument>
                                <w:View>Print</w:View>
                                <w:Zoom>100</w:Zoom>
                                <w:DoNotOptimizeForBrowser/>
                            </w:WordDocument>
                        </xml>
                        <![endif]-->
                    </head>
                    <body>
                        <h1>${title}</h1>
                        <h2>${subtitle}</h2>
                        <div class="container">
                            <img src="${imgData}" class="timetable-image" alt="Timetable">
                        </div>
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