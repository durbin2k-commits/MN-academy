// Initialize local storage data
let students = JSON.parse(localStorage.getItem('students')) || [];
let routines = JSON.parse(localStorage.getItem('routines')) || [];
let attendances = JSON.parse(localStorage.getItem('attendances')) || [];

// Display current date and time
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const banglaMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    
    const day = banglaDays[now.getDay()];
    const month = banglaMonths[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    document.querySelector('.date').textContent = `${day}, ${date} ${month} ${year}`;
    document.querySelector('.time').textContent = `${hours}:${minutes} ${ampm}`;
}

setInterval(updateDateTime, 1000);

// Show different sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update navigation active state
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Load data for the section
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'routine') {
        displayRoutines();
    } else if (sectionId === 'students') {
        displayStudents();
    } else if (sectionId === 'attendance') {
        document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
        loadAttendance();
    }
}

// Student Management
function addStudent() {
    const name = document.getElementById('studentName').value;
    const roll = document.getElementById('studentRoll').value;
    const studentClass = document.getElementById('studentClass').value;
    const phone = document.getElementById('studentPhone').value;
    
    if (name && roll && studentClass) {
        const student = {
            id: Date.now(),
            name: name,
            roll: roll,
            class: studentClass,
            phone: phone || 'নাই'
        };
        
        students.push(student);
        localStorage.setItem('students', JSON.stringify(students));
        
        // Clear form
        document.getElementById('studentName').value = '';
        document.getElementById('studentRoll').value = '';
        document.getElementById('studentClass').value = '';
        document.getElementById('studentPhone').value = '';
        
        displayStudents();
        updateDashboard();
        alert('স্টুডেন্ট যোগ করা হয়েছে!');
    } else {
        alert('নাম, রোল এবং ক্লাস অবশ্যই দিতে হবে!');
    }
}

function displayStudents() {
    const studentList = document.getElementById('studentList');
    
    if (students.length === 0) {
        studentList.innerHTML = '<p style="text-align: center; color: #666;">কোন স্টুডেন্ট নেই</p>';
        return;
    }
    
    studentList.innerHTML = students.map(student => `
        <div class="student-item">
            <div class="student-info">
                <h4>${student.name}</h4>
                <p>রোল: ${student.roll} | ক্লাস: ${student.class} | ফোন: ${student.phone}</p>
            </div>
            <button onclick="deleteStudent(${student.id})" class="delete-btn">ডিলিট</button>
        </div>
    `).join('');
}

function deleteStudent(id) {
    if (confirm('নিশ্চিতভাবে ডিলিট করতে চান?')) {
        students = students.filter(student => student.id !== id);
        localStorage.setItem('students', JSON.stringify(students));
        displayStudents();
        updateDashboard();
    }
}

// Routine Management
function addRoutine() {
    const time = document.getElementById('routineTime').value;
    const activity = document.getElementById('routineActivity').value;
    const day = document.getElementById('routineDay').value;
    
    if (time && activity) {
        const routine = {
            id: Date.now(),
            time: time,
            activity: activity,
            day: day
        };
        
        routines.push(routine);
        localStorage.setItem('routines', JSON.stringify(routines));
        
        // Clear form
        document.getElementById('routineTime').value = '';
        document.getElementById('routineActivity').value = '';
        
        displayRoutines();
        alert('রুটিন যোগ করা হয়েছে!');
    } else {
        alert('সময় এবং কাজের বিবরণ দিন!');
    }
}

function displayRoutines() {
    const routineList = document.getElementById('routineList');
    
    if (routines.length === 0) {
        routineList.innerHTML = '<p style="text-align: center; color: #666;">কোন রুটিন নেই</p>';
        return;
    }
    
    // Sort routines by time
    const sortedRoutines = [...routines].sort((a, b) => a.time.localeCompare(b.time));
    
    const dayNames = {
        'sunday': 'রবিবার',
        'monday': 'সোমবার',
        'tuesday': 'মঙ্গলবার',
        'wednesday': 'বুধবার',
        'thursday': 'বৃহস্পতিবার',
        'friday': 'শুক্রবার',
        'saturday': 'শনিবার'
    };
    
    routineList.innerHTML = sortedRoutines.map(routine => `
        <div class="routine-item">
            <span class="routine-time">${routine.time}</span>
            <span class="routine-activity">${routine.activity}</span>
            <span class="routine-day">${dayNames[routine.day]}</span>
            <button onclick="deleteRoutine(${routine.id})" class="delete-btn">ডিলিট</button>
        </div>
    `).join('');
}

