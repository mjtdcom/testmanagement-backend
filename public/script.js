// Updated user database with Officer, HR, and Procurement
const users = [
    { username: 'officer', password: 'admin123', role: 'admin', name: 'System Officer' },
    { username: 'hr', password: 'hr123', role: 'hr', name: 'HR Department' },
    { username: 'procurement', password: 'proc123', role: 'procurement', name: 'Procurement Team' }
];

// Test database with status field
let tests = [
    { 
        id: 1, 
        name: 'Login Functionality', 
        description: 'Test user login with valid and invalid credentials', 
        category: 'Functional', 
        priority: 'High', 
        createdDate: '2023-05-15', 
        recordedBy: 'HR Department',
        status: 'approved'
    },
    { 
        id: 2, 
        name: 'Load Test', 
        description: 'Test system performance under 1000 concurrent users', 
        category: 'Performance', 
        priority: 'Medium', 
        createdDate: '2023-05-10', 
        recordedBy: 'Procurement Team',
        status: 'pending'
    }
];

// Current user
let currentUser = null;

// DOM elements
const loginSection = document.getElementById('login-section');
const mainContent = document.getElementById('main-content');
const recordSection = document.getElementById('record-section');
const viewSection = document.getElementById('view-section');
const adminSection = document.getElementById('admin-section');
const loginForm = document.getElementById('login-form');
const recordForm = document.getElementById('record-form');
const userForm = document.getElementById('user-form');
const loginError = document.getElementById('login-error');
const recordError = document.getElementById('record-error');
const recordSuccess = document.getElementById('record-success');
const welcomeMessage = document.getElementById('welcome-message');
const testsTableBody = document.getElementById('tests-table-body');
const usersTableBody = document.getElementById('users-table-body');
const searchTestsInput = document.getElementById('search-tests');
const homeLink = document.getElementById('home-link');
const recordLink = document.getElementById('record-link');
const viewLink = document.getElementById('view-link');
const adminLink = document.getElementById('admin-link');
const logoutLink = document.getElementById('logout-link');
const loginLink = document.getElementById('login-link');
const addUserBtn = document.getElementById('add-user-btn');
const cancelUserBtn = document.getElementById('cancel-user-btn');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default for created date
    document.getElementById('test-created-date').valueAsDate = new Date();
    
    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    recordForm.addEventListener('submit', handleRecordTest);
    homeLink.addEventListener('click', showHome);
    recordLink.addEventListener('click', showRecordSection);
    viewLink.addEventListener('click', showViewSection);
    adminLink.addEventListener('click', showAdminSection);
    logoutLink.addEventListener('click', handleLogout);
    loginLink.addEventListener('click', showLogin);
    addUserBtn.addEventListener('click', showAddUserForm);
    cancelUserBtn.addEventListener('click', hideAddUserForm);
    userForm.addEventListener('submit', handleAddUser);
    searchTestsInput.addEventListener('input', filterTests);
    
    // Initially show login section
    showLogin();
});

// Login function
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        loginSection.classList.add('hidden');
        mainContent.classList.remove('hidden');
        welcomeMessage.textContent = `Welcome, ${user.name}!`;
        
        // Show/hide admin link based on role
        if (user.role === 'admin') {
            adminLink.classList.remove('hidden');
        } else {
            adminLink.classList.add('hidden');
        }
        
        showHome();
    } else {
        loginError.textContent = 'Invalid username or password';
        loginError.classList.remove('hidden');
    }
}

// Logout function
function handleLogout() {
    currentUser = null;
    mainContent.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginError.classList.add('hidden');
    loginForm.reset();
}

// Navigation functions
function showLogin() {
    loginSection.classList.remove('hidden');
    mainContent.classList.add('hidden');
}

function showHome() {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    recordSection.classList.add('hidden');
    viewSection.classList.add('hidden');
    adminSection.classList.add('hidden');
    
    // Redirect to appropriate section based on role
    if (currentUser.role === 'hr' || currentUser.role === 'procurement') {
        showRecordSection();
    } else {
        showViewSection();
    }
}

function showRecordSection() {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    recordSection.classList.remove('hidden');
    viewSection.classList.add('hidden');
    adminSection.classList.add('hidden');
    document.getElementById('test-created-date').valueAsDate = new Date();
}

function showViewSection() {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    recordSection.classList.add('hidden');
    viewSection.classList.remove('hidden');
    adminSection.classList.add('hidden');
    renderTestsTable();
}

function showAdminSection() {
    if (!currentUser || currentUser.role !== 'admin') {
        showLogin();
        return;
    }
    
    recordSection.classList.add('hidden');
    viewSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    renderUsersTable();
}

