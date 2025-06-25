// --- 1. DOM Element References ---
const navHomeBtn = document.getElementById('navHomeBtn');
const navCalendarBtn = document.getElementById('navCalendarBtn');
const exportDataBtn = document.getElementById('exportDataBtn');
const importFileInput = document.getElementById('importFileInput'); // NEW
const importDataBtn = document.getElementById('importDataBtn');     // NEW

const homePage = document.getElementById('home-page');
const dailyRecordPage = document.getElementById('daily-record-page');
const calendarPage = document.getElementById('calendar-page');

const startDailyRecordBtn = document.getElementById('startDailyRecordBtn');

// Daily Record Page elements
const collegeOpenMessageBox = document.getElementById('college-open-message-box');
const collegeOpenYesBtn = document.getElementById('collegeOpenYesBtn');
const collegeOpenNoBtn = document.getElementById('collegeOpenNoBtn');

const classSelectionBox = document.getElementById('class-selection-box');
const classCheckboxes = document.querySelectorAll('.class-checkbox');
const selectAllClassesBtn = document.getElementById('selectAllClassesBtn');
const submitAttendedClassesBtn = document.getElementById('submitAttendedClassesBtn');

const suspendedQuestionMessageBox = document.getElementById('suspended-question-message-box');
const suspendedYesBtn = document.getElementById('suspendedYesBtn');
const suspendedNoBtn = document.getElementById('suspendedNoBtn');

const suspendedSelectionBox = document.getElementById('suspended-selection-box');
const suspendedClassCheckboxes = document.querySelectorAll('.suspended-class-checkbox');
const submitSuspendedClassesBtn = document.getElementById('submitSuspendedClassesBtn');

const dailyRecordConfirmation = document.getElementById('daily-record-confirmation');
const returnHomeFromDailyRecordBtn = document.getElementById('returnHomeFromDailyRecordBtn');

// Dashboard elements
const totalCollegeDaysSpan = document.getElementById('totalCollegeDays');
const totalClassesPossibleSpan = document.getElementById('totalClassesPossible');
const classesAttendedCountSpan = document.getElementById('classesAttendedCount');
const attendancePercentageSpan = document.getElementById('attendancePercentage');
const percentageStatusP = document.getElementById('percentageStatus');
const dailyRecordStatusP = document.getElementById('dailyRecordStatus');

// Calendar elements
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const currentMonthYearHeader = document.getElementById('currentMonthYear');
const calendarGrid = document.getElementById('calendar-grid');
const calendarDayDetails = document.getElementById('calendar-day-details');
const selectedDayDateSpan = document.getElementById('selectedDayDate');
const detailStatusSpan = document.getElementById('detailStatus');
const detailAttendedSpan = document.getElementById('detailAttended');
const detailSuspendedSpan = document.getElementById('detailSuspended');

// Alter Record Modal elements
const alterRecordModal = document.getElementById('alterRecordModal');
const closeModalBtn = alterRecordModal.querySelector('.close-modal-btn');
const alterationView = document.getElementById('alterationView');
const passwordView = document.getElementById('passwordView');
const modalDateDisplay = document.getElementById('modalDateDisplay');

const alterClassCheckboxes = document.querySelectorAll('.alter-class-checkbox');
const alterSuspendedCheckboxes = document.querySelectorAll('.alter-suspended-checkbox');
const confirmAlterationBtn = document.getElementById('confirmAlterationBtn');
const cancelAlterationBtn = document.getElementById('cancelAlterationBtn');

const alterPasswordInput = document.getElementById('alterPasswordInput');
const passwordWarning = document.getElementById('passwordWarning');
const submitAlterPasswordBtn = document.getElementById('submitAlterPasswordBtn');
const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');

// For displaying current date on home page
const currentDateDisplay = document.getElementById('currentDateDisplay');


