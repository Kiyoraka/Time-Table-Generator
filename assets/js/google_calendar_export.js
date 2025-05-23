/**
 * Google Calendar Export functionality for Time Table Generator
 * Exports timetable entries to iCalendar (.ics) format for import into Google Calendar
 */

class GoogleCalendarExporter {
    constructor() {
        // No external libraries needed - we'll generate the iCalendar format directly
    }
    
    // Main export function
    exportToGoogleCalendar(timetableContainer) {
        return new Promise((resolve, reject) => {
            try {
                // Get timetable data
                const timetableData = this.extractTimetableData(timetableContainer);
                
                // Generate iCalendar content
                const icsContent = this.generateICalendar(timetableData);
                
                // Create and download the .ics file
                this.downloadICSFile(icsContent);
                
                resolve('Calendar export successful');
            } catch (error) {
                console.error('Error exporting to Google Calendar:', error);
                reject('Failed to export to Google Calendar. Please try again.');
            }
        });
    }
    
    // Extract data from the timetable
    extractTimetableData(timetableContainer) {
        const data = [];
        const title = document.querySelector('.timetable-header').textContent || 'Timetable';
        const subtitle = document.querySelector('.timetable-subheader').textContent || '';
        
        // Get the timetable element
        const timetable = timetableContainer.querySelector('.timetable');
        if (!timetable) {
            throw new Error('Timetable not found');
        }
        
        // Get the rows from the timetable
        const rows = timetable.rows;
        
        // Extract the time slots from the header row
        const timeSlots = [];
        const headerCells = rows[0].cells;
        for (let i = 1; i < headerCells.length; i++) { // Skip the first cell (empty corner)
            const timeText = headerCells[i].textContent.trim();
            if (timeText) {
                timeSlots.push(this.parseTimeRange(timeText));
            }
        }
        
        // Extract entries from each row
        for (let i = 1; i < rows.length; i++) { // Skip the header row
            const row = rows[i];
            const dayCell = row.cells[0];
            const day = dayCell.textContent.trim();
            
            // Process each cell in the row
            let columnIndex = 1; // Start from the first time slot
            while (columnIndex < row.cells.length) {
                const cell = row.cells[columnIndex];
                const colspan = parseInt(cell.getAttribute('colspan')) || 1;
                
                // Check if the cell contains a subject
                if (cell.classList.contains('subject-cell') || cell.querySelector('.subject-cell')) {
                    const targetCell = cell.classList.contains('subject-cell') ? cell : cell.querySelector('.subject-cell');
                    
                    // Extract subject details
                    const subjectCode = targetCell.querySelector('.subject-code')?.textContent.trim() || '';
                    const subjectName = targetCell.querySelector('.subject-name')?.textContent.trim() || '';
                    const lecturer = targetCell.querySelector('.lecturer')?.textContent.trim() || '';
                    const location = targetCell.querySelector('.location')?.textContent.trim() || '';
                    
                    // Get the time range for this entry
                    const startTimeSlot = timeSlots[columnIndex - 1];
                    const endTimeSlot = timeSlots[columnIndex + colspan - 1];
                    
                    if (startTimeSlot && endTimeSlot) {
                        // Create entry object
                        const entry = {
                            day,
                            startTime: startTimeSlot.start,
                            endTime: endTimeSlot.end,
                            subjectCode,
                            subjectName,
                            lecturer,
                            location,
                            title: subjectCode ? `${subjectCode} - ${subjectName}` : subjectName
                        };
                        
                        data.push(entry);
                    }
                }
                
                // Move to the next column position
                columnIndex += colspan;
            }
        }
        
        return {
            title,
            subtitle,
            entries: data
        };
    }
    
    // Parse time range string (e.g., "9:00 AM - 10:00 AM")
    parseTimeRange(timeRange) {
        const parts = timeRange.split('-').map(part => part.trim());
        if (parts.length === 2) {
            return {
                start: parts[0],
                end: parts[1]
            };
        }
        return null;
    }
    
    // Generate iCalendar format content
    generateICalendar(timetableData) {
        const { title, subtitle, entries } = timetableData;
        
        // iCalendar begin
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Time Table Generator//Google Calendar Export//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:' + title,
            'X-WR-CALDESC:' + subtitle
        ].join('\r\n') + '\r\n';
        
        // Current timestamp for UID generation
        const timestamp = new Date().getTime();
        
        // Get the next occurrence of each day of the week
        const nextDays = this.getNextDaysOfWeek();
        
