# Timetable Generator 📅
A clean, interactive web application for creating and managing academic timetables. This tool allows users to easily generate customizable timetables with multiple classes, save them as images, and organize their schedule efficiently.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Link](#link)
4. [Interface Instructions](#interface-instructions)
5. [Technical Details](#technical-details)
6. [JavaScript Components](#javascript-components)
7. [CSS Structure](#css-structure)
8. [HTML Layout](#html-layout)
9. [Pagination System](#pagination-system)
10. [Using Custom Titles](#custom-titles)
11. [Contributing](#contributing)
12. [License](#license)

## 🎯 Overview
The Timetable Generator is designed to help students, teachers, and administrators create visual timetables quickly and easily. It supports custom subjects, multi-hour classes, and offers a user-friendly interface for managing entries.

### Key Components
- **Entry Management:** Add classes with subject, time, location, and teacher details
- **Visual Timetable:** See your schedule in a clear, color-coded weekly format
- **Image Export:** Save your timetable as a high-quality PNG image
- **Pagination:** Efficiently manage multiple entries with page navigation
- **Custom Titles:** Personalize your timetable with custom headers

## ✨ Features
- Add classes with customizable time slots (supports multi-hour sessions)
- Color-coded subjects for easy visual identification
- Customizable title and subtitle fields
- Pagination system for managing many entries
- High-quality image export with just one click
- Clean and intuitive user interface
- Mobile-responsive design
- Real-time visual feedback

## 🚀 Link

[Link](https://kiyoraka.github.io/Time-Table-Generator/)

## 📱 Interface Instructions
- **Adding Classes:** Fill in the form fields and click "Add Entry"
- **Viewing Entries:** Scroll through your entries or use pagination
- **Removing Entries:** Click the × button next to any entry
- **Generating Timetable:** Click the "Generate Timetable" button
- **Saving:** Click "Save" in the popup to download as an image
- **Custom Titles:** Modify the title and subtitle fields before generating

## 🛠️ Technical Requirements
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- JavaScript enabled
- Internet connection (for loading the html2canvas library)
- Basic understanding of timetable structures

## 💻 JavaScript Components
The application consists of three main JavaScript files:
- **script.js:** Core functionality for entry management and timetable generation
- **pagination.js:** Handles pagination for the entries list
- **html2canvas:** External library for converting HTML to an image

### Key Functions
- Entry validation and management
- Time slot calculations and display
- Multi-hour class spanning
- Color assignment for subjects
- Image generation and download

## 🎨 CSS Structure
The styling is organized into several key sections:
- Form styling for the entry inputs
- Timetable grid layout and cell styling
- Entry list display and management
- Pagination controls
- Popup design and animations
- Responsive adjustments for different screen sizes

## 📝 HTML Layout
The application has a simple but effective structure:
1. Title section
2. Form container for timetable settings and entry inputs
3. Entries list with pagination
4. Generate button
5. Popup modal for displaying and saving the timetable

## 📄 Pagination System
The pagination system activates automatically when you have more than 5 entries:
- Displays entries in groups of 5 per page
- Provides navigation buttons (previous, page numbers, next)
- Highlights the current page
- Updates automatically when entries are added or removed

## 🔧 Using Custom Titles
To personalize your timetable:
1. Modify the "Timetable Title" field (default: JADUAL WAKTU KULIAH)
2. Change the "Timetable Subtitle" field (default: FA3.01)
3. Generate your timetable to see the changes applied

## 🤝 Contributing
Contributions to improve this timetable generator are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License
This project is open source

## ✨ Acknowledgments
- Built with vanilla JavaScript, HTML5, and CSS3
- Uses html2canvas for image generation
- Designed with a focus on usability and clean interface
- Responsive design for use on various devices

## 📞 Support
For questions or support:
- Create an issue in the repository


---
Happy scheduling! 🎉 Create beautiful, organized timetables for your classes with just a few clicks!