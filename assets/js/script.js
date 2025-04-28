document.addEventListener('DOMContentLoaded', function() {
    // Store all entries
    let entries = [];
    let subjectColors = {};
    let colorIndex = 1;
    let pagination;
    let timeSettings;
    
    // Initialize exporters
    const pdfExporter = new PDFExporter();
    const wordExporter = new WordExporter();
    
    // DOM elements
    const addEntryBtn = document.getElementById('addEntryBtn');
    const generateBtn = document.getElementById('generateBtn');
    const saveImageBtn = document.getElementById('saveImageBtn');
    const exportPDFBtn = document.getElementById('exportPDFBtn');
    const exportWordBtn = document.getElementById('exportWordBtn');
    const closePopup = document.querySelector('.close');
    const timetablePopup = document.getElementById('timetablePopup');
    const entriesList = document.getElementById('entriesList');
    
    // Initialize time settings
    timeSettings = new TimeSettings();
    
    // Listen for time settings changes
    document.addEventListener('timeSettingsChanged', function() {
        // Update the generated timetable if it's currently visible
        if (timetablePopup.style.display === 'block') {
            generateTimetable();
        }
    });
    
    // Helper function to convert time to minutes for proper comparison
    function convertTimeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    // Add entry to the list
    addEntryBtn.addEventListener('click', function() {
        const day = document.getElementById('day').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const subjectCode = document.getElementById('subjectCode').value;
        const subjectName = document.getElementById('subjectName').value;
        const lecturer = document.getElementById('lecturer').value;
        const location = document.getElementById('location').value;
        
        // Validate inputs
        if (!day || !startTime || !endTime || !subjectName) {
            alert('Please fill in all required fields (Day, Start Time, End Time, Subject Name)');
            return;
        }
        
        // Validate that end time is after start time
        const startTimeValue = convertTimeToMinutes(startTime);
        const endTimeValue = convertTimeToMinutes(endTime);
        
        if (startTimeValue >= endTimeValue) {
            alert('End time must be after start time');
            return;
        }
        
        // Create entry object
        const entry = {
            day,
            startTime,
            endTime,
            subjectCode,
            subjectName,
            lecturer,
            location
        };
        
        // For color assignment, use a combined key or just the name if code is missing
        const subjectKey = subjectCode || subjectName;
        if (!subjectColors[subjectKey]) {
            subjectColors[subjectKey] = `color-${colorIndex}`;
            colorIndex = colorIndex % 8 + 1; // Cycle through 8 colors
        }
        
        // Add to entries array
        entries.push(entry);
        
        // Update entries list
        updateEntriesList();
        
        // Reset form
        document.getElementById('timetableForm').reset();
    });
    
    // Update the displayed entries list
    function updateEntriesList() {
        // Initialize pagination if not already done
        if (!pagination) {
            pagination = new EntriesPagination(entriesList);
            pagination.init();
            
            // Set up entry removal through event delegation
            entriesList.addEventListener('click', function(event) {
                if (event.target.classList.contains('remove-entry')) {
                    const index = parseInt(event.target.getAttribute('data-index'));
                    if (!isNaN(index)) {
                        entries.splice(index, 1);
                        updateEntriesList();
                    }
                }
            });
        }
        
        // Update entries in pagination
        pagination.updateEntries(entries);
    }
    
    // Get full day name from abbreviation
    function getDayName(abbr) {
        const days = {
            'Su': 'Sunday',
            'Mo': 'Monday',
            'Tu': 'Tuesday',
            'We': 'Wednesday',
            'Th': 'Thursday',
            'Fr': 'Friday',
            'Sa': 'Saturday'
        };
        return days[abbr] || abbr;
    }
    
    // Generate the timetable
    generateBtn.addEventListener('click', function() {
        if (entries.length === 0) {
            alert('Please add at least one entry before generating the timetable.');
            return;
        }
        
        generateTimetable();
        // Make sure to explicitly set display to block
        timetablePopup.style.display = 'block';
    });
    
    // Export to PDF
    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', function() {
            const btn = this;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="loading"></span> Exporting...';
            btn.disabled = true;
            
            const timetableContainer = document.getElementById('timetableContainer');
            
            pdfExporter.exportToPDF(timetableContainer)
                .then(fileName => {
                    console.log(`PDF exported as ${fileName}`);
                    btn.innerHTML = 'PDF Exported!';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 2000);
                })
                .catch(error => {
                    console.error('PDF export error:', error);
                    alert('Failed to export as PDF: ' + error);
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                });
        });
    }
    
    // Export to Word
    if (exportWordBtn) {
        exportWordBtn.addEventListener('click', function() {
            const btn = this;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="loading"></span> Exporting...';
            btn.disabled = true;
            
            const timetableContainer = document.getElementById('timetableContainer');
            
            wordExporter.exportToWord(timetableContainer)
                .then(fileName => {
                    console.log(`Word document exported as ${fileName}`);
                    btn.innerHTML = 'Word Exported!';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 2000);
                })
                .catch(error => {
                    console.error('Word export error:', error);
                    alert('Failed to export as Word: ' + error);
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                });
        });
    }
    
    // Close the popup
    closePopup.addEventListener('click', function() {
        timetablePopup.style.display = 'none';
    });
    
    // Close popup when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === timetablePopup) {
            timetablePopup.style.display = 'none';
        }
    });
    
    // Save the timetable as an image
    saveImageBtn.addEventListener('click', saveAsImage);
    
    function saveAsImage() {
        // Add loading class to button
        const originalText = saveImageBtn.innerHTML;
        saveImageBtn.innerHTML = '<span class="loading"></span> Processing...';
        saveImageBtn.disabled = true;
        
        // We need to use html2canvas library for this
        // First, check if it's already loaded
        if (typeof html2canvas === 'undefined') {
            // Load the library
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = function() {
                // Once loaded, capture the timetable
                captureAndDownload();
            };
            document.head.appendChild(script);
        } else {
            // Library already loaded, capture the timetable
            captureAndDownload();
        }
        
        function captureAndDownload() {
            const timetableContainer = document.getElementById('timetableContainer');
            
            html2canvas(timetableContainer, {
                scale: 2, // Higher scale for better quality
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            }).then(canvas => {
                // Convert canvas to image
                const imageURL = canvas.toDataURL('image/png');
                
                // Create download link
                const dateTime = new Date().toLocaleString().replace(/[/\\:]/g, '-');
                const fileName = `timetable-${dateTime}.png`;
                
                const a = document.createElement('a');
                a.href = imageURL;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Reset button
                saveImageBtn.innerHTML = originalText;
                saveImageBtn.disabled = false;
            }).catch(error => {
                console.error('Error capturing image:', error);
                alert('Failed to save as image. Please try again.');
                
                // Reset button
                saveImageBtn.innerHTML = originalText;
                saveImageBtn.disabled = false;
            });
        }
    }
    
    // Generate the timetable HTML
    function generateTimetable() {
        const timetableContainer = document.getElementById('timetableContainer');
        
        // Get custom title and subtitle values
        const customTitle = document.getElementById('timetableTitle').value || 'JADUAL WAKTU KULIAH';
        const customSubtitle = document.getElementById('timetableSubtitle').value || 'FA3.01';
        
        // Get time slots from time settings
        const timeSlots = timeSettings.getTimeSlots();
        
        // Create headers for the timetable
        let timetableHTML = `
            <div class="timetable-header">${customTitle}</div>
            <div class="timetable-subheader">${customSubtitle}</div>
            <table class="timetable">
                <tr>
                    <th></th>
        `;
        
        // Add time slot headers
        for (let i = 0; i < timeSlots.length - 1; i++) {
            const startTime = timeSettings.formatTimeForDisplay(timeSlots[i]);
            const endTime = timeSettings.formatTimeForDisplay(timeSlots[i + 1]);
            timetableHTML += `<th>${startTime} - ${endTime}</th>`;
        }
        
        timetableHTML += `</tr>`;
        
        // Days of the week
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        
        // Add rows for each day
        days.forEach(day => {
            timetableHTML += `
                <tr>
                    <td class="day-column">${day}</td>
            `;
            
            // Initialize a flag to track which cells to skip
            let skipCells = 0;
            
            // Process each time slot
            for (let index = 0; index < timeSlots.length - 1; index++) {
                // Skip cells that are already covered by a colspan
                if (skipCells > 0) {
                    skipCells--;
                    continue;
                }
                
                const slotStartTime = timeSlots[index];
                const slotEndTime = timeSlots[index + 1];
                const slotStartMinutes = convertTimeToMinutes(slotStartTime);
                const slotEndMinutes = convertTimeToMinutes(slotEndTime);
                
                // Check for entries that match this day and overlap with this time slot
                const matchingEntries = entries.filter(e => {
                    if (e.day !== day) return false;
                    
                    const entryStartMinutes = convertTimeToMinutes(e.startTime);
                    const entryEndMinutes = convertTimeToMinutes(e.endTime);
                    
                    return entryStartMinutes <= slotStartMinutes && entryEndMinutes >= slotEndMinutes;
                });
                
                if (matchingEntries.length > 0) {
                    // Use the first matching entry
                    const entry = matchingEntries[0];
                    const subjectKey = entry.subjectCode || entry.subjectName;
                    
                    // Calculate how many time slots this entry spans
                    const entryStartMinutes = convertTimeToMinutes(entry.startTime);
                    const entryEndMinutes = convertTimeToMinutes(entry.endTime);
                    
                    // Calculate colspan based on time slots
                    let colspan = 0;
                    for (let i = index; i < timeSlots.length - 1; i++) {
                        const currentSlotStart = convertTimeToMinutes(timeSlots[i]);
                        const currentSlotEnd = convertTimeToMinutes(timeSlots[i + 1]);
                        
                        if (entryStartMinutes <= currentSlotStart && entryEndMinutes >= currentSlotEnd) {
                            colspan++;
                        } else {
                            break;
                        }
                    }
                    
                    // Only if this is the first cell of the entry
                    if (convertTimeToMinutes(entry.startTime) <= slotStartMinutes) {
                        timetableHTML += `
                            <td class="subject-cell ${subjectColors[subjectKey]}" colspan="${colspan}">
                                ${entry.subjectCode ? `<div class="subject-code">${entry.subjectCode}</div>` : ''}
                                <div class="subject-name">${entry.subjectName}</div>
                                ${entry.lecturer ? `<div class="lecturer">${entry.lecturer}</div>` : ''}
                                ${entry.location ? `<div class="location">${entry.location}</div>` : ''}
                            </td>
                        `;
                        
                        // Skip the next (colspan-1) cells
                        skipCells = colspan - 1;
                    }
                } else {
                    timetableHTML += `<td></td>`;
                }
            }
            
            timetableHTML += `</tr>`;
        });
        
        timetableHTML += `</table>`;
        timetableContainer.innerHTML = timetableHTML;
    }
    
    // Initialize entries list
    updateEntriesList();
});