// --- 2. Global Variables & Data Storage ---
let attendanceRecords = []; // Stores objects like { date: 'YYYY-MM-DD', collegeOpen: true, classesAttended: ['class1', 'class3'], classesSuspended: [], totalClassesDay: 5, classesAttendedDay: 2, status: 'recorded' }
const CLASSES_PER_DAY = 5;
const ATTENDANCE_THRESHOLD = 0.75; // 75%
const FINE_THRESHOLD = 0.70;    // 70%
const CORRECT_PASSWORD = 'Rsn07';

let currentYear, currentMonth; // For calendar
let currentDateToAlter = ''; // Stores the date of the record currently being altered
let originalRecordData = null; // Stores a copy of the record before alteration

// Object to store current day's record before saving
let todayRecord = {
    date: '',
    collegeOpen: false,
    classesAttended: [],
    classesSuspended: [],
    totalClassesDay: 0,
    classesAttendedDay: 0,
    status: 'pending' // 'pending', 'recorded', 'holiday', 'no_classes_attended'
};

// --- 3. Utility Functions ---
function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function showPage(pageToShow) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active-page');
        page.classList.add('hidden-page');
    });
    pageToShow.classList.remove('hidden-page');
    pageToShow.classList.add('active-page');
}

function showSection(sectionToShow, parentContainer = null) {
    // Hide all sections in the current daily record flow
    const sections = [
        collegeOpenMessageBox,
        classSelectionBox,
        suspendedQuestionMessageBox,
        suspendedSelectionBox,
        dailyRecordConfirmation
    ];
    sections.forEach(section => {
        section.classList.remove('active-box'); // for message boxes
        section.classList.remove('active-section'); // for form sections
        section.classList.add('hidden-section');
    });

    if (sectionToShow) { // Only show if a section is provided
        sectionToShow.classList.remove('hidden-section');
        // Determine which class to add based on the element type
        if (sectionToShow.classList.contains('message-box')) {
            sectionToShow.classList.add('active-box');
        } else {
            sectionToShow.classList.add('active-section');
        }
    }
}

// Function to display the current date on the home page
function updateCurrentDateDisplay() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateDisplay.textContent = `Today is ${today.toLocaleDateString('en-US', options)}`;
}

// --- Notification System Functions ---

// Function to request notification permission from the user
function requestNotificationPermission() {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification.");
        return;
    }

    // Check if permission is already granted or denied
    if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notification permission granted.");
                scheduleDailyAttendanceReminder(); // Schedule reminder if permission granted
            } else {
                console.warn("Notification permission denied by the user.");
                alert("Notification permission was denied. You won't receive daily attendance reminders.");
            }
        });
    } else if (Notification.permission === "granted") {
        console.log("Notification permission already granted.");
        scheduleDailyAttendanceReminder(); // Schedule reminder if already granted
    } else {
        console.warn("Notification permission blocked. Please enable it in browser settings.");
        alert("Notification permission is blocked. Please enable it in your browser settings to receive daily attendance reminders.");
    }
}

// Function to display the actual notification
function displayAttendanceNotification() {
    if (Notification.permission === "granted") {
        // You can customize the notification title and body
        new Notification("Attendance Tracker", {
            body: "It's 9:00 PM! Time to record your daily attendance.",
            // icon: "path/to/your/app/icon.png" // Optional: path to an icon for the notification
        });
        console.log("Daily attendance reminder notification displayed.");
    }
}