        // Add each entry as a recurring event
        entries.forEach((entry, index) => {
            // Convert day abbreviation to day number (0 = Sunday, 1 = Monday, etc.)
            const dayNumber = this.getDayNumber(entry.day);
            
            // Get the next occurrence of this day
            const eventDate = nextDays[dayNumber];
            
            // Parse start and end times
            const startDateTime = this.combineDateTime(eventDate, entry.startTime);
            const endDateTime = this.combineDateTime(eventDate, entry.endTime);
            
            // Create event
            icsContent += 'BEGIN:VEVENT\r\n';
            icsContent += 'UID:' + timestamp + '-' + index + '@timetablegenerator\r\n';
            icsContent += 'DTSTAMP:' + this.formatDateTime(new Date()) + '\r\n';
            icsContent += 'DTSTART:' + this.formatDateTime(startDateTime) + '\r\n';
            icsContent += 'DTEND:' + this.formatDateTime(endDateTime) + '\r\n';
            icsContent += 'SUMMARY:' + this.escapeICSText(entry.title) + '\r\n';
            
            if (entry.location) {
                icsContent += 'LOCATION:' + this.escapeICSText(entry.location) + '\r\n';
            }
            
            // Add description with all available details
            let description = '';
            if (entry.subjectCode) description += 'Code: ' + entry.subjectCode + '\\n';
            if (entry.subjectName) description += 'Subject: ' + entry.subjectName + '\\n';
            if (entry.lecturer) description += 'Lecturer: ' + entry.lecturer + '\\n';
            
            if (description) {
                icsContent += 'DESCRIPTION:' + this.escapeICSText(description) + '\r\n';
            }
            
            // Make it a weekly recurring event
            icsContent += 'RRULE:FREQ=WEEKLY\r\n';
            
            icsContent += 'END:VEVENT\r\n';
        });
        
        // iCalendar end
        icsContent += 'END:VCALENDAR';
        
        return icsContent;
    }
    
    // Format date for iCalendar (YYYYMMDDTHHmmssZ format)
    formatDateTime(date) {
        // Ensure we're working with a Date object
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        return date.getUTCFullYear() +
               this.pad(date.getUTCMonth() + 1) +
               this.pad(date.getUTCDate()) + 'T' +
               this.pad(date.getUTCHours()) +
               this.pad(date.getUTCMinutes()) +
               this.pad(date.getUTCSeconds()) + 'Z';
    }
    
    // Pad a number to 2 digits
    pad(num) {
        return num.toString().padStart(2, '0');
    }
    
    // Escape special characters in iCalendar text
    escapeICSText(text) {
        if (!text) return '';
        return text
            .replace(/[\\;,]/g, (match) => '\\' + match)
            .replace(/\n/g, '\\n');
    }
    
    // Get day number from day abbreviation
    getDayNumber(dayAbbr) {
        const dayMap = {
            'Su': 0, // Sunday
            'Mo': 1, // Monday
            'Tu': 2, // Tuesday
            'We': 3, // Wednesday
            'Th': 4, // Thursday
            'Fr': 5, // Friday
            'Sa': 6  // Saturday
        };
        
        return dayMap[dayAbbr] !== undefined ? dayMap[dayAbbr] : 0;
    }
    
    // Get the next occurrence of each day of the week
    getNextDaysOfWeek() {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const result = {};
        
        // For each day of the week
        for (let day = 0; day < 7; day++) {
            // Calculate days to add
            const daysToAdd = (day - currentDay + 7) % 7;
            
            // Create a new date for this day
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + daysToAdd);
            
            // Reset time to beginning of day
            nextDate.setHours(0, 0, 0, 0);
            
            result[day] = nextDate;
        }
        
        return result;
    }
    
    // Combine date and time into a DateTime object
    combineDateTime(date, timeStr) {
        // Create a new date object
        const result = new Date(date);
        
        // Parse the time string
        let hours = 0;
        let minutes = 0;
        let isPM = false;
        
        // Check if time is in 12-hour format
        if (timeStr.includes('AM') || timeStr.includes('PM')) {
            isPM = timeStr.includes('PM');
            timeStr = timeStr.replace(/(AM|PM)/, '').trim();
        }
        
        // Extract hours and minutes
        const timeParts = timeStr.split(':');
        hours = parseInt(timeParts[0]);
        if (timeParts.length > 1) {
            minutes = parseInt(timeParts[1]);
        }
        
        // Adjust for PM in 12-hour format
        if (isPM && hours < 12) {
            hours += 12;
        }
        // Adjust for 12 AM
        if (!isPM && hours === 12) {
            hours = 0;
        }
        
        // Set time components
        result.setHours(hours, minutes, 0, 0);
        
        return result;
    }
    
    // Download the generated ICS file
    downloadICSFile(icsContent) {
        // Create a blob with the ICS content
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        
        // Create a temporary URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = 'timetable.ics';
        
        // Add the link to the document
        document.body.appendChild(link);
        
        // Trigger the download
        link.click();
        
        // Clean up
        setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        }, 100);
    }
}