const API_BASE = process.env.API_URL || process.env.SMOKE_API_URL || 'http://localhost:3001';
const MAX_ATTEMPTS = 5;

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.status;
}

async function main() {
  const testEmail = `lockout-${Date.now()}@example.test`;
  const statuses = [];

  for (let i = 0; i < MAX_ATTEMPTS + 1; i += 1) {
    const status = await login(testEmail, 'definitely-wrong-password');
    statuses.push(status);
  }

  const expected = [...Array(MAX_ATTEMPTS).fill(401), 429];
  const pass = statuses.length === expected.length && statuses.every((s, i) => s === expected[i]);

  if (!pass) {
    console.error(`FAIL auth lockout unexpected statuses: ${statuses.join(', ')}`);
    console.error(`Expected: ${expected.join(', ')}`);
    process.exit(1);
    return;
  }

  console.log(`PASS auth lockout statuses: ${statuses.join(', ')}`);
}

main().catch((err) => {
  console.error(`FAIL auth lockout test error: ${err.message}`);
  process.exit(1);
});
