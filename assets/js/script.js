document.addEventListener('DOMContentLoaded', function() {
    // Store all entries
    let entries = [];
    let subjectColors = {};
    let colorIndex = 1;
    let pagination;
    
    // DOM elements
    const addEntryBtn = document.getElementById('addEntryBtn');
    const generateBtn = document.getElementById('generateBtn');
    const saveImageBtn = document.getElementById('saveImageBtn');
    const closePopup = document.querySelector('.close');
    const timetablePopup = document.getElementById('timetablePopup');
    const entriesList = document.getElementById('entriesList');
    
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
        
        // Add event listener for the save image button
        saveImageBtn.addEventListener('click', saveAsImage);
    });
    
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
    
    // Generate the timetable HTML
    function generateTimetable() {
        const timetableContainer = document.getElementById('timetableContainer');
        
        // Get custom title and subtitle values
        const customTitle = document.getElementById('timetableTitle').value || 'JADUAL WAKTU KULIAH';
        const customSubtitle = document.getElementById('timetableSubtitle').value || 'FA3.01';
        
        // Create headers for the timetable
        let timetableHTML = `
            <div class="timetable-header">${customTitle}</div>
            <div class="timetable-subheader">${customSubtitle}</div>
            <table class="timetable">
                <tr>
                    <th></th>
                    <th>8:00 - 9:00</th>
                    <th>9:00 - 10:00</th>
                    <th>10:00 - 11:00</th>
                    <th>11:00 - 12:00</th>
                    <th>12:00 - 13:00</th>
                    <th>13:00 - 14:00</th>
                    <th>14:00 - 15:00</th>
                    <th>15:00 - 16:00</th>
                    <th>16:00 - 17:00</th>
                    <th>17:00 - 18:00</th>
                    <th>18:00 - 19:00</th>
                </tr>
        `;
        
        // Days of the week
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        const timeSlots = [
            '8:00', '9:00', '10:00', '11:00', '12:00', 
            '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
        ];
        
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
                    
                    // Calculate how many hours this entry spans
                    const entryStartMinutes = convertTimeToMinutes(entry.startTime);
                    const entryEndMinutes = convertTimeToMinutes(entry.endTime);
                    const hoursDiff = Math.round((entryEndMinutes - entryStartMinutes) / 60);
                    
                    // Only if this is the first cell of the entry
                    if (entry.startTime === slotStartTime) {
                        timetableHTML += `
                            <td class="subject-cell ${subjectColors[subjectKey]}" colspan="${hoursDiff}">
                                ${entry.subjectCode ? `<div class="subject-code">${entry.subjectCode}</div>` : ''}
                                <div class="subject-name">${entry.subjectName}</div>
                                ${entry.lecturer ? `<div class="lecturer">${entry.lecturer}</div>` : ''}
                                ${entry.location ? `<div class="location">${entry.location}</div>` : ''}
                            </td>
                        `;
                        
                        // Skip the next (hoursDiff-1) cells
                        skipCells = hoursDiff - 1;
                    }
                } else {
                    timetableHTML += `<td></td>`;
                }
            }
            
            // Add the last cell if not skipped
            if (skipCells === 0) {
                timetableHTML += `<td></td>`;
            }
            
            timetableHTML += `</tr>`;
        });
        
        timetableHTML += `</table>`;
        timetableContainer.innerHTML = timetableHTML;
    }
    
    // Save the timetable as an image
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
    
    // Initialize entries list
    updateEntriesList();
});