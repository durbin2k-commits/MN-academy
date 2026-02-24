// Initialize data
let students = JSON.parse(localStorage.getItem('mnAcademy_students')) || [];
let privateAttendance = JSON.parse(localStorage.getItem('mnAcademy_privateAttendance')) || {};
let visitors = JSON.parse(localStorage.getItem('mnAcademy_visitors')) || { total: 0, today: 0, lastVisit: null };

// Password for private section (change this to your desired password)
const PRIVATE_PASSWORD = "mn123";

// Update date and time
function updateDateTime() {
    const now = new Date();
    const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const banglaMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    
    const day = banglaDays[now.getDay()];
    const month = banglaMonths[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    document.querySelector('.date').textContent = `${day}, ${date} ${month} ${year}`;
    document.querySelector('.time').textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
}

setInterval(updateDateTime, 1000);

// Visitor counter
function updateVisitorCounter() {
    const today = new Date().toDateString();
    
    if (visitors.lastVisit !== today) {
        visitors.today = 1;
        visitors.total += 1;
        visitors.lastVisit = today;
    } else {
        visitors.today += 1;
        visitors.total += 1;
    }
    
    localStorage.setItem('mnAcademy_visitors', JSON.stringify(visitors));
    
    document.getElementById('totalVisitors').textContent = visitors.total;
    document.getElementById('todayVisitors').textContent = visitors.today;
    document.getElementById('todayVisitorCount').textContent = visitors.today;
    document.getElementById('totalVisitorCount').textContent = visitors.total;
}

// Load subjects/classes
function loadClasses() {
    const subjects = [
        { name: 'বাংলা ১ম পত্র', icon: 'fa-book', teacher: 'মনির স্যার', students: 25 },
        { name: 'বাংলা ২য় পত্র', icon: 'fa-book-open', teacher: 'মনির স্যার', students: 25 },
        { name: 'ইংরেজি ১ম পত্র', icon: 'fa-language', teacher: 'সালমা ম্যাম', students: 25 },
        { name: 'ইংরেজি ২য় পত্র', icon: 'fa-language', teacher: 'সালমা ম্যাম', students: 25 },
        { name: 'গণিত', icon: 'fa-calculator', teacher: 'কামাল স্যার', students: 25 },
        { name: 'বিজ্ঞান', icon: 'fa-flask', teacher: 'নাসরিন ম্যাম', students: 25 },
        { name: 'সমাজ বিজ্ঞান', icon: 'fa-users', teacher: 'রফিক স্যার', students: 25 },
        { name: 'পদার্থ বিজ্ঞান', icon: 'fa-atom', teacher: 'জাহিদ স্যার', students: 25 },
        { name: 'রসায়ন', icon: 'fa-vial', teacher: 'শাহীন স্যার', students: 25 },
        { name: 'জীববিজ্ঞান', icon: 'fa-dna', teacher: 'নাজমা ম্যাম', students: 25 },
        { name: 'উচ্চতর গণিত', icon: 'fa-square-root-alt', teacher: 'কামাল স্যার', students: 15 },
        { name: 'তথ্য ও যোগাযোগ', icon: 'fa-laptop', teacher: 'সুমন স্যার', students: 25 }
    ];
    
    const classGrid = document.getElementById('classGrid');
    classGrid.innerHTML = subjects.map(subject => `
        <div class="class-card" onclick="showClassDetails('${subject.name}')">
            <i class="fas ${subject.icon}"></i>
            <h3>${subject.name}</h3>
            <p>শিক্ষক: ${subject.teacher}</p>
            <p>স্টুডেন্ট: ${subject.students} জন</p>
        </div>
    `).join('');
}

// Show class details
function showClassDetails(className) {
    alert(`আপনি ${className} ক্লাস সিলেক্ট করেছেন। শীঘ্রই ক্লাস শুরু হবে।`);
}

// Navigation
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        const targetId = this.getAttribute('href').substring(1);
        
        if (targetId === 'private') {
            document.getElementById('private').style.display = 'block';
            document.getElementById('private').scrollIntoView({ behavior: 'smooth' });
        } else {
            document.getElementById('private').style.display = 'none';
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Private section access
function checkPrivateAccess() {
    const password = document.getElementById('privatePassword').value;
    
    if (password === PRIVATE_PASSWORD) {
        document.getElementById('passwordProtection').style.display = 'none';
        document.getElementById('privateAttendance').style.display = 'block';
        loadPrivateAttendance();
        displayStudents();
    } else {
        alert('ভুল পাসওয়ার্ড!');
    }
}

// Add student (private)
function addStudent() {
    const name = document.getElementById('studentName').value;
    const roll = document.getElementById('studentRoll').value;
    const studentClass = document.getElementById('studentClass').value;
    
    if (name && roll && studentClass) {
        const student = {
            id: Date.now(),
            name: name,
            roll: roll,
            class: studentClass
        };
        
        students.push(student);
        localStorage.setItem('mnAcademy_students', JSON.stringify(students));
        
        document.getElementById('studentName').value = '';
        document.getElementById('studentRoll').value = '';
        document.getElementById('studentClass').value = '';
        
        displayStudents();
        loadPrivateAttendance();
        alert('স্টুডেন্ট যোগ করা হয়েছে!');
    } else {
        alert('সব তথ্য দিন!');
    }
}

// Display students
function displayStudents() {
    const studentList = document.getElementById('studentList');
    
    if (students.length === 0) {
        studentList.innerHTML = '<p style="text-align: center;">কোন স্টুডেন্ট নেই</p>';
        return;
    }
    
    studentList.innerHTML = students.map(student => `
        <div class="student-item">
            <div class="student-info">
                <h4>${student.name}</h4>
                <p>রোল: ${student.roll} | ক্লাস: ${student.class}</p>
            </div>
            <button onclick="deleteStudent(${student.id})" class="delete-btn">ডিলিট</button>
        </div>
    `).join('');
}

// Delete student
function deleteStudent(id) {
    if (confirm('স্টুডেন্ট ডিলিট করবেন?')) {
        students = students.filter(s => s.id !== id);
        localStorage.setItem('mnAcademy_students', JSON.stringify(students));
        displayStudents();
        loadPrivateAttendance();
    }
}

// Load private attendance
function loadPrivateAttendance() {
    const month = document.getElementById('privateMonthSelector').value;
    const year = document.getElementById('privateYearSelector').value;
    const calendar = document.getElementById('privateCalendar');
    
    const daysInMonth = new Date(year, parseInt(month) + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    let calendarHTML = '<div class="calendar-header">';
    const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
    days.forEach(day => {
        calendarHTML += `<div class="calendar-day-name">${day}</div>`;
    });
    calendarHTML += '</div>';
    
    let dayCount = 1;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                calendarHTML += '<div class="calendar-day empty"></div>';
            } else if (dayCount <= daysInMonth) {
                const date = `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;
                
                // Count attendance for this date
                let presentCount = 0;
                if (privateAttendance[date]) {
                    presentCount = Object.values(privateAttendance[date]).filter(v => v === true).length;
                }
                
                calendarHTML += `
                    <div class="calendar-day" onclick="toggleDateAttendance('${date}', ${dayCount})">
                        <span class="day-number">${dayCount}</span>
                        ${presentCount > 0 ? `<span class="attendance-count">${presentCount}/${students.length}</span>` : ''}
                    </div>
                `;
                dayCount++;
            } else {
                calendarHTML += '<div class="calendar-day empty"></div>';
            }
        }
    }
    
    calendar.innerHTML = calendarHTML;
}

// Toggle date attendance
function toggleDateAttendance(date, day) {
    const student = prompt(`দিন ${day} তারিখের জন্য স্টুডেন্ট আইডি দিন:`);
    
    if (student) {
        const studentId = parseInt(student);
        const studentExists = students.find(s => s.id === studentId);
        
        if (studentExists) {
            if (!privateAttendance[date]) {
                privateAttendance[date] = {};
            }
            
            privateAttendance[date][studentId] = !privateAttendance[date][studentId];
            localStorage.setItem('mnAcademy_privateAttendance', JSON.stringify(privateAttendance));
            loadPrivateAttendance();
        } else {
            alert('স্টুডেন্ট পাওয়া যায়নি!');
        }
    }
}

// Public attendance calendar
function loadPublicAttendance() {
    const month = document.getElementById('monthSelector').value;
    const year = document.getElementById('yearSelector').value;
    const calendar = document.getElementById('attendanceCalendar');
    
    const daysInMonth = new Date(year, parseInt(month) + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    let calendarHTML = '<div class="calendar-header">';
    const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
    days.forEach(day => {
        calendarHTML += `<div class="calendar-day-name">${day}</div>`;
    });
    calendarHTML += '</div>';
    
    let dayCount = 1;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                calendarHTML += '<div class="calendar-day empty"></div>';
            } else if (dayCount <= daysInMonth) {
                const date = `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;
                
                // Check if anyone was present on this date
                let hasAttendance = false;
                if (privateAttendance[date]) {
                    hasAttendance = Object.values(privateAttendance[date]).some(v => v === true);
                }
                
                calendarHTML += `
                    <div class="calendar-day ${hasAttendance ? 'present' : ''}" onclick="showDateAttendance('${date}')">
                        <span class="day-number">${dayCount}</span>
                    </div>
                `;
                dayCount++;
            } else {
                calendarHTML += '<div class="calendar-day empty"></div>';
            }
        }
    }
    
    calendar.innerHTML = calendarHTML;
}

