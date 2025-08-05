// This event listener ensures that the entire script runs only after the
// HTML document has been fully loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIGURATION & GLOBAL VARIABLES ---
    const API_URL = 'http://127.0.0.1:5000'; // The base URL for your Python backend
    let sessionChart; // Will hold the Chart.js instance for the dashboard
    let html5QrCode;  // Will hold the html5-qrcode scanner instance
    let isScanning = false; // A flag to track the scanner's state

    // --- DOM ELEMENT SELECTORS ---
    // Caching all necessary DOM elements for quick access and better performance.
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const addAttendeeForm = document.getElementById('add-attendee-form');
    const attendeeListContainer = document.getElementById('attendee-list');
    const committeeListContainer = document.getElementById('committee-list-container'); // New selector for committee
    const qrModal = document.getElementById('qr-modal');
    const qrModalCloseBtn = document.querySelector('.close-button');
    const setupScreen = document.getElementById('setup-screen');
    const scannerScreen = document.getElementById('scanner-screen');
    const scanTypeSelect = document.getElementById('scan-type');
    const attendanceOptions = document.getElementById('attendance-options');
    const foodOptions = document.getElementById('food-options');
    const startScanBtn = document.getElementById('start-scan-btn');
    const stopScanBtn = document.getElementById('stop-scan-btn');

    // --- NAVIGATION LOGIC ---
    // Handles switching between the different pages of the dashboard.
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Hide all pages and show the target page
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Update the active state for the navigation link
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
            
            // Important: Stop the camera if navigating away from the scanner page
            if (targetId !== 'scanner' && isScanning) {
                stopScanner();
            }
            
            // Fetch data for the newly displayed page
            if (targetId === 'dashboard') fetchDashboardData();
            if (targetId === 'attendees') fetchAttendees();
            if (targetId === 'committee') displayCommitteeMembers(); // New: Load committee data
        });
    });

    // --- DASHBOARD LOGIC ---
    // Fetches analytics data from the backend and populates the dashboard.
    async function fetchDashboardData() {
        try {
            const response = await fetch(`${API_URL}/api/analytics/summary`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            document.getElementById('total-attendees').textContent = data.total_attendees;
            document.getElementById('total-checkins').textContent = data.total_checkins;
            document.getElementById('total-food-scans').textContent = data.total_food_scans;
            
            updateSessionChart(data.session_attendance);
        } catch (error) { 
            console.error('Error fetching dashboard data:', error); 
        }
    }

    // Renders or updates the session popularity bar chart using Chart.js.
    function updateSessionChart(sessionData) {
        const ctx = document.getElementById('session-chart').getContext('2d');
        const labels = Object.keys(sessionData);
        const data = Object.values(sessionData);
        
        if (sessionChart) sessionChart.destroy(); // Clear previous chart instance
        
        sessionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length > 0 ? labels : ['No Sessions Yet'],
                datasets: [{ 
                    label: 'Check-ins', 
                    data: data.length > 0 ? data : [0], 
                    backgroundColor: 'rgba(0, 168, 255, 0.6)', 
                    borderColor: 'rgba(0, 168, 255, 1)', 
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: { 
                scales: { 
                    y: { beginAtZero: true, ticks: { color: '#e0e0e0', font: { family: "'Poppins', sans-serif" } }, grid: { color: 'rgba(255,255,255,0.1)' } }, 
                    x: { ticks: { color: '#e0e0e0', font: { family: "'Poppins', sans-serif" } }, grid: { display: false } } 
                }, 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { labels: { color: '#e0e0e0', font: { family: "'Poppins', sans-serif" } } } } 
            }
        });
    }

    // --- ATTENDEE MANAGEMENT LOGIC ---
    // Handles the form submission to register a new attendee.
    addAttendeeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const type = document.getElementById('type').value;
        
        try {
            const response = await fetch(`${API_URL}/api/attendees`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ name, email, type }) 
            });
            
            if (response.ok) { 
                alert('Attendee registered successfully!'); 
                addAttendeeForm.reset(); 
                fetchAttendees(); // Refresh the list
            } else { 
                alert('Failed to register attendee. Email might already exist.'); 
            }
        } catch (error) { 
            console.error('Error adding attendee:', error); 
        }
    });

    // Fetches and displays the list of all registered attendees.
    async function fetchAttendees() {
        try {
            const response = await fetch(`${API_URL}/api/attendees`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const attendees = await response.json();
            
            attendeeListContainer.innerHTML = ''; // Clear previous list
            if (attendees.length === 0) { 
                attendeeListContainer.innerHTML = '<p>No attendees registered yet.</p>'; 
                return; 
            }
            
            attendees.forEach(a => {
                const item = document.createElement('div');
                item.className = 'attendee-item';
                item.innerHTML = `
                    <div>
                        <strong>${a.name}</strong>
                        <small>${a.email} - ${a.type}</small>
                    </div>
                    <button class="qr-button" data-token="${a.qr_code_token}" data-name="${a.name}">Show QR</button>
                `;
                attendeeListContainer.appendChild(item);
            });
        } catch (error) { 
            console.error('Error fetching attendees:', error); 
        }
    }

    // --- QR CODE MODAL LOGIC ---
    // Shows the QR code for a specific attendee when the button is clicked.
    attendeeListContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('qr-button')) {
            const token = e.target.dataset.token;
            const name = e.target.dataset.name;
            const qrContainer = document.getElementById('qrcode-container');
            
            qrContainer.innerHTML = ''; // Clear previous QR code
            new QRCode(qrContainer, { text: token, width: 200, height: 200 });
            document.getElementById('qr-modal-name').textContent = name;
            qrModal.style.display = 'flex';
        }
    });
    
    // Event listeners to close the modal.
    qrModalCloseBtn.onclick = () => qrModal.style.display = 'none';
    window.onclick = (e) => { if (e.target == qrModal) qrModal.style.display = 'none'; };

    // --- COMMITTEE MANAGEMENT LOGIC ---
    // Displays a static list of dummy committee members. In a real app, this would fetch from an API.
    function displayCommitteeMembers() {
        const dummyCommittee = [
            { name: 'Rohan Sharma', designation: 'Lead Coordinator', role: 'Admin' },
            { name: 'Priya Singh', designation: 'Logistics Head', role: 'Manager' },
            { name: 'Amit Patel', designation: 'Food Services', role: 'Food Volunteer' },
            { name: 'Sneha Gupta', designation: 'Registration Desk', role: 'Room Volunteer' },
            { name: 'Vikram Rathod', designation: 'Technical Support', role: 'Manager' },
            { name: 'Anjali Desai', designation: 'Session Management', role: 'Room Volunteer' }
        ];

        committeeListContainer.innerHTML = ''; // Clear previous content to prevent duplicates

        dummyCommittee.forEach(member => {
            const memberCard = document.createElement('div');
            memberCard.className = 'committee-member-card';
            
            memberCard.innerHTML = `
                <h3>${member.name}</h3>
                <p>${member.designation}</p>
                <span class="role">${member.role}</span>
            `;
            
            committeeListContainer.appendChild(memberCard);
        });
    }

    // --- SCANNER LOGIC ---
    // Toggles visibility of scanner options based on the selected duty.
    scanTypeSelect.addEventListener('change', () => {
        foodOptions.style.display = scanTypeSelect.value === 'food' ? 'block' : 'none';
        attendanceOptions.style.display = scanTypeSelect.value === 'attendance' ? 'block' : 'none';
    });

    // Starts the QR code scanner.
    startScanBtn.addEventListener('click', () => {
        const scanType = scanTypeSelect.value;
        let context;
        
        if (scanType === 'attendance') {
            context = document.getElementById('session-id').value;
            if (!context) { alert('Please enter a Session ID.'); return; }
            document.getElementById('scanner-title').textContent = `Checking In: ${context}`;
        } else {
            context = document.getElementById('meal-type').value;
            document.getElementById('scanner-title').textContent = `Serving: ${context}`;
        }
        
        setupScreen.classList.remove('active');
        scannerScreen.classList.add('active');
        startScanner(scanType, context);
    });
    
    // Stops the scanner and returns to the setup screen.
    stopScanBtn.addEventListener('click', () => {
        stopScanner();
        scannerScreen.classList.remove('active');
        setupScreen.classList.add('active');
    });

    // Initializes and starts the camera for scanning.
    function startScanner(scanType, context) {
        if (isScanning) return;
        
        html5QrCode = new Html5Qrcode("qr-reader");
        const successCallback = (decodedText) => {
            if(!isScanning) return; // Prevent multiple calls if already stopped
            html5QrCode.pause(); // Pause to prevent scanning the same code multiple times
            handleQrCode(decodedText, scanType, context);
        };
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        isScanning = true;
        html5QrCode.start({ facingMode: "environment" }, config, successCallback)
            .catch(err => console.error("Scanner start failed. Ensure camera permissions are granted.", err));
    }
    
    // Safely stops the scanner and releases the camera.
    function stopScanner() {
        if (!isScanning || !html5QrCode) return;
        
        try {
            html5QrCode.stop().then(() => { 
                isScanning = false; 
                console.log("Scanner stopped successfully."); 
            });
        } catch (err) { 
            console.error("Error stopping scanner", err); 
            isScanning = false; 
        }
    }

    // Handles the scanned QR code data by sending it to the backend.
    async function handleQrCode(token, scanType, context) {
        const endpoint = (scanType === 'attendance') ? `${API_URL}/api/scan/attendance` : `${API_URL}/api/scan/food`;
        const payload = { qr_code_token: token };
        if (scanType === 'attendance') payload.session_id = context;
        else payload.meal_type = context;

        try {
            const response = await fetch(endpoint, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });
            const result = await response.json();
            showResult(result.message, response.ok ? 'success' : 'error');
        } catch (error) { 
            showResult('Network error. Please try again.', 'error'); 
        } finally { 
            // Resume scanning after a short delay to allow user to see the result.
            setTimeout(() => { if(isScanning) html5QrCode.resume(); }, 2000); 
        }
    }

    // Displays a success or error message overlay.
    function showResult(message, type) {
        const overlay = document.getElementById('result-overlay');
        const messageBox = document.getElementById('result-message');
        
        messageBox.textContent = message;
        messageBox.className = `result-message ${type}`;
        overlay.classList.add('visible');
        
        setTimeout(() => overlay.classList.remove('visible'), 2000);
    }

    // --- INITIAL APPLICATION LOAD ---
    // Fetch the initial dashboard data when the page first loads.
    fetchDashboardData();
});
