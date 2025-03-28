const backendUrl = 'https://test-management-backend.onrender.com';
let currentUser = null;

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${backendUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    currentUser = await response.json();
    // Redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error);
  }
}

function handleLogout() {
  currentUser = null;
  window.location.href = '/login.html';
}