async function fetchUsers() {
  const response = await fetch(`${backendUrl}/users`);
  return await response.json();
}

async function deleteUser(userId) {
  await fetch(`${backendUrl}/users/${userId}`, { method: 'DELETE' });
}