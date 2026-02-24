// Initialize data
let students = JSON.parse(localStorage.getItem('mnAcademy_students')) || [];
let classes = JSON.parse(localStorage.getItem('mnAcademy_classes')) || [];
let privateAttendance = JSON.parse(localStorage.getItem('mnAcademy_privateAttendance')) || {};
let visitors = JSON.parse(localStorage.getItem('mnAcademy_visitors')) || { total: 0, today: 0, lastVisit: null };

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
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    document.querySelector('.date').textContent = `${day}, ${date} ${month} ${year}`;
    document.querySelector('.time').textContent = `${hours}:${minutes} ${ampm}`;
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

// Load classes
function loadClasses() {
    const classGrid = document.getElementById('classGrid');
    
    if (classes.length === 0) {
        // Default classes if none uploaded
        classes = [
            { name: 'বাংলা ১ম পত্র', icon: 'fa-book', teacher: 'মনির স্যার', students: 25 },
            { name: 'বাংলা ২য় পত্র', icon: 'fa-book-open', teacher: 'মনির স্যার', students: 25 },
            { name: 'ইংরেজি ১ম পত্র', icon: 'fa-language', teacher: 'সালমা ম্যাম', students: 25 },
            { name: 'গণিত', icon: 'fa-calculator', teacher: 'কামাল স্যার', students: 25 },
            { name: 'বিজ্ঞান', icon: 'fa-flask', teacher: 'নাসরিন ম্যাম', students: 25 },
            { name: 'পদার্থ বিজ্ঞান', icon: 'fa-atom', teacher: 'জাহিদ স্যার', students: 25 }
        ];
    }
    
    classGrid.innerHTML = classes.map(cls => `
        <div class="class-card" onclick="showClassDetails('${cls.name}')">
            <i class="fas ${cls.icon}"></i>
            <h3>${cls.name}</h3>
            <p>শিক্ষক: ${cls.teacher}</p>
            <p>স্টুডেন্ট: ${cls.students} জন</p>
        </div>
    `).join('');
    
    document.getElementById('totalClasses').textContent = classes.length;
}

// Upload class (public)
function uploadClass() {
    const name = document.getElementById('className').value;
    const teacher = document.getElementById('classTeacher').value;
    const students = document.getElementById('classStudents').value;
    const icon = document.getElementById('classIcon').value;
    
    if (name && teacher && students) {
        const newClass = {
            name: name,
            teacher: teacher,
            students: parseInt(students),
            icon: icon
        };
        
        classes.push(newClass);
        localStorage.setItem('mnAcademy_classes', JSON.stringify(classes));
        loadClasses();
        
        // Clear form
        document.getElementById('className').value = '';
        document.getElementById('classTeacher').value = '';
        document.getElementById('classStudents').value = '';
        
        alert('ক্লাস আপলোড করা হয়েছে!');
    } else {
        alert('সব তথ্য দিন!');
    }
}

// Private section access
function checkPrivateAccess() {
    const password = document.getElementById('privatePassword').value;
    
    if (password === PRIVATE_PASSWORD) {
        document.getElementById('passwordProtection').style.display = 'none';
        document.getElementById('privateDashboard').style.display = 'block';
    } else {
        alert('ভুল পাসওয়ার্ড!');
    }
}

// Show different private sections
function showClassUpload() {
    document.getElementById('classUploadSection').style.display = 'block';
    document.getElementById('studentManagementSection').style.display = 'none';
    document.getElementById('privateAttendanceSection').style.display = 'none';
}

function showStudentManagement() {
    document.getElementById('classUploadSection').style.display = 'none';
    document.getElementById('studentManagementSection').style.display = 'block';
    document.getElementById('privateAttendanceSection').style.display = 'none';
    displayStudents();
}

function showPrivateAttendance() {
    document.getElementById('classUploadSection').style.display = 'none';
    document.getElementById('studentManagementSection').style.display = 'none';
    document.getElementById('privateAttendanceSection').style.display = 'block';
    loadPrivateCalendar();
}

// Upload private class
function uploadPrivateClass() {
    const name = document.getElementById('privateClassName').value;
    const teacher = document.getElementById('privateClassTeacher').value;
    const students = document.getElementById('privateClassStudents').value;
    const icon = document.getElementById('privateClassIcon').value;
    
    if (name && teacher && students) {
        const newClass = {
            name: name,
            teacher: teacher,
            students: parseInt(students),
            icon: icon
        };
        
        classes.push(newClass);
        localStorage.setItem('mnAcademy_classes', JSON.stringify(classes));
        loadClasses();
        
        document.getElementById('privateClassName').value = '';
        document.getElementById('privateClassTeacher').value = '';
        document.getElementById('privateClassStudents').value = '';
        
        alert('ক্লাস আপলোড করা হয়েছে!');
    } else {
        alert('সব তথ্য দিন!');
    }
}

