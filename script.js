// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// App State
let currentUser = null;
let currentStudent = null;
let adminCalendar = null;
let studentCalendar = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadStudents();
    loadVideos();
    loadMaterials();
    loadMessages();
});

// Authentication Functions
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.login-form').forEach(form => form.classList.remove('active'));
    
    if (tab === 'student') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('studentLoginForm').classList.add('active');
    } else {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('adminLoginForm').classList.add('active');
    }
}

function handleStudentLogin(e) {
    e.preventDefault();
    const accessLink = document.getElementById('accessLink').value;
    
    // Extract student ID from access link
    const studentId = accessLink.split('/').pop();
    
    db.collection('students').doc(studentId).get()
        .then(doc => {
            if (doc.exists) {
                currentStudent = { id: doc.id, ...doc.data() };
                showStudentDashboard();
            } else {
                alert('Invalid access link');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Login failed');
        });
}

function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Simple admin authentication (in production, use proper authentication)
    if (username === 'admin' && password === 'mnacademy2024') {
        currentUser = { role: 'admin', username };
        showAdminDashboard();
    } else {
        alert('Invalid credentials');
    }
}

function logout() {
    currentUser = null;
    currentStudent = null;
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('loginPage').classList.add('active');
}

function checkAuth() {
    // Check if user was previously logged in
    // This would typically use Firebase Auth
}

// Admin Functions
function showAdminDashboard() {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('adminDashboard').classList.add('active');
    loadStudents();
    initAdminCalendar();
}

function showAdminSection(section) {
    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    
    event.target.closest('li').classList.add('active');
    document.getElementById(section + 'Section').classList.add('active');
    
    if (section === 'calendar') {
        initAdminCalendar();
    } else if (section === 'videos') {
        loadVideos();
    } else if (section === 'messages') {
        loadStudentsForMessage();
        loadSentMessages();
    } else if (section === 'commonServer') {
        loadMaterials();
    }
}

function addStudent(e) {
    e.preventDefault();
    
    const studentData = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        class: document.getElementById('studentClass').value,
        roll: document.getElementById('studentRoll').value,
        parentPhone: document.getElementById('parentPhone').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('students').add(studentData)
        .then(docRef => {
            // Generate access link
            const accessLink = `${window.location.origin}/student/${docRef.id}`;
            return db.collection('students').doc(docRef.id).update({ accessLink });
        })
        .then(() => {
            alert('Student added successfully!');
            document.getElementById('addStudentForm').reset();
            loadStudents();
            showAdminSection('students');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to add student');
        });
}

function loadStudents() {
    db.collection('students').orderBy('createdAt', 'desc').get()
        .then(querySnapshot => {
            const grid = document.getElementById('studentsGrid');
            grid.innerHTML = '';
            
            querySnapshot.forEach(doc => {
                const student = { id: doc.id, ...doc.data() };
                grid.appendChild(createStudentCard(student));
            });
        })
        .catch(error => {
            console.error('Error loading students:', error);
        });
}

function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    
    card.innerHTML = `
        <i class='bx bxs-user-circle'></i>
        <h3>${student.name}</h3>
        <p>Class: ${student.class}</p>
        <p>Roll: ${student.roll}</p>
        <p>Email: ${student.email}</p>
        <button class="copy-link-btn" onclick="copyAccessLink('${student.accessLink}')">
            <i class='bx bx-copy'></i> Copy Link
        </button>
        <div class="student-actions">
            <button class="edit-btn" onclick="editStudent('${student.id}')">
                <i class='bx bx-edit'></i> Edit
            </button>
            <button class="delete-btn" onclick="deleteStudent('${student.id}')">
                <i class='bx bx-trash'></i> Delete
            </button>
        </div>
    `;
    
    return card;
}

function copyAccessLink(link) {
    navigator.clipboard.writeText(link);
    alert('Access link copied to clipboard!');
}

function editStudent(studentId) {
    db.collection('students').doc(studentId).get()
        .then(doc => {
            if (doc.exists) {
                const student = doc.data();
                // Populate form with student data
                document.getElementById('studentName').value = student.name;
                document.getElementById('studentEmail').value = student.email;
                document.getElementById('studentClass').value = student.class;
                document.getElementById('studentRoll').value = student.roll;
                document.getElementById('parentPhone').value = student.parentPhone;
                
                // Change form to update mode
                const form = document.getElementById('addStudentForm');
                form.onsubmit = function(e) {
                    e.preventDefault();
                    updateStudent(studentId);
                };
                
                showAdminSection('addStudent');
            }
        });
}

