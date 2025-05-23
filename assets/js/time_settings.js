// assets/js/time_settings.js

class TimeSettings {
    constructor() {
        this.timeInterval = 60; // Default to hourly (60 minutes)
        this.startDayTime = '8:00';
        this.endDayTime = '18:00';
        this.use12HourFormat = true;
        
        // Cache DOM elements
        this.intervalRadios = document.querySelectorAll('input[name="timeInterval"]');
        this.startDayTimeSelect = document.getElementById('startDayTime');
        this.endDayTimeSelect = document.getElementById('endDayTime');
        this.use12HourFormatCheckbox = document.getElementById('use12HourFormat');
        this.applySettingsBtn = document.getElementById('applySettingsBtn');
        
        // Initialize
        this.init();
    }
    
    // Initialize the time settings
    init() {
        // Set default values
        this.loadSettings();
        
        // Add event listeners
        this.applySettingsBtn.addEventListener('click', () => this.applySettings());
        
        // Update time dropdowns when interval changes
        this.intervalRadios.forEach(radio => {
            radio.addEventListener('change', () => this.updateTimeOptions());
        });
        
        // Initial population of dropdowns
        this.updateStartEndTimeSelects();
        this.updateFormTimeSelects();
    }
    
    // Load saved settings from localStorage if available
    loadSettings() {
        const savedSettings = localStorage.getItem('timeTableSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.timeInterval = settings.timeInterval || 60;
            this.startDayTime = settings.startDayTime || '8:00';
            this.endDayTime = settings.endDayTime || '18:00';
            this.use12HourFormat = settings.use12HourFormat !== undefined ? settings.use12HourFormat : true;
            
            // Apply to UI
            this.intervalRadios.forEach(radio => {
                radio.checked = radio.value == this.timeInterval;
            });
            this.startDayTimeSelect.value = this.startDayTime;
            this.endDayTimeSelect.value = this.endDayTime;
            this.use12HourFormatCheckbox.checked = this.use12HourFormat;
        }
    }
    
    // Save current settings to localStorage
    saveSettings() {
        const settings = {
            timeInterval: this.timeInterval,
            startDayTime: this.startDayTime,
            endDayTime: this.endDayTime,
            use12HourFormat: this.use12HourFormat
        };
        localStorage.setItem('timeTableSettings', JSON.stringify(settings));
    }
    
    // Apply the settings
    applySettings() {
        // Get values from form
        this.intervalRadios.forEach(radio => {
            if (radio.checked) {
                this.timeInterval = parseInt(radio.value);
            }
        });
        
        this.startDayTime = this.startDayTimeSelect.value;
        this.endDayTime = this.endDayTimeSelect.value;
        this.use12HourFormat = this.use12HourFormatCheckbox.checked;
        
        // Save settings
        this.saveSettings();
        
        // Update dropdowns
        this.updateFormTimeSelects();
        
        // Notify user
        alert('Settings applied successfully!');
        
        // Dispatch an event that other modules can listen for
        document.dispatchEvent(new CustomEvent('timeSettingsChanged', {
            detail: {
                timeInterval: this.timeInterval,
                startDayTime: this.startDayTime,
                endDayTime: this.endDayTime,
                use12HourFormat: this.use12HourFormat
            }
        }));
    }
    
    // Update the start and end time select options based on interval
    updateStartEndTimeSelects() {
        this.updateSelect(this.startDayTimeSelect, '7:00', '12:00');
        this.updateSelect(this.endDayTimeSelect, '15:00', '24:00');
    }
    
    // Update form start and end time selects
    updateFormTimeSelects() {
        const startTimeSelect = document.getElementById('startTime');
        const endTimeSelect = document.getElementById('endTime');
        
        if (startTimeSelect && endTimeSelect) {
            this.updateSelect(startTimeSelect, this.startDayTime, this.endDayTime);
            
            // For end time, include one interval after the end day time
            const endDayTimeMins = this.convertTimeToMinutes(this.endDayTime);
            const extendedEndTime = this.minutesToTimeString(endDayTimeMins + this.timeInterval);
            this.updateSelect(endTimeSelect, this.startDayTime, extendedEndTime);
        }
    }
    
    // Generate time options for select elements
    updateSelect(selectElement, startTime, endTime) {
        if (!selectElement) return;
        
        // Save the current value
        const currentValue = selectElement.value;
        
        // Clear existing options except the first one (if it's a placeholder)
        while (selectElement.options.length > 0) {
            if (selectElement.options[0].value === '' && selectElement.options.length === 1) {
                break;
            }
            selectElement.remove(0);
        }
        
        // Get min and max minutes
        const startMinutes = this.convertTimeToMinutes(startTime);
        const endMinutes = this.convertTimeToMinutes(endTime);
        
        // Add options at specified intervals
        for (let mins = startMinutes; mins <= endMinutes; mins += this.timeInterval) {
            const timeString = this.minutesToTimeString(mins);
            const displayTime = this.use12HourFormat ? this.convertTo12Hour(timeString) : timeString;
            
            const option = document.createElement('option');
            option.value = timeString; // Store 24h format as value
            option.textContent = displayTime; // Display in selected format
            selectElement.appendChild(option);
        }
        
        // Try to restore the previously selected value
        if (currentValue) {
            selectElement.value = currentValue;
            // If the exact value isn't available anymore, select the first option
            if (selectElement.value !== currentValue) {
                selectElement.selectedIndex = 0;
            }
        }
    }
    
    // Update all time options when interval changes
    updateTimeOptions() {
        this.intervalRadios.forEach(radio => {
            if (radio.checked) {
                this.timeInterval = parseInt(radio.value);
            }
        });
        
        this.updateStartEndTimeSelects();
    }
    
    // Helper: Convert time string (HH:MM) to minutes
    convertTimeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    // Helper: Convert minutes to time string (HH:MM)
    minutesToTimeString(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Helper: Convert 24h format to 12h format
    convertTo12Hour(time24h) {
        const [hours, minutes] = time24h.split(':').map(Number);
        let period = hours >= 12 ? 'PM' : 'AM';
        let hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    // Get time slots for timetable generation
    getTimeSlots() {
        const slots = [];
        const startMinutes = this.convertTimeToMinutes(this.startDayTime);
        const endMinutes = this.convertTimeToMinutes(this.endDayTime);
        
        for (let mins = startMinutes; mins <= endMinutes; mins += this.timeInterval) {
            slots.push(this.minutesToTimeString(mins));
        }
        
        // Add one more slot for the end time
        slots.push(this.minutesToTimeString(endMinutes + this.timeInterval));
        
        return slots;
    }
    
    // Format time for display in timetable headers
    formatTimeForDisplay(timeString) {
        return this.use12HourFormat ? this.convertTo12Hour(timeString) : timeString;
    }
    
    // Get time format (12h or 24h)
    getTimeFormat() {
        return this.use12HourFormat ? '12h' : '24h';
    }
}