// Function to schedule the daily notification
function scheduleDailyAttendanceReminder() {
    const now = new Date();
    // Set notification time to 21:00 (9 PM) today
    let notificationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0);

    // If current time is already past 9 PM today, schedule for 9 PM tomorrow
    if (now.getTime() > notificationTime.getTime()) {
        notificationTime.setDate(notificationTime.getDate() + 1);
        console.log("Current time is past 9 PM. Scheduling reminder for tomorrow.");
    }

    const timeUntilNotification = notificationTime.getTime() - now.getTime();

    // Get the formatted date string for today to check localStorage
    const todayDateString = getFormattedDate(new Date());
    const lastNotifiedDate = localStorage.getItem('attendance_notification_last_sent');

    // Only schedule if there's time left and notification hasn't been sent for today
    if (timeUntilNotification > 0 && lastNotifiedDate !== todayDateString) {
        console.log(`Scheduling daily attendance reminder for: ${notificationTime.toLocaleString()}`);
        setTimeout(() => {
            displayAttendanceNotification();
            // Mark today's notification as sent in localStorage
            localStorage.setItem('attendance_notification_last_sent', todayDateString);
        }, timeUntilNotification);
    } else if (lastNotifiedDate === todayDateString) {
        console.log("Daily attendance reminder already sent or scheduled for today.");
    } else {
        console.log("No daily reminder scheduled for today (it's past 9 PM and not sent). Will try again tomorrow if page is loaded.");
    }
}


// --- 4. Attendance Data Management ---
function loadAttendanceData() {
    const data = localStorage.getItem('attendanceRecords');
    if (data) {
        attendanceRecords = JSON.parse(data);
    }
}

function saveAttendanceData() {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    updateDashboard(); // Update dashboard every time data is saved
    generateCalendar(currentYear, currentMonth); // Refresh calendar
}

function getRecordForDate(date) {
    return attendanceRecords.find(record => record.date === date);
}

// --- Export Data Function ---
function exportData() {
    const data = localStorage.getItem('attendanceRecords');
    if (!data || attendanceRecords.length === 0) {
        alert("No attendance data to export yet!");
        return;
    }

    // Convert array of objects to CSV string
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = ["Date", "College Open", "Classes Attended", "Classes Suspended", "Total Classes Day", "Classes Attended Day", "Status"];
    csvContent += headers.join(",") + "\r\n"; // Add headers

    attendanceRecords.forEach(record => {
        const row = [
            record.date,
            record.collegeOpen ? "Yes" : "No",
            record.classesAttended.join(";"), // Join array with semicolon for CSV
            record.classesSuspended.join(";"),
            record.totalClassesDay,
            record.classesAttendedDay,
            record.status
        ];
        // Enclose values with commas in quotes to prevent splitting
        const escapedRow = row.map(item => {
            if (typeof item === 'string' && item.includes(',')) {
                return `"${item.replace(/"/g, '""')}"`; // Handle double quotes inside data
            }
            return item;
        });
        csvContent += escapedRow.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_data.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link); // Clean up
    alert("Attendance data exported as attendance_data.csv!");
}

// --- NEW: Import Data Functions ---
function importData(event) {
    const file = event.target.files[0];
    if (!file) {
        // User clicked cancel in the file dialog
        return;
    }

    // Check file type if necessary, though accept=".csv" helps
    if (file.type && file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert("Please select a valid CSV file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const csvContent = e.target.result;
        try {
            const importedRecords = parseCSVToAttendanceRecords(csvContent);
            if (importedRecords.length === 0) {
                alert("The imported CSV file contains no valid attendance records.");
                return;
            }

            if (confirm("Importing new data will REPLACE all existing attendance records. Do you want to proceed?")) {
                attendanceRecords = importedRecords;
                saveAttendanceData(); // Save the new data and update dashboard/calendar
                alert("Attendance data imported successfully!");
            } else {
                alert("Import cancelled.");
            }
        } catch (error) {
            console.error("Error importing data:", error);
            alert(`Error importing data: ${error.message}. Please ensure it's a valid CSV file in the correct format (exported from this app).`);
        } finally {
            // Reset the file input value to allow selecting the same file again if needed
            event.target.value = '';
        }
    };
    reader.onerror = function(e) {
        console.error("FileReader error:", e);
        alert("Failed to read file. Please try again.");
    };
    reader.readAsText(file);
}

function parseCSVToAttendanceRecords(csvString) {
    const lines = csvString.split('\n').map(line => line.trim()).filter(line => line !== ''); // Split by newline, trim, filter empty lines

    if (lines.length < 2) {
        throw new Error("CSV file is empty or too short. Expected headers + data.");
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, '')); // Trim and remove potential quotes
    const expectedHeaders = ["Date", "College Open", "Classes Attended", "Classes Suspended", "Total Classes Day", "Classes Attended Day", "Status"];

    // Robust header validation
    if (headers.length !== expectedHeaders.length || !expectedHeaders.every((val, i) => val === headers[i])) {
        console.error("CSV Headers found:", headers);
        console.error("Expected Headers:", expectedHeaders);
        throw new Error("CSV headers do not match the expected format. Please use a file exported from this app.");
    }

    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]); // Use helper for robust CSV parsing
        
        if (values.length !== expectedHeaders.length) {
            console.warn(`Skipping malformed row ${i+1} (column count mismatch): ${lines[i]}`);
            continue;
        }

        const record = {
            date: values[0],
            collegeOpen: values[1].toLowerCase() === 'yes',
            classesAttended: values[2].split(';').filter(c => c !== ''),
            classesSuspended: values[3].split(';').filter(c => c !== ''),
            totalClassesDay: parseInt(values[4], 10),
            classesAttendedDay: parseInt(values[5], 10),
            status: values[6]
        };

        // Basic validation for parsed numbers and date format
        if (isNaN(record.totalClassesDay) || isNaN(record.classesAttendedDay) || !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
             console.warn(`Skipping row ${i+1} due to invalid numeric data or date format: ${lines[i]}`);
             continue;
        }

        records.push(record);
    }
    return records;
}