// Load public calendar
function loadPublicCalendar() {
    const month = parseInt(document.getElementById('monthSelector').value);
    const year = parseInt(document.getElementById('yearSelector').value);
    const calendar = document.getElementById('attendanceCalendar');
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    let calendarHTML = '';
    let dayCount = 1;
    
    // Create 6 rows for the calendar
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                // Empty cells before the first day
                calendarHTML += '<div class="calendar-day empty"></div>';
            } else if (dayCount <= daysInMonth) {
                const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;
                
                // Check attendance status for this date
                let status = '';
                let presentCount = 0;
                let totalCount = students.length;
                
                if (privateAttendance[date] && totalCount > 0) {
                    presentCount = Object.values(privateAttendance[date]).filter(v => v === true).length;
                    
                    if (presentCount === totalCount) {
                        status = 'present';
                    } else if (presentCount === 0) {
                        status = 'absent';
                    } else if (presentCount > 0) {
                        status = 'mixed';
                    }
                }
                
                calendarHTML += `
                    <div class="calendar-day ${status}" onclick="showDateAttendance('${date}')">
                        <span class="day-number">${dayCount}</span>
                        ${presentCount > 0 ? `<span class="attendance-badge">${presentCount}/${totalCount}</span>` : ''}
                    </div>
                `;
                dayCount++;
            } else {
                // Empty cells after the last day
                calendarHTML += '<div class="calendar-day empty"></div>';
            }
        }
    }
    
    calendar.innerHTML = calendarHTML;
}

// Load private calendar
function loadPrivateCalendar() {
    const month = parseInt(document.getElementById('privateMonthSelector').value);
    const year = parseInt(document.getElementById('privateYearSelector').value);
    const calendar = document.getElementById('privateCalendar');
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    let calendarHTML = '';
    let dayCount = 1;
    
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                calendarHTML += '<div class="calendar-day empty"></div>';
            } else if (dayCount <= daysInMonth) {
                const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;
                
                calendarHTML += `
                    <div class="calendar-day" onclick="manageAttendance('${date}', ${dayCount})">
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

// Manage attendance (private)
function manageAttendance(date, day) {
    if (students.length === 0) {
        alert('প্রথমে স্টুডেন্ট যোগ করুন!');
        return;
    }
    
    let message = `দিন ${day} তারিখের অ্যাটেনডেন্স\n\n`;
    students.forEach((student, index) => {
        const status = privateAttendance[date]?.[student.id] ? '✅' : '❌';
        message += `${index + 1}. ${student.name} (রোল: ${student.roll}) - ${status}\n`;
    });
    
    const studentRoll = prompt(message + '\n\nরোল নম্বর দিন (অ্যাটেনডেন্স টগল করতে):');
    
    if (studentRoll) {
        const student = students.find(s => s.roll === studentRoll);
        
        if (student) {
            if (!privateAttendance[date]) {
                privateAttendance[date] = {};
            }
            
            privateAttendance[date][student.id] = !privateAttendance[date][student.id];
            localStorage.setItem('mnAcademy_privateAttendance', JSON.stringify(privateAttendance));
            
            loadPrivateCalendar();
            loadPublicCalendar();
            alert(`${student.name} এর অ্যাটেনডেন্স আপডেট করা হয়েছে!`);
        } else {
            alert('রোল নম্বরটি সঠিক নয়!');
        }
    }
}

// Show date attendance (public)
function showDateAttendance(date) {
    if (!privateAttendance[date]) {
        alert('এই দিনে কোনো অ্যাটেনডেন্স নেই!');
        return;
    }
    
    const present = [];
    const absent = [];
    
    students.forEach(student => {
        if (privateAttendance[date][student.id]) {
            present.push(`${student.name} (রোল: ${student.roll})`);
        } else {
            absent.push(`${student.name} (রোল: ${student.roll})`);
        }
    });
    
    alert(`📅 তারিখ: ${date}\n\n✅ উপস্থিত (${present.length}):\n${present.join('\n')}\n\n❌ অনুপস্থিত (${absent.length}):\n${absent.join('\n')}`);
}

// Student management functions
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
        alert('স্টুডেন্ট যোগ করা হয়েছে!');
    } else {
        alert('সব তথ্য দিন!');
    }
}

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

function deleteStudent(id) {
    if (confirm('স্টুডেন্ট ডিলিট করবেন?')) {
        students = students.filter(s => s.id !== id);
        localStorage.setItem('mnAcademy_students', JSON.stringify(students));
        displayStudents();
    }
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

// Event listeners
document.getElementById('monthSelector').addEventListener('change', loadPublicCalendar);
document.getElementById('yearSelector').addEventListener('change', loadPublicCalendar);
document.getElementById('privateMonthSelector').addEventListener('change', loadPrivateCalendar);
document.getElementById('privateYearSelector').addEventListener('change', loadPrivateCalendar);

// Initialize
window.onload = function() {
    updateDateTime();
    updateVisitorCounter();
    loadClasses();
    
    // Set default month and year
    const today = new Date();
    document.getElementById('monthSelector').value = today.getMonth();
    document.getElementById('yearSelector').value = today.getFullYear();
    document.getElementById('privateMonthSelector').value = today.getMonth();
    document.getElementById('privateYearSelector').value = today.getFullYear();
    
    loadPublicCalendar();
};