function deleteRoutine(id) {
    if (confirm('নিশ্চিতভাবে ডিলিট করতে চান?')) {
        routines = routines.filter(routine => routine.id !== id);
        localStorage.setItem('routines', JSON.stringify(routines));
        displayRoutines();
    }
}

// Attendance Management
function loadAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const attendanceList = document.getElementById('attendanceList');
    
    if (students.length === 0) {
        attendanceList.innerHTML = '<p style="text-align: center; color: #666;">প্রথমে স্টুডেন্ট যোগ করুন</p>';
        return;
    }
    
    // Find existing attendance for this date
    const existingAttendance = attendances.find(a => a.date === date);
    
    attendanceList.innerHTML = students.map(student => {
        const status = existingAttendance ? 
            (existingAttendance.records[student.id] || 'absent') : 'absent';
        
        return `
            <div class="attendance-item">
                <span>${student.name} (রোল: ${student.roll})</span>
                <div class="attendance-status">
                    <select onchange="updateAttendanceStatus(${student.id}, this.value)" data-student-id="${student.id}">
                        <option value="present" ${status === 'present' ? 'selected' : ''}>উপস্থিত</option>
                        <option value="absent" ${status === 'absent' ? 'selected' : ''}>অনুপস্থিত</option>
                    </select>
                </div>
                <span class="${status === 'present' ? 'present' : 'absent'}">
                    ${status === 'present' ? '✅' : '❌'}
                </span>
            </div>
        `;
    }).join('');
}

function updateAttendanceStatus(studentId, status) {
    // Store in a temporary object
    if (!window.currentAttendance) {
        window.currentAttendance = {};
    }
    window.currentAttendance[studentId] = status;
}

function saveAttendance() {
    const date = document.getElementById('attendanceDate').value;
    
    if (!date) {
        alert('তারিখ নির্বাচন করুন!');
        return;
    }
    
    const records = {};
    document.querySelectorAll('.attendance-item select').forEach(select => {
        const studentId = select.getAttribute('data-student-id');
        records[studentId] = select.value;
    });
    
    // Remove existing attendance for this date if any
    attendances = attendances.filter(a => a.date !== date);
    
    // Add new attendance
    attendances.push({
        date: date,
        records: records
    });
    
    localStorage.setItem('attendances', JSON.stringify(attendances));
    updateDashboard();
    alert('অ্যাটেনডেন্স সেভ করা হয়েছে!');
}

// Dashboard
function updateDashboard() {
    // Total students
    document.getElementById('totalStudents').textContent = students.length;
    
    // Today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendances.find(a => a.date === today);
    
    let present = 0;
    let absent = 0;
    
    if (todayAttendance && students.length > 0) {
        students.forEach(student => {
            if (todayAttendance.records[student.id] === 'present') {
                present++;
            } else {
                absent++;
            }
        });
    }
    
    document.getElementById('todayPresent').textContent = present;
    document.getElementById('todayAbsent').textContent = absent;
    
    // Attendance rate
    const rate = students.length > 0 ? Math.round((present / students.length) * 100) : 0;
    document.getElementById('attendanceRate').textContent = rate + '%';
    
    // Today's routine
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDay = days[new Date().getDay()];
    
    const todayRoutines = routines
        .filter(r => r.day === todayDay)
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 5);
    
    const routineList = document.getElementById('todayRoutine');
    
    if (todayRoutines.length === 0) {
        routineList.innerHTML = '<p style="text-align: center; color: #666;">আজকের জন্য কোন রুটিন নেই</p>';
    } else {
        routineList.innerHTML = todayRoutines.map(routine => `
            <div class="routine-item">
                <span class="routine-time">${routine.time}</span>
                <span class="routine-activity">${routine.activity}</span>
            </div>
        `).join('');
    }
}

// Initialize on page load
window.onload = function() {
    updateDateTime();
    updateDashboard();
    displayRoutines();
    displayStudents();
    
    // Set today's date for attendance
    document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
};