// Show date attendance (public)
function showDateAttendance(date) {
    if (privateAttendance[date]) {
        const presentStudents = [];
        const absentStudents = [];
        
        students.forEach(student => {
            if (privateAttendance[date][student.id]) {
                presentStudents.push(student.name);
            } else {
                absentStudents.push(student.name);
            }
        });
        
        alert(`📅 তারিখ: ${date}\n\n✅ উপস্থিত (${presentStudents.length}): ${presentStudents.join(', ')}\n\n❌ অনুপস্থিত (${absentStudents.length}): ${absentStudents.join(', ')}`);
    } else {
        alert('এই দিনে কোন অ্যাটেনডেন্স নেই!');
    }
}

// Event listeners for month/year changes
document.getElementById('monthSelector').addEventListener('change', loadPublicAttendance);
document.getElementById('yearSelector').addEventListener('change', loadPublicAttendance);
document.getElementById('privateMonthSelector').addEventListener('change', loadPrivateAttendance);
document.getElementById('privateYearSelector').addEventListener('change', loadPrivateAttendance);

// Initialize
window.onload = function() {
    updateDateTime();
    updateVisitorCounter();
    loadClasses();
    loadPublicAttendance();
    
    // Set default month and year
    const today = new Date();
    document.getElementById('monthSelector').value = today.getMonth();
    document.getElementById('yearSelector').value = today.getFullYear();
    document.getElementById('privateMonthSelector').value = today.getMonth();
    document.getElementById('privateYearSelector').value = today.getFullYear();
};