function updateStudent(studentId) {
    const studentData = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        class: document.getElementById('studentClass').value,
        roll: document.getElementById('studentRoll').value,
        parentPhone: document.getElementById('parentPhone').value
    };
    
    db.collection('students').doc(studentId).update(studentData)
        .then(() => {
            alert('Student updated successfully!');
            loadStudents();
            showAdminSection('students');
            
            // Reset form
            document.getElementById('addStudentForm').reset();
            document.getElementById('addStudentForm').onsubmit = addStudent;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to update student');
        });
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        db.collection('students').doc(studentId).delete()
            .then(() => {
                alert('Student deleted successfully!');
                loadStudents();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete student');
            });
    }
}

// Calendar Functions
function initAdminCalendar() {
    const calendarEl = document.getElementById('adminCalendar');
    if (calendarEl) {
        adminCalendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: loadCalendarEvents
        });
        adminCalendar.render();
    }
}

function loadCalendarEvents(fetchInfo, successCallback, failureCallback) {
    db.collection('events').orderBy('date').get()
        .then(querySnapshot => {
            const events = [];
            querySnapshot.forEach(doc => {
                const event = doc.data();
                events.push({
                    title: event.title,
                    start: event.date + 'T' + event.time,
                    description: event.description
                });
            });
            successCallback(events);
        })
        .catch(error => {
            console.error('Error loading events:', error);
            failureCallback(error);
        });
}