// Test record function
function handleRecordTest(e) {
    e.preventDefault();
    recordError.classList.add('hidden');
    recordSuccess.classList.add('hidden');
    
    const testName = document.getElementById('test-name').value;
    const description = document.getElementById('test-description').value;
    const category = document.getElementById('test-category').value;
    const priority = document.getElementById('test-priority').value;
    const createdDate = document.getElementById('test-created-date').value;
    
    if (!testName || !description || !category || !priority || !createdDate) {
        recordError.textContent = 'All fields are required';
        recordError.classList.remove('hidden');
        return;
    }
    
    const newTest = {
        id: tests.length > 0 ? Math.max(...tests.map(t => t.id)) + 1 : 1,
        name: testName,
        description: description,
        category: category,
        priority: priority,
        createdDate: createdDate,
        recordedBy: currentUser.name,
        status: 'pending'
    };
    
    tests.push(newTest);
    recordForm.reset();
    document.getElementById('test-created-date').valueAsDate = new Date();
    
    recordSuccess.textContent = 'Test recorded successfully!';
    recordSuccess.classList.remove('hidden');
    
    if (viewSection.classList.contains('hidden') {
        renderTestsTable();
    }
}

// Render tests table
function renderTestsTable() {
    testsTableBody.innerHTML = '';
    
    let filteredTests = tests;
    if (currentUser.role !== 'admin') {
        filteredTests = tests.filter(test => test.recordedBy === currentUser.name);
    }
    
    if (filteredTests.length === 0) {
        testsTableBody.innerHTML = '<tr><td colspan="8">No tests found</td></tr>';
        return;
    }
    
    filteredTests.forEach(test => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${test.name}</td>
            <td>${test.description}</td>
            <td>${test.category}</td>
            <td><span class="priority-badge ${test.priority.toLowerCase()}">${test.priority}</span></td>
            <td>${test.createdDate}</td>
            <td>${test.recordedBy}</td>
            <td><span class="status-badge ${test.status}">${test.status.charAt(0).toUpperCase() + test.status.slice(1)}</span></td>
            <td>
                ${currentUser.role === 'admin' ? `
                <div class="status-actions">
                    <button class="btn primary approve-test" data-id="${test.id}" ${test.status === 'approved' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn secondary pending-test" data-id="${test.id}" ${test.status === 'pending' ? 'disabled' : ''}>
                        <i class="fas fa-clock"></i> Pending
                    </button>
                </div>
                ` : ''}
            </td>
        `;
        testsTableBody.appendChild(row);
    });
    
    // Add event listeners to status buttons
    document.querySelectorAll('.approve-test').forEach(button => {
        button.addEventListener('click', function() {
            const testId = parseInt(this.getAttribute('data-id'));
            updateTestStatus(testId, 'approved');
        });
    });
    
    document.querySelectorAll('.pending-test').forEach(button => {
        button.addEventListener('click', function() {
            const testId = parseInt(this.getAttribute('data-id'));
            updateTestStatus(testId, 'pending');
        });
    });
}

// Update test status
function updateTestStatus(id, status) {
    const testIndex = tests.findIndex(test => test.id === id);
    if (testIndex !== -1) {
        tests[testIndex].status = status;
        renderTestsTable();
    }
}

// Filter tests
function filterTests() {
    const searchTerm = searchTestsInput.value.toLowerCase();
    const rows = testsTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// User management functions
function showAddUserForm() {
    document.getElementById('user-form-container').classList.remove('hidden');
    addUserBtn.classList.add('hidden');
}

function hideAddUserForm() {
    document.getElementById('user-form-container').classList.add('hidden');
    addUserBtn.classList.remove('hidden');
    userForm.reset();
}

function handleAddUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const name = document.getElementById('new-name').value;
    const role = document.getElementById('new-role').value;
    
    if (!username || !password || !name || !role) {
        alert('All fields are required');
        return;
    }
    
    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    
    const newUser = {
        username,
        password,
        role,
        name
    };
    
    users.push(newUser);
    renderUsersTable();
    hideAddUserForm();
}

function renderUsersTable() {
    usersTableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.name}</td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
        `;
        usersTableBody.appendChild(row);
    });
}

// Add styles
const style = document.createElement('style');
style.textContent = `
.hidden {
    display: none;
}

.priority-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 50rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.priority-badge.high {
    background-color: #f8d7da;
    color: #721c24;
}

.priority-badge.medium {
    background-color: #fff3cd;
    color: #856404;
}

.priority-badge.low {
    background-color: #d4edda;
    color: #155724;
}

.status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 50rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.status-badge.approved {
    background-color: #d4edda;
    color: #155724;
}

.status-badge.pending {
    background-color: #fff3cd;
    color: #856404;
}

.role-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 50rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
}

.role-badge.admin {
    background-color: #d4edda;
    color: #155724;
}

.role-badge.hr {
    background-color: #cce5ff;
    color: #004085;
}

.role-badge.procurement {
    background-color: #f8d7da;
    color: #721c24;
}

.status-actions {
    display: flex;
    gap: 0.5rem;
}

.btn {
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    cursor: pointer;
    border: 1px solid transparent;
}

.btn.primary {
    background-color: #007bff;
    color: white;
}

.btn.secondary {
    background-color: #6c757d;
    color: white;
}

.btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
}

th {
    background-color: #f8f9fa;
    font-weight: 600;
}

form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 600;
}

.form-group input, 
.form-group select, 
.form-group textarea {
    padding: 0.375rem 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
}

.error {
    color: #dc3545;
    font-size: 0.875rem;
}

.success {
    color: #28a745;
    font-size: 0.875rem;
}
`;
document.head.appendChild(style);