// Helper function to robustly parse a CSV line, handling commas within quoted fields
function parseCSVLine(line) {
    const result = [];
    let inQuote = false;
    let currentField = '';
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuote && i + 1 < line.length && line[i+1] === '"') {
                // Escaped double quote "" inside a quoted field
                currentField += '"';
                i++; // Skip the next quote
            } else {
                inQuote = !inQuote;
            }
        } else if (char === ',' && !inQuote) {
            result.push(currentField.trim());
            currentField = '';
        } else {
            currentField += char;
        }
    }
    result.push(currentField.trim()); // Add the last field
    return result.map(field => field.replace(/^"|"$/g, '')); // Remove outer quotes if any
}


// --- 5. Home Page Logic & Dashboard ---
function updateDashboard() {
    let totalCollegeDays = 0; // Days where college was open (not holiday)
    let totalClassesPossible = 0; // Total classes that actually occurred (5 - suspended for recorded days)
    let classesAttended = 0;

    attendanceRecords.forEach(record => {
        if (record.collegeOpen && record.status === 'recorded') {
            totalCollegeDays++;
            totalClassesPossible += record.totalClassesDay; // Use adjusted totalClassesDay
            classesAttended += record.classesAttendedDay;
        } else if (record.status === 'holiday') {
            // Holidays don't count towards totalCollegeDays or classes
            // but we still record them in the calendar.
        }
    });

    const percentage = totalClassesPossible > 0 ? (classesAttended / totalClassesPossible) * 100 : 0;

    totalCollegeDaysSpan.textContent = totalCollegeDays;
    totalClassesPossibleSpan.textContent = totalClassesPossible;
    classesAttendedCountSpan.textContent = classesAttended;
    attendancePercentageSpan.textContent = `${percentage.toFixed(2)}%`;

    percentageStatusP.style.backgroundColor = ''; // Reset background
    percentageStatusP.style.color = ''; // Reset color

    if (percentage >= ATTENDANCE_THRESHOLD * 100) {
        percentageStatusP.textContent = "Great! You're above 75% attendance.";
        percentageStatusP.style.backgroundColor = '#d4edda'; // Light green
        percentageStatusP.style.color = '#155724'; // Dark green
    } else if (percentage >= FINE_THRESHOLD * 100 && percentage < ATTENDANCE_THRESHOLD * 100) {
        percentageStatusP.textContent = "Warning! Your attendance is between 70-74%. Fine applicable.";
        percentageStatusP.style.backgroundColor = '#fff3cd'; // Light yellow
        percentageStatusP.style.color = '#856404'; // Dark yellow
    } else {
        percentageStatusP.textContent = "Critical! Your attendance is below 70%. Cannot write exams.";
        percentageStatusP.style.backgroundColor = '#f8d7da'; // Light red
        percentageStatusP.style.color = '#721c24'; // Dark red
    }

    const today = getFormattedDate(new Date());
    const recordToday = getRecordForDate(today);

    if (recordToday && recordToday.status === 'recorded') {
        dailyRecordStatusP.textContent = "You've already submitted today's attendance.";
        dailyRecordStatusP.style.color = '#007bff';
        startDailyRecordBtn.disabled = true;
        startDailyRecordBtn.textContent = 'Attendance Recorded';
    } else if (recordToday && recordToday.status === 'holiday') {
        dailyRecordStatusP.textContent = "Today was marked as a holiday.";
        dailyRecordStatusP.style.color = '#6c757d';
        startDailyRecordBtn.disabled = true;
        startDailyRecordBtn.textContent = 'Holiday Marked';
    }
    else {
        dailyRecordStatusP.textContent = ""; // Clear previous message
        dailyRecordStatusP.style.color = '';
        startDailyRecordBtn.disabled = false;
        startDailyRecordBtn.textContent = 'Start Daily Record';
    }
}

