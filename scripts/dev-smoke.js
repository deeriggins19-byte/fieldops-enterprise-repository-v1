const fs = require('fs');
const path = require('path');

function readDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const out = {};
  const text = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const idx = line.indexOf('=');
    if (idx < 1) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    out[key] = value;
  }

  return out;
}

function firstDefined(...values) {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

async function requestJson(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    let body = null;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    return { ok: res.ok, status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

function pass(msg) {
  console.log(`PASS ${msg}`);
}

function fail(msg) {
  console.error(`FAIL ${msg}`);
}

async function main() {
  const envFile = path.join(__dirname, '..', '.env');
  const fileEnv = readDotEnv(envFile);

  const apiBase = firstDefined(
    process.env.SMOKE_API_URL,
    process.env.API_URL,
    fileEnv.SMOKE_API_URL,
    fileEnv.API_URL,
    'http://localhost:3001'
  );

  const webBase = firstDefined(
    process.env.SMOKE_WEB_URL,
    process.env.WEB_URL,
    fileEnv.SMOKE_WEB_URL,
    fileEnv.WEB_URL,
    'http://localhost:3000'
  );

  const email = firstDefined(
    process.env.SEED_OWNER_EMAIL,
    fileEnv.SEED_OWNER_EMAIL,
    'admin@fieldops.local'
  );

  const password = firstDefined(
    process.env.SEED_OWNER_PASSWORD,
    fileEnv.SEED_OWNER_PASSWORD,
    'FieldOps2026!'
  );

  let failed = false;

  try {
    const health = await requestJson(`${apiBase}/health`);
    if (!health.ok) {
      failed = true;
      fail(`API health check failed (${health.status}) at ${apiBase}/health`);
    } else {
      pass(`API health check (${health.status})`);
    }
  } catch (err) {
    failed = true;
    fail(`API health request error: ${err.message}`);
  }

  try {
    const web = await requestJson(`${webBase}/login`);
    if (!web.ok) {
      failed = true;
      fail(`Web login page check failed (${web.status}) at ${webBase}/login`);
    } else {
      pass(`Web login page reachable (${web.status})`);
    }
  } catch (err) {
    failed = true;
    fail(`Web page request error: ${err.message}`);
  }

  let token;
  try {
    const login = await requestJson(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!login.ok) {
      failed = true;
      fail(`Auth login failed (${login.status}) for ${email}`);
    } else {
      token = login.body && login.body.token;
      if (!token) {
        failed = true;
        fail('Auth login succeeded but token is missing from response');
      } else {
        pass('Auth login succeeded and returned token');
      }
    }
  } catch (err) {
    failed = true;
    fail(`Auth login request error: ${err.message}`);
  }

  if (token) {
    try {
      const ai = await requestJson(`${apiBase}/ai/troubleshoot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ assetCode: 'SMOKE-001', issue: 'sanity check' })
      });

      if (!ai.ok) {
        failed = true;
        fail(`AI authenticated route failed (${ai.status})`);
      } else {
        pass('AI authenticated route succeeded');
      }
    } catch (err) {
      failed = true;
      fail(`AI route request error: ${err.message}`);
    }
  }

  if (failed) {
    process.exitCode = 1;
    console.error('RESULT Dev smoke check failed.');
  } else {
    console.log('RESULT Dev smoke check passed.');
  }
}

main().catch((err) => {
  console.error(`FAIL Unexpected smoke script error: ${err.message}`);
  process.exit(1);
});
