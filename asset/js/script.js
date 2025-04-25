document.addEventListener('DOMContentLoaded', function() {
    // Store all entries
    let entries = [];
    let subjectColors = {};
    let colorIndex = 1;
    
    // DOM elements
    const addEntryBtn = document.getElementById('addEntryBtn');
    const generateBtn = document.getElementById('generateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const closePopup = document.querySelector('.close');
    const timetablePopup = document.getElementById('timetablePopup');
    const entriesList = document.getElementById('entriesList');
    
    // Add entry to the list
    addEntryBtn.addEventListener('click', function() {
        const day = document.getElementById('day').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const subject = document.getElementById('subject').value;
        const lecturer = document.getElementById('lecturer').value;
        const location = document.getElementById('location').value;
        
        // Validate inputs
        if (!day || !startTime || !endTime || !subject) {
            alert('Please fill in all required fields (Day, Start Time, End Time, Subject Code)');
            return;
        }
        
        // Validate that end time is after start time
        if (startTime >= endTime) {
            alert('End time must be after start time');
            return;
        }
        
        // Create entry object
        const entry = {
            day,
            startTime,
            endTime,
            subject,
            lecturer,
            location
        };
        
        // Assign color to subject if not already assigned
        if (!subjectColors[subject]) {
            subjectColors[subject] = `color-${colorIndex}`;
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
                Subject: ${entry.subject}
                ${entry.lecturer ? '<br>Lecturer: ' + entry.lecturer : ''}
                ${entry.location ? '<br>Location: ' + entry.location : ''}
            `;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-entry';
            removeBtn.innerHTML = '×';
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
            'Mo': 'Monday',
            'Tu': 'Tuesday',
            'We': 'Wednesday',
            'Th': 'Thursday',
            'Fr': 'Friday'
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
        timetablePopup.style.display = 'block';
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
        const days = ['Mo', 'Tu', 'We', 'Th', 'Fr'];
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
            
            // Add cells for each time slot
            timeSlots.forEach((startTime, index) => {
                const endTime = timeSlots[index + 1];
                
                // Find entries for this day and time slot
                const entry = entries.find(e => 
                    e.day === day && 
                    e.startTime === startTime && 
                    e.endTime === endTime
                );
                
                if (entry) {
                    timetableHTML += `
                        <td class="subject-cell ${subjectColors[entry.subject]}">
                            <div class="subject-code">${entry.subject}</div>
                            ${entry.lecturer ? `<div class="lecturer">${entry.lecturer}</div>` : ''}
                            ${entry.location ? `<div class="location">${entry.location}</div>` : ''}
                        </td>
                    `;
                } else {
                    timetableHTML += `<td></td>`;
                }
            });
            
            timetableHTML += `</tr>`;
        });
        
        timetableHTML += `</table>`;
        timetableContainer.innerHTML = timetableHTML;
    }
    
    // Save the timetable
    saveBtn.addEventListener('click', function() {
        const dateTime = new Date().toLocaleString().replace(/[/\\:]/g, '-');
        const fileName = `timetable-${dateTime}.html`;
        
        // Get HTML content
        const timetableHTML = document.getElementById('timetableContainer').innerHTML;
        const fullHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Saved Timetable</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .timetable { width: 100%; border-collapse: collapse; }
                    .timetable th, .timetable td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    .timetable th { background-color: #f2f2f2; font-weight: bold; }
                    .day-column { font-weight: bold; background-color: #f2f2f2; width: 50px; }
                    .subject-cell { padding: 5px; border-radius: 4px; }
                    .subject-code { font-weight: bold; color: #0277bd; }
                    .lecturer, .location { font-size: 12px; margin-top: 5px; }
                    .timetable-header { text-align: center; font-size: 24px; margin-bottom: 15px; font-weight: bold; }
                    .timetable-subheader { text-align: center; font-size: 18px; margin-bottom: 20px; color: #555; }
                    
                    /* Colors */
                    .color-1 { background-color: #e1f5fe; }
                    .color-2 { background-color: #e8f5e9; }
                    .color-3 { background-color: #fff8e1; }
                    .color-4 { background-color: #f3e5f5; }
                    .color-5 { background-color: #e0f2f1; }
                    .color-6 { background-color: #ffebee; }
                    .color-7 { background-color: #ede7f6; }
                    .color-8 { background-color: #fbe9e7; }
                </style>
            </head>
            <body>
                ${timetableHTML}
            </body>
            </html>
        `;
        
        // Create download link
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Initialize entries list
    updateEntriesList();
});