function addCalendarEvent(e) {
    e.preventDefault();
    
    const eventData = {
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        description: document.getElementById('eventDescription').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('events').add(eventData)
        .then(() => {
            alert('Event added successfully!');
            document.getElementById('eventTitle').value = '';
            document.getElementById('eventDate').value = '';
            document.getElementById('eventTime').value = '';
            document.getElementById('eventDescription').value = '';
            adminCalendar.refetchEvents();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to add event');
        });
}

// Video Functions
function uploadVideo(e) {
    e.preventDefault();
    
    const videoData = {
        title: document.getElementById('videoTitle').value,
        url: document.getElementById('videoUrl').value,
        class: document.getElementById('videoClass').value,
        description: document.getElementById('videoDescription').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('videos').add(videoData)
        .then(() => {
            alert('Video uploaded successfully!');
            document.getElementById('videoTitle').value = '';
            document.getElementById('videoUrl').value = '';
            document.getElementById('videoClass').value = '';
            document.getElementById('videoDescription').value = '';
            loadVideos();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to upload video');
        });
}

function loadVideos() {
    db.collection('videos').orderBy('createdAt', 'desc').get()
        .then(querySnapshot => {
            const list = document.getElementById('videoList');
            if (list) {
                list.innerHTML = '';
                querySnapshot.forEach(doc => {
                    const video = { id: doc.id, ...doc.data() };
                    list.appendChild(createVideoCard(video));
                });
            }
            
            // Also load videos for student view if available
            loadStudentVideos();
        })
        .catch(error => {
            console.error('Error loading videos:', error);
        });
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-item';
    
    card.innerHTML = `
        <h4>${video.title}</h4>
        <p>Class: ${video.class}</p>
        <p>${video.description || ''}</p>
        <a href="${video.url}" target="_blank" class="video-link">Watch Video</a>
        <div class="video-actions">
            <button onclick="deleteVideo('${video.id}')">
                <i class='bx bx-trash'></i> Delete
            </button>
        </div>
    `;
    
    return card;
}

function deleteVideo(videoId) {
    if (confirm('Are you sure you want to delete this video?')) {
        db.collection('videos').doc(videoId).delete()
            .then(() => {
                alert('Video deleted successfully!');
                loadVideos();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete video');
            });
    }
}

// Message Functions
function loadStudentsForMessage() {
    db.collection('students').get()
        .then(querySnapshot => {
            const select = document.getElementById('messageRecipient');
            // Keep the first "All Students" option
            select.innerHTML = '<option value="">Select Recipient</option><option value="all">All Students</option>';
            
            querySnapshot.forEach(doc => {
                const student = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${student.name} - ${student.class}`;
                select.appendChild(option);
            });
        });
}

function sendMessage(e) {
    e.preventDefault();
    
    const recipient = document.getElementById('messageRecipient').value;
    const messageData = {
        recipient: recipient,
        subject: document.getElementById('messageSubject').value,
        content: document.getElementById('messageContent').value,
        sentAt: firebase.firestore.FieldValue.serverTimestamp(),
        read: false
    };
    
    db.collection('messages').add(messageData)
        .then(() => {
            alert('Message sent successfully!');
            document.getElementById('messageSubject').value = '';
            document.getElementById('messageContent').value = '';
            loadSentMessages();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to send message');
        });
}

function loadSentMessages() {
    db.collection('messages').orderBy('sentAt', 'desc').limit(10).get()
        .then(querySnapshot => {
            const list = document.getElementById('sentMessagesList');
            list.innerHTML = '<h4>Recent Messages</h4>';
            
            querySnapshot.forEach(doc => {
                const msg = doc.data();
                const msgDiv = document.createElement('div');
                msgDiv.className = 'message-item';
                msgDiv.innerHTML = `
                    <p><strong>To:</strong> ${msg.recipient === 'all' ? 'All Students' : 'Specific Student'}</p>
                    <p><strong>Subject:</strong> ${msg.subject}</p>
                    <p><strong>Content:</strong> ${msg.content.substring(0, 50)}...</p>
                    <hr>
                `;
                list.appendChild(msgDiv);
            });
        });
}

// Material Functions
function uploadMaterial(e) {
    e.preventDefault();
    
    const materialData = {
        title: document.getElementById('materialTitle').value,
        class: document.getElementById('materialClass').value,
        link: document.getElementById('materialLink').value,
        description: document.getElementById('materialDescription').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('materials').add(materialData)
        .then(() => {
            alert('Material uploaded successfully!');
            document.getElementById('materialTitle').value = '';
            document.getElementById('materialClass').value = '';
            document.getElementById('materialLink').value = '';
            document.getElementById('materialDescription').value = '';
            loadMaterials();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to upload material');
        });
}

function loadMaterials() {
    db.collection('materials').orderBy('createdAt', 'desc').get()
        .then(querySnapshot => {
            const list = document.getElementById('materialsList');
            if (list) {
                list.innerHTML = '';
                querySnapshot.forEach(doc => {
                    const material = { id: doc.id, ...doc.data() };
                    list.appendChild(createMaterialCard(material));
                });
            }
            
            // Also load for student view
            loadStudentMaterials();
        })
        .catch(error => {
            console.error('Error loading materials:', error);
        });
}

function createMaterialCard(material) {
    const card = document.createElement('div');
    card.className = 'material-item';
    
    card.innerHTML = `
        <h4>${material.title}</h4>
        <p>Class: ${material.class}</p>
        <p>${material.description || ''}</p>
        <a href="${material.link}" target="_blank">View Material</a>
        <button onclick="deleteMaterial('${material.id}')" class="delete-btn">
            <i class='bx bx-trash'></i> Delete
        </button>
    `;
    
    return card;
}

function deleteMaterial(materialId) {
    if (confirm('Are you sure you want to delete this material?')) {
        db.collection('materials').doc(materialId).delete()
            .then(() => {
                alert('Material deleted successfully!');
                loadMaterials();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete material');
            });
    }
}

// Student Dashboard Functions
function showStudentDashboard() {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('studentDashboard').classList.add('active');
    
    // Update student info
    document.getElementById('studentName').textContent = currentStudent.name;
    document.getElementById('profileName').textContent = currentStudent.name;
    document.getElementById('profileClass').textContent = `Class: ${currentStudent.class}`;
    document.getElementById('profileEmail').textContent = currentStudent.email;
    document.getElementById('profileRoll').textContent = `Roll: ${currentStudent.roll}`;
    document.getElementById('profileParentPhone').textContent = `Parent: ${currentStudent.parentPhone}`;
    document.getElementById('profileAccessLink').textContent = currentStudent.accessLink;
    
    // Load student-specific data
    initStudentCalendar();
    loadStudentVideos();
    loadStudentMaterials();
    loadStudentMessages();
}

function showStudentSection(section) {
    document.querySelectorAll('.student-sidebar li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.student-section').forEach(sec => sec.classList.remove('active'));
    
    event.target.closest('li').classList.add('active');
    document.getElementById('student' + section.charAt(0).toUpperCase() + section.slice(1) + 'Section').classList.add('active');
}

function initStudentCalendar() {
    const calendarEl = document.getElementById('studentCalendar');
    if (calendarEl) {
        studentCalendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            events: loadStudentEvents
        });
        studentCalendar.render();
    }
    
    // Load upcoming events
    loadUpcomingEvents();
}

function loadStudentEvents(fetchInfo, successCallback, failureCallback) {
    // Load events relevant to student's class
    db.collection('events').where('date', '>=', new Date().toISOString().split('T')[0]).orderBy('date').get()
        .then(querySnapshot => {
            const events = [];
            querySnapshot.forEach(doc => {
                const event = doc.data();
                events.push({
                    title: event.title,
                    start: event.date + 'T' + event.time,
                    description: event.description,
                    className: 'student-event'
                });
            });
            successCallback(events);
        })
        .catch(error => {
            console.error('Error loading events:', error);
            failureCallback(error);
        });
}

function loadUpcomingEvents() {
    db.collection('events').orderBy('date').limit(5).get()
        .then(querySnapshot => {
            const list = document.getElementById('upcomingEvents');
            if (list) {
                list.innerHTML = '<h3>Upcoming Events</h3>';
                querySnapshot.forEach(doc => {
                    const event = doc.data();
                    const eventDiv = document.createElement('div');
                    eventDiv.className = 'event-item';
                    eventDiv.innerHTML = `
                        <p><strong>${event.title}</strong></p>
                        <p>Date: ${event.date} at ${event.time}</p>
                        <p>${event.description || ''}</p>
                    `;
                    list.appendChild(eventDiv);
                });
            }
        });
}

function loadStudentVideos() {
    if (!currentStudent) return;
    
    db.collection('videos')
        .where('class', 'in', [currentStudent.class, 'all'])
        .orderBy('createdAt', 'desc')
        .get()
        .then(querySnapshot => {
            const list = document.getElementById('studentVideos');
            if (list) {
                list.innerHTML = '';
                querySnapshot.forEach(doc => {
                    const video = doc.data();
                    const videoDiv = document.createElement('div');
                    videoDiv.className = 'video-item';
                    videoDiv.innerHTML = `
                        <h4>${video.title}</h4>
                        <p>${video.description || ''}</p>
                        <a href="${video.url}" target="_blank" class="watch-btn">Watch Video</a>
                    `;
                    list.appendChild(videoDiv);
                });
            }
        });
}

function loadStudentMaterials() {
    if (!currentStudent) return;
    
    db.collection('materials')
        .where('class', 'in', [currentStudent.class, 'all'])
        .orderBy('createdAt', 'desc')
        .get()
        .then(querySnapshot => {
            const list = document.getElementById('studentMaterials');
            if (list) {
                list.innerHTML = '';
                querySnapshot.forEach(doc => {
                    const material = doc.data();
                    const materialDiv = document.createElement('div');
                    materialDiv.className = 'material-item';
                    materialDiv.innerHTML = `
                        <h4>${material.title}</h4>
                        <p>${material.description || ''}</p>
                        <a href="${material.link}" target="_blank" class="view-btn">View Material</a>
                    `;
                    list.appendChild(materialDiv);
                });
            }
        });
}

function loadStudentMessages() {
    if (!currentStudent) return;
    
    db.collection('messages')
        .where('recipient', 'in', [currentStudent.id, 'all'])
        .orderBy('sentAt', 'desc')
        .get()
        .then(querySnapshot => {
            const list = document.getElementById('studentMessages');
            if (list) {
                list.innerHTML = '';
                querySnapshot.forEach(doc => {
                    const msg = doc.data();
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'message-card';
                    msgDiv.innerHTML = `
                        <div class="message-header">
                            <h4>${msg.subject}</h4>
                            <small>${new Date(msg.sentAt?.toDate()).toLocaleDateString()}</small>
                        </div>
                        <p>${msg.content}</p>
                    `;
                    list.appendChild(msgDiv);
                });
            }
        });
}