// --- 6. Daily Record Page Logic ---

function resetDailyRecordForm() {
    // Reset all checkboxes
    classCheckboxes.forEach(checkbox => checkbox.checked = false);
    suspendedClassCheckboxes.forEach(checkbox => checkbox.checked = false);

    // Reset todayRecord object
    todayRecord = {
        date: '',
        collegeOpen: false,
        classesAttended: [],
        classesSuspended: [],
        totalClassesDay: 0,
        classesAttendedDay: 0,
        status: 'pending'
    };
}

startDailyRecordBtn.addEventListener('click', () => {
    const today = getFormattedDate(new Date());
    const existingRecord = getRecordForDate(today);

    if (existingRecord && (existingRecord.status === 'recorded' || existingRecord.status === 'holiday')) {
        alert("You have already recorded attendance for today!");
        showPage(homePage); // Go back to home if already recorded
        return;
    }

    resetDailyRecordForm(); // Clear previous data
    todayRecord.date = today;
    showPage(dailyRecordPage);
    showSection(collegeOpenMessageBox);
});

collegeOpenYesBtn.addEventListener('click', () => {
    todayRecord.collegeOpen = true;
    showSection(classSelectionBox); // Move to class attendance selection
});

collegeOpenNoBtn.addEventListener('click', () => {
    todayRecord.collegeOpen = false;
    todayRecord.totalClassesDay = 0; // No classes possible if college is not open
    todayRecord.classesAttendedDay = 0;
    todayRecord.classesAttended = [];
    todayRecord.classesSuspended = [];
    todayRecord.status = 'holiday'; // Mark as holiday

    // Add or update the record for today (in case user re-tries for same day)
    const existingIndex = attendanceRecords.findIndex(record => record.date === todayRecord.date);
    if (existingIndex > -1) {
        attendanceRecords[existingIndex] = todayRecord;
    } else {
        attendanceRecords.push(todayRecord);
    }
    saveAttendanceData(); // Save and update dashboard/calendar

    alert("Today marked as a holiday/college closed.");
    showPage(homePage); // Return to home page
});

selectAllClassesBtn.addEventListener('click', () => {
    classCheckboxes.forEach(checkbox => checkbox.checked = true);
});

submitAttendedClassesBtn.addEventListener('click', () => {
    todayRecord.classesAttended = [];
    classCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            todayRecord.classesAttended.push(checkbox.value);
        }
    });
    todayRecord.classesAttendedDay = todayRecord.classesAttended.length;
    
    // Total classes for the day (before suspensions are considered)
    todayRecord.totalClassesDay = CLASSES_PER_DAY; // Temporarily set to full capacity

    // Move to suspended classes question
    showSection(suspendedQuestionMessageBox);
});

