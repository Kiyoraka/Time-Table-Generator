// Pagination functionality for timetable entries
class EntriesPagination {
    constructor(entriesList, itemsPerPage = 5) {
        this.entriesList = entriesList;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.paginationContainer = null;
        this.allEntries = [];
    }

    // Initialize pagination
    init() {
        // Create pagination container if it doesn't exist
        if (!this.paginationContainer) {
            this.createPaginationContainer();
        }
        
        // Hide pagination if not needed
        this.togglePaginationVisibility();
    }

    // Create pagination container and controls
    createPaginationContainer() {
        // Get the entries list element
        const entriesListContainer = document.querySelector('.entries-list');
        
        // Create pagination container
        this.paginationContainer = document.createElement('div');
        this.paginationContainer.className = 'pagination-controls';
        
        // Add pagination container after entries list
        entriesListContainer.appendChild(this.paginationContainer);
    }

    // Update entries data and refresh pagination
    updateEntries(entries) {
        this.allEntries = entries;
        this.currentPage = 1; // Reset to first page when entries are updated
        this.refreshPagination();
        this.displayEntriesForCurrentPage();
    }

    // Refresh pagination controls
    refreshPagination() {
        if (!this.paginationContainer) return;
        
        // Calculate total pages
        const totalPages = Math.ceil(this.allEntries.length / this.itemsPerPage);
        
        // Clear previous pagination controls
        this.paginationContainer.innerHTML = '';
        
        // Don't show pagination if not needed
        if (totalPages <= 1) {
            this.paginationContainer.style.display = 'none';
            return;
        }
        
        // Show pagination controls
        this.paginationContainer.style.display = 'flex';
        
        // Add "Previous" button
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-btn prev-btn';
        prevButton.innerHTML = '&laquo;';
        prevButton.disabled = this.currentPage === 1;
        prevButton.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        this.paginationContainer.appendChild(prevButton);
        
        // Add page number buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'pagination-btn page-btn';
            if (i === this.currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => this.goToPage(i));
            this.paginationContainer.appendChild(pageButton);
        }
        
        // Add "Next" button
        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-btn next-btn';
        nextButton.innerHTML = '&raquo;';
        nextButton.disabled = this.currentPage === totalPages;
        nextButton.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        this.paginationContainer.appendChild(nextButton);
    }

    // Go to a specific page
    goToPage(pageNumber) {
        const totalPages = Math.ceil(this.allEntries.length / this.itemsPerPage);
        
        // Validate page number
        if (pageNumber < 1 || pageNumber > totalPages) {
            return;
        }
        
        this.currentPage = pageNumber;
        this.refreshPagination();
        this.displayEntriesForCurrentPage();
    }

    // Display entries for the current page
    displayEntriesForCurrentPage() {
        // Clear the current entries list
        this.entriesList.innerHTML = '';
        
        if (this.allEntries.length === 0) {
            this.entriesList.innerHTML = '<li>No entries yet. Add some using the form above.</li>';
            return;
        }
        
        // Calculate start and end indices for current page
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.allEntries.length);
        
        // Get entries for current page
        const currentPageEntries = this.allEntries.slice(startIndex, endIndex);
        
        // Display the entries
        currentPageEntries.forEach((entry, index) => {
            const actualIndex = startIndex + index;
            this.displayEntry(entry, actualIndex);
        });
    }

    // Display a single entry
    displayEntry(entry, index) {
        const li = document.createElement('li');
        li.className = 'entry-item';
        
        const entryDetails = document.createElement('div');
        entryDetails.className = 'entry-details';
        entryDetails.innerHTML = `
            <strong>${this.getDayName(entry.day)}, ${entry.startTime} - ${entry.endTime}</strong>
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
        removeBtn.setAttribute('data-index', index); // Store the actual index for removal
        
        li.appendChild(entryDetails);
        li.appendChild(removeBtn);
        this.entriesList.appendChild(li);
    }

    // Get full day name from abbreviation
    getDayName(abbr) {
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
    
    // Toggle pagination visibility based on number of entries
    togglePaginationVisibility() {
        if (!this.paginationContainer) return;
        
        const totalPages = Math.ceil(this.allEntries.length / this.itemsPerPage);
        this.paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
    }
}