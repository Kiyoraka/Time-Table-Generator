document.addEventListener('DOMContentLoaded', function() {
    // Store all entries
    let entries = [];
    let subjectColors = {};
    let colorIndex = 1;
    
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
        entriesList.innerHTML = '';
        
        if (entries.length === 0) {
            entriesList.innerHTML = '<li>No entries yet. Add some using the form above.</li>';
            return;
        }
        
        entries.forEach((entry, index) => {
            const li = document.createElement('li');
            li.className = 'entry-item';
            
            const entryDetails = document.createElement('div');
            entryDetails.className = 'entry-details';
            entryDetails.innerHTML = `
                <strong>${getDayName(entry.day)}, ${entry.startTime} - ${entry.endTime}</strong>
                <br>
                ${entry.subjectCode ? 'Code: ' + entry.subjectCode + '<br>' : ''}
                Subject: ${entry.subjectName}
                ${entry.lecturer ? '<br>Lecturer: ' + entry.lecturer : ''}
                ${entry.location ? '<br>Location: ' + entry.location : ''}
            `;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-entry';
            removeBtn.innerHTML = '×';
            removeBtn.setAttribute('title', 'Remove entry');
            removeBtn.addEventListener('click', function() {
                entries.splice(index, 1);
                updateEntriesList();
            });
            
            li.appendChild(entryDetails);
            li.appendChild(removeBtn);
            entriesList.appendChild(li);
        });
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
    
    // Create headers for the timetable
    let timetableHTML = `
        <div class="timetable-header">JADUAL WAKTU KULIAH</div>
        <div class="timetable-subheader">FA3.01</div>
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
    
    // Helper function to convert time to minutes for comparison
    function convertTimeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    // Add rows for each day
    days.forEach(day => {
        timetableHTML += `
            <tr>
                <td class="day-column">${day}</td>
        `;
        
        // Add cells for each time slot
        timeSlots.forEach((slotStartTime, index) => {
            if (index < timeSlots.length - 1) {
                const slotEndTime = timeSlots[index + 1];
                const slotStartMinutes = convertTimeToMinutes(slotStartTime);
                const slotEndMinutes = convertTimeToMinutes(slotEndTime);
                
                // Check if any entry overlaps with this time slot
                const entry = entries.find(e => {
                    if (e.day !== day) return false;
                    
                    const entryStartMinutes = convertTimeToMinutes(e.startTime);
                    const entryEndMinutes = convertTimeToMinutes(e.endTime);
                    
                    // Check if this slot is part of the entry's time range
                    return entryStartMinutes <= slotStartMinutes && entryEndMinutes >= slotEndMinutes;
                });
                
                if (entry) {
                    const subjectKey = entry.subjectCode || entry.subjectName;
                    
                    // Check if this is the first cell of the entry to show details
                    const isFirstCell = entry.startTime === slotStartTime;
                    
                    // Calculate how many cells this entry should span
                    const entryStartMinutes = convertTimeToMinutes(entry.startTime);
                    const entryEndMinutes = convertTimeToMinutes(entry.endTime);
                    const spanCount = Math.ceil((entryEndMinutes - entryStartMinutes) / 60);
                    
                    if (isFirstCell) {
                        // Only show content in the first cell of a multi-hour entry
                        timetableHTML += `
                            <td class="subject-cell ${subjectColors[subjectKey]}" colspan="${spanCount}">
                                ${entry.subjectCode ? `<div class="subject-code">${entry.subjectCode}</div>` : ''}
                                <div class="subject-name">${entry.subjectName}</div>
                                ${entry.lecturer ? `<div class="lecturer">${entry.lecturer}</div>` : ''}
                                ${entry.location ? `<div class="location">${entry.location}</div>` : ''}
                            </td>
                        `;
                        
                        // Skip the next (spanCount-1) cells since we used colspan
                        index += (spanCount - 1);
                    }
                } else {
                    timetableHTML += `<td></td>`;
                }
            } else {
                // Last column
                timetableHTML += `<td></td>`;
            }
        });
        
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