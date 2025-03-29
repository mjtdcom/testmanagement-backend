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

// DOM elements (keep all existing ones)

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

// Updated handleLogin (as shown above)

// Updated handleLogout (as shown above)

function showLogin() {
    if (currentUser) {
        handleLogout();
    } else {
        loginSection.classList.remove('hidden');
        mainContent.classList.add('hidden');
        // Don't clear the fields when showing login
    }
}

function showHome() {
    recordSection.classList.add('hidden');
    viewSection.classList.add('hidden');
    adminSection.classList.add('hidden');
    
    // Show appropriate content based on role
    if (currentUser) {
        if (currentUser.role === 'hr' || currentUser.role === 'procurement') {
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
    
    // Add new test with current user as recorder
    const newTest = {
        id: tests.length + 1,
        name: testName,
        description: description,
        category: category,
        priority: priority,
        createdDate: createdDate,
        recordedBy: currentUser.name,
        status: 'pending' // Default status
    };
    
    tests.push(newTest);
    
    // Clear form but keep date as today
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
    
    // Filter tests - admin sees all, others see only their own
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

function updateTestStatus(id, status) {
    const testIndex = tests.findIndex(test => test.id === id);
    if (testIndex !== -1) {
        tests[testIndex].status = status;
        renderTestsTable();
    }
}

// ... (keep all other existing functions like filterTests, handleAddUser, etc.)

// Update the style section
const style = document.createElement('style');
style.textContent = `
/* ... (keep all existing styles) */

/* Add status badge styles */
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

/* Update role badge colors */
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

/* Keep login form fields on failed attempt */
#login-form input {
    background-color: white;
}
`;
document.head.appendChild(style);