suspendedYesBtn.addEventListener('click', () => {
    showSection(suspendedSelectionBox); // Show suspended class selection
});

suspendedNoBtn.addEventListener('click', () => {
    todayRecord.classesSuspended = []; // No classes suspended
    finalizeDailyRecord();
});

submitSuspendedClassesBtn.addEventListener('click', () => {
    todayRecord.classesSuspended = [];
    suspendedClassCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            todayRecord.classesSuspended.push(checkbox.value);
        }
    });
    finalizeDailyRecord();
});

function finalizeDailyRecord() {
    // Adjust totalClassesDay based on suspended classes for this specific day
    // Only count classes if college was open. If it was holiday, totalClassesDay is 0.
    if (todayRecord.collegeOpen) {
        todayRecord.totalClassesDay = CLASSES_PER_DAY - todayRecord.classesSuspended.length;
    } else {
        todayRecord.totalClassesDay = 0;
    }
    
    todayRecord.status = 'recorded'; // Mark as recorded

    // Add or update the record for today
    const existingIndex = attendanceRecords.findIndex(record => record.date === todayRecord.date);
    if (existingIndex > -1) {
        attendanceRecords[existingIndex] = todayRecord;
    } else {
        attendanceRecords.push(todayRecord);
    }
    
    saveAttendanceData(); // Save to local storage and update dashboard/calendar

    showSection(dailyRecordConfirmation); // Show confirmation
}

returnHomeFromDailyRecordBtn.addEventListener('click', () => {
    showPage(homePage);
    resetDailyRecordForm(); // Reset form for next day
});


// --- 7. Calendar Page Logic ---
function generateCalendar(year, month) {
    currentYear = year;
    currentMonth = month; // Update global currentMonth
    calendarGrid.innerHTML = ''; // Clear previous grid
    calendarDayDetails.classList.add('hidden-details'); // Hide details when regenerating calendar

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayIndex = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.

    currentMonthYearHeader.textContent = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('calendar-day', 'other-month');
        calendarGrid.appendChild(emptyDiv);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const formattedDate = getFormattedDate(date);
        const record = getRecordForDate(formattedDate);

        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        dayDiv.innerHTML = `<span class="day-number">${day}</span><div class="day-info"></div>`;

        // Highlight current day
        if (formattedDate === getFormattedDate(new Date())) {
            dayDiv.classList.add('current-day');
        }

        const dayInfoSpan = dayDiv.querySelector('.day-info');
        if (record) {
            if (record.status === 'holiday') {
                dayInfoSpan.textContent = 'Holiday';
                dayDiv.classList.add('holiday');
            } else if (record.status === 'recorded') {
                const attendedCount = record.classesAttendedDay;
                const totalPossible = record.totalClassesDay;
                dayInfoSpan.textContent = `Att: ${attendedCount}/${totalPossible}`;
                dayDiv.classList.add('attended');
            }
        } else {
            dayInfoSpan.textContent = 'No Record';
        }

        // Simple click listener to open alteration modal (no time delay)
        dayDiv.addEventListener('click', () => {
            // Only allow altering past or current dates with a record, or adding a record to a past/current date.
            // Future dates without records cannot be "altered" (they need to be "recorded" via daily input).
            if (record || formattedDate <= getFormattedDate(new Date())) {
                openAlterRecordModal(record, formattedDate);
            } else {
                alert("Cannot alter a future date without a record. Please use 'Start Daily Record' for current day entries.");
            }
        });

        calendarGrid.appendChild(dayDiv);
    }
}

prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentYear, currentMonth);
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentYear, currentMonth);
});

// --- Alter Record Modal Logic ---

