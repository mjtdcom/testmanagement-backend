async function fetchTests() {
  const response = await fetch(`${backendUrl}/tests`);
  return await response.json();
}

async function addTest(newTest) {
  await fetch(`${backendUrl}/tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTest),
  });
}

async function renderTestsTable() {
  const tests = await fetchTests();
  // Render table logic...
}