// Sample user database (in a real app, this would be server-side)
const users = [
    { username: 'tester1', password: 'test123', role: 'tester', name: 'John Tester' },
    { username: 'lead1', password: 'lead123', role: 'lead', name: 'Sarah Lead' },
    { username: 'admin1', password: 'admin123', role: 'admin', name: 'Admin User' }
];

// Sample test database
let tests = [
    { 
        id: 1, 
        name: 'Login Functionality', 
        description: 'Test user login with valid and invalid credentials', 
        category: 'Functional', 
        priority: 'High', 
        createdDate: '2023-05-15', 
        recordedBy: 'John Tester' 
    },
    { 
        id: 2, 
        name: 'Load Test', 
        description: 'Test system performance under 1000 concurrent users', 
        category: 'Performance', 
        priority: 'Medium', 
        createdDate: '2023-05-10', 
        recordedBy: 'Sarah Lead' 
    }
];

// Current user
let currentUser = null;

// DOM elements
const loginSection = document.getElementById('login-section');
const mainContent = document.getElementById('main-content');
const welcomeMessage = document.getElementById('welcome-message');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const recordSection = document.getElementById('record-section');
const viewSection = document.getElementById('view-section');
const adminSection = document.getElementById('admin-section');
const recordForm = document.getElementById('record-form');
const recordError = document.getElementById('record-error');
const recordSuccess = document.getElementById('record-success');
const testsTableBody = document.getElementById('tests-table-body');
const usersTableBody = document.getElementById('users-table-body');
const userForm = document.getElementById('user-form');
const addUserForm = document.getElementById('add-user-form');
const addUserBtn = document.getElementById('add-user-btn');
const cancelUserBtn = document.getElementById('cancel-user-btn');
const adminError = document.getElementById('admin-error');
const adminSuccess = document.getElementById('admin-success');
const searchTestsInput = document.getElementById('search-tests');

// Navigation links
const homeLink = document.getElementById('home-link');
const recordLink = document.getElementById('record-link');
const viewLink = document.getElementById('view-link');
const adminLink = document.getElementById('admin-link');
const logoutLink = document.getElementById('logout-link');
const loginLink = document.getElementById('login-link');

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

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Find user in database
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        loginError.classList.add('hidden');
        loginSection.classList.add('hidden');
        mainContent.classList.remove('hidden');
        welcomeMessage.innerHTML = `<i class="fas fa-smile"></i> Welcome, ${user.name}!`;
        
        // Show appropriate navigation based on role
        document.querySelectorAll('.login-visible').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        
        logoutLink.classList.remove('hidden');
        recordLink.classList.remove('hidden');
        viewLink.classList.remove('hidden');
        
        if (user.role === 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        }
        
        // Show home by default
        showHome();
    } else {
        loginError.textContent = 'Invalid username or password';
        loginError.classList.remove('hidden');
    }
}

function handleLogout() {
    currentUser = null;
    mainContent.classList.add('hidden');
    loginSection.classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    // Reset navigation
    document.querySelectorAll('.login-visible').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
    logoutLink.classList.add('hidden');
}

function showLogin() {
    if (currentUser) {
        handleLogout();
    } else {
        loginSection.classList.remove('hidden');
        mainContent.classList.add('hidden');
    }
}

function showHome() {
    recordSection.classList.add('hidden');
    viewSection.classList.add('hidden');
    adminSection.classList.add('hidden');
    
    // Show appropriate content based on role
    if (currentUser) {
        if (currentUser.role === 'tester') {
            showRecordSection();
        } else {
            showViewSection();
        }
    }
}

function showRecordSection() {
    recordSection.classList.remove('hidden');
    viewSection.classList.add('hidden');
    adminSection.classList.add('hidden');
    document.getElementById('test-created-date').valueAsDate = new Date();
}

function showViewSection() {
    recordSection.classList.add('hidden');
    viewSection.classList.remove('hidden');
    adminSection.classList.add('hidden');
    renderTestsTable();
}

function showAdminSection() {
    if (currentUser && currentUser.role === 'admin') {
        recordSection.classList.add('hidden');
        viewSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        renderUsersTable();
    }
}

function handleRecordTest(e) {
    e.preventDefault();
    recordError.classList.add('hidden');
    recordSuccess.classList.add('hidden');
    
    const testName = document.getElementById('test-name').value;
    const description = document.getElementById('test-description').value;
    const category = document.getElementById('test-category').value;
    const priority = document.getElementById('test-priority').value;
    const createdDate = document.getElementById('test-created-date').value;
    
    // Basic validation
    if (!testName || !description || !category || !priority || !createdDate) {
        recordError.textContent = 'All fields are required';
        recordError.classList.remove('hidden');
        return;
    }
    
    // Add new test
    const newTest = {
        id: tests.length + 1,
        name: testName,
        description: description,
        category: category,
        priority: priority,
        createdDate: createdDate,
        recordedBy: currentUser.name
    };
    
    tests.push(newTest);
    
    // Clear form
    recordForm.reset();
    document.getElementById('test-created-date').valueAsDate = new Date();
    
    // Show success message
    recordSuccess.textContent = 'Test recorded successfully!';
    recordSuccess.classList.remove('hidden');
    
    // Update tests table if it's visible
    if (!viewSection.classList.contains('hidden')) {
        renderTestsTable();
    }
}

function renderTestsTable() {
    testsTableBody.innerHTML = '';
    
    if (tests.length === 0) {
        testsTableBody.innerHTML = '<tr><td colspan="7">No unassigned tests found</td></tr>';
        return;
    }
    
    tests.forEach(test => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${test.name}</td>
            <td>${test.description}</td>
            <td>${test.category}</td>
            <td><span class="priority-badge ${test.priority.toLowerCase()}">${test.priority}</span></td>
            <td>${test.createdDate}</td>
            <td>${test.recordedBy}</td>
            <td>
                ${currentUser.role === 'admin' ? `<button class="btn danger delete-test" data-id="${test.id}"><i class="fas fa-trash-alt"></i> Delete</button>` : ''}
            </td>
        `;
        testsTableBody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-test').forEach(button => {
        button.addEventListener('click', function() {
            const testId = parseInt(this.getAttribute('data-id'));
            deleteTest(testId);
        });
    });
}

function filterTests() {
    const searchTerm = searchTestsInput.value.toLowerCase();
    const rows = testsTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function deleteTest(id) {
    if (confirm('Are you sure you want to delete this test?')) {
        tests = tests.filter(test => test.id !== id);
        renderTestsTable();
    }
}

function showAddUserForm() {
    addUserForm.classList.remove('hidden');
    userForm.reset();
    adminError.classList.add('hidden');
    adminSuccess.classList.add('hidden');
}

function hideAddUserForm() {
    addUserForm.classList.add('hidden');
}

function handleAddUser(e) {
    e.preventDefault();
    adminError.classList.add('hidden');
    adminSuccess.classList.add('hidden');
    
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('user-role').value;
    
    // Basic validation
    if (!username || !password || !role) {
        adminError.textContent = 'All fields are required';
        adminError.classList.remove('hidden');
        return;
    }
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
        adminError.textContent = 'Username already exists';
        adminError.classList.remove('hidden');
        return;
    }
    
    // Add new user (in a real app, this would be a server call)
    const newUser = {
        username: username,
        password: password,
        role: role,
        name: username.charAt(0).toUpperCase() + username.slice(1) + ' ' + (role === 'admin' ? 'Admin' : role === 'lead' ? 'Lead' : 'Tester')
    };
    
    users.push(newUser);
    
    // Show success message
    adminSuccess.textContent = 'User added successfully!';
    adminSuccess.classList.remove('hidden');
    
    // Update users table
    renderUsersTable();
    
    // Hide form after a delay
    setTimeout(hideAddUserForm, 1500);
}

function renderUsersTable() {
    usersTableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td><span class="role-badge ${user.role}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></td>
            <td>
                ${user.username !== currentUser.username ? `<button class="btn danger delete-user" data-username="${user.username}"><i class="fas fa-trash-alt"></i> Delete</button>` : ''}
            </td>
        `;
        usersTableBody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            deleteUser(username);
        });
    });
}

function deleteUser(username) {
    if (confirm('Are you sure you want to delete this user?')) {
        const index = users.findIndex(u => u.username === username);
        if (index !== -1) {
            users.splice(index, 1);
            renderUsersTable();
        }
    }
}

// Add some CSS for badges
const style = document.createElement('style');
style.textContent = `
.priority-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 50rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
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
    background-color: #d1ecf1;
    color: #0c5460;
}

.role-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 50rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.role-badge.admin {
    background-color: #d4edda;
    color: #155724;
}

.role-badge.lead {
    background-color: #cce5ff;
    color: #004085;
}

.role-badge.tester {
    background-color: #e2e3e5;
    color: #383d41;
}
`;
document.head.appendChild(style);