function openAlterRecordModal(record, dateString) {
    modalDateDisplay.textContent = dateString;
    currentDateToAlter = dateString;
    originalRecordData = record ? JSON.parse(JSON.stringify(record)) : null; // Deep copy to compare later

    // Reset password input and warning
    alterPasswordInput.value = '';
    passwordWarning.textContent = '';
    passwordWarning.style.display = 'none';

    // Reset checkboxes
    alterClassCheckboxes.forEach(checkbox => checkbox.checked = false);
    alterSuspendedCheckboxes.forEach(checkbox => checkbox.checked = false);

    // Populate checkboxes if a record exists and was recorded (not just a holiday)
    if (record && record.status === 'recorded') {
        record.classesAttended.forEach(className => {
            const checkbox = document.querySelector(`.alter-class-checkbox[value="${className}"]`);
            if (checkbox) checkbox.checked = true;
        });
        record.classesSuspended.forEach(className => {
            const checkbox = document.querySelector(`.alter-suspended-checkbox[value="${className}"]`);
            if (checkbox) checkbox.checked = true;
        });
    } else if (record && record.status === 'holiday') {
        // If it was a holiday, all checkboxes should be unchecked.
        // Default state (all unchecked) is correct here.
        // If user ticks any, it will change from holiday to recorded.
    }
    // If no record, all unchecked, indicating no classes attended/suspended, but can be added.

    // Show the alteration view first
    showModalPage(alterationView);
    alterRecordModal.classList.add('visible');
}

function closeAlterRecordModal() {
    alterRecordModal.classList.remove('visible');
    // Give time for transition before hiding content to prevent flicker
    setTimeout(() => {
        alterationView.classList.remove('active-modal-page');
        alterationView.classList.add('hidden-modal-page');
        passwordView.classList.remove('active-modal-page');
        passwordView.classList.add('hidden-modal-page');
        passwordWarning.textContent = ''; // Clear warning on close
        passwordWarning.style.display = 'none';
        alterPasswordInput.value = ''; // Clear password
    }, 300); // Match CSS transition duration
}

function showModalPage(pageToShow) {
    const pages = document.querySelectorAll('.modal-page');
    pages.forEach(page => {
        page.classList.remove('active-modal-page');
        page.classList.add('hidden-modal-page');
    });
    pageToShow.classList.remove('hidden-modal-page');
    pageToShow.classList.add('active-modal-page');
}

// Event Listeners for the Alter Record Modal
closeModalBtn.addEventListener('click', closeAlterRecordModal);
cancelAlterationBtn.addEventListener('click', closeAlterRecordModal);
cancelPasswordBtn.addEventListener('click', closeAlterRecordModal);


confirmAlterationBtn.addEventListener('click', () => {
    const newAttended = Array.from(alterClassCheckboxes)
                            .filter(cb => cb.checked)
                            .map(cb => cb.value);
    const newSuspended = Array.from(alterSuspendedCheckboxes)
                              .filter(cb => cb.checked)
                              .map(cb => cb.value);

    // Determine if there are actual changes
    let hasChanges = false;
    let oldAttended = [];
    let oldSuspended = [];
    let wasRecorded = false;
    let wasHoliday = false;

    if (originalRecordData) {
        wasRecorded = originalRecordData.status === 'recorded';
        wasHoliday = originalRecordData.status === 'holiday';
        if (wasRecorded) {
            oldAttended = originalRecordData.classesAttended || [];
            oldSuspended = originalRecordData.classesSuspended || [];
        }
    }

    // Check for changes in attended classes
    if (newAttended.length !== oldAttended.length || newAttended.some(c => !oldAttended.includes(c))) {
        hasChanges = true;
    }
    // Check for changes in suspended classes
    if (newSuspended.length !== oldSuspended.length || newSuspended.some(c => !oldSuspended.includes(c))) {
        hasChanges = true;
    }

    // Special case: if it was a holiday or no record, and now something is ticked
    if (!originalRecordData || wasHoliday) {
        if (newAttended.length > 0 || newSuspended.length > 0) {
            hasChanges = true;
        }
        // If it was a holiday and now no classes are ticked (and it wasn't recorded before)
        // this technically means no change if the intent is to keep it 'no record/holiday'
        if (wasHoliday && newAttended.length === 0 && newSuspended.length === 0) {
            hasChanges = false; // Stay holiday
        }
    }
    
    // If no changes, directly close
    if (!hasChanges) {
        alert("No changes detected. Returning to calendar.");
        closeAlterRecordModal(); 
        return;
    }

    // If there are changes, proceed to password view
    showModalPage(passwordView);
});


submitAlterPasswordBtn.addEventListener('click', () => {
    const enteredPassword = alterPasswordInput.value;
    if (enteredPassword === CORRECT_PASSWORD) {
        // Get the current (potentially altered) selections
        const newAttended = Array.from(alterClassCheckboxes)
                                .filter(cb => cb.checked)
                                .map(cb => cb.value);
        const newSuspended = Array.from(alterSuspendedCheckboxes)
                                  .filter(cb => cb.checked)
                                  .map(cb => cb.value);

        // Find the record to update or create a new one if it didn't exist/was holiday
        let recordIndex = attendanceRecords.findIndex(record => record.date === currentDateToAlter);
        let recordToUpdate = {};

        if (recordIndex !== -1) {
            recordToUpdate = attendanceRecords[recordIndex];
        } else {
            // Create a new record if it didn't exist (e.g., for a past day with no entry)
            recordToUpdate = { date: currentDateToAlter };
            attendanceRecords.push(recordToUpdate);
            recordIndex = attendanceRecords.length - 1; // Get the index of the newly added record
        }

        recordToUpdate.classesAttended = newAttended;
        recordToUpdate.classesSuspended = newSuspended;
        recordToUpdate.classesAttendedDay = newAttended.length;
        
        // If newAttended or newSuspended are not empty, then college was implicitly open.
        // If both are empty and original was holiday, keep it holiday.
        // If both are empty and original was recorded, change to holiday.
        if (newAttended.length === 0 && newSuspended.length === 0) {
             recordToUpdate.collegeOpen = false;
             recordToUpdate.totalClassesDay = 0;
             recordToUpdate.status = 'holiday';
        } else {
             recordToUpdate.collegeOpen = true;
             recordToUpdate.totalClassesDay = CLASSES_PER_DAY - newSuspended.length;
             recordToUpdate.status = 'recorded';
        }
        
        saveAttendanceData(); // Save changes and refresh dashboard/calendar
        alert("Attendance record updated successfully!");
        closeAlterRecordModal();

    } else {
        passwordWarning.textContent = "Incorrect password. Please try again.";
        passwordWarning.style.display = 'block';
        alterPasswordInput.value = ''; // Clear password field
    }
});

// Hide password warning when input changes
alterPasswordInput.addEventListener('input', () => {
    passwordWarning.style.display = 'none';
});


// --- 8. Navigation Event Listeners ---
navHomeBtn.addEventListener('click', () => {
    showPage(homePage);
    updateDashboard(); // Ensure dashboard is updated when returning home
    updateCurrentDateDisplay(); // Update date when returning to home
    scheduleDailyAttendanceReminder(); // Re-schedule/check notification when returning to home
});
navCalendarBtn.addEventListener('click', () => {
    showPage(calendarPage);
    // Initialize calendar to current month if not already set
    if (!currentYear || !currentMonth) {
        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth();
    }
    generateCalendar(currentYear, currentMonth);
});

// Event Listener for Export Data Button
exportDataBtn.addEventListener('click', exportData);
// NEW: Event Listener for Import Data Button and File Input
importDataBtn.addEventListener('click', () => {
    importFileInput.click(); // Trigger the hidden file input click
});
importFileInput.addEventListener('change', importData); // Listen for file selection

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    loadAttendanceData(); // Load any previously saved data
    showPage(homePage); // Start on the home page
    updateDashboard(); // Update dashboard with loaded data
    updateCurrentDateDisplay(); // Display current date on initial load

    // Request notification permission and schedule reminder on page load
    requestNotificationPermission();

    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    generateCalendar(currentYear, currentMonth); // Initial calendar generation
});

