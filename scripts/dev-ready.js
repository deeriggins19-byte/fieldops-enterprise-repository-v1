const path = require('path');
const { spawn, spawnSync } = require('child_process');

const MAX_ATTEMPTS = 30;
const RETRY_DELAY_MS = 3000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startDetachedNodeScript(relativeScriptPath) {
  const scriptPath = path.join(__dirname, relativeScriptPath);
  const child = spawn(process.execPath, [scriptPath], {
    detached: true,
    stdio: 'ignore',
    shell: false
  });
  child.unref();
}

function runSmoke(quiet = false) {
  const smokePath = path.join(__dirname, 'dev-smoke.js');
  const stdio = quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit';
  const result = spawnSync(process.execPath, [smokePath], { stdio });
  if (result.error) return 1;
  if (typeof result.status !== 'number') return 1;
  return result.status;
}

async function main() {
  const initialStatus = runSmoke(false);
  if (initialStatus === 0) {
    console.log('Core services already healthy.');
    process.exit(0);
    return;
  }

  console.log('Smoke check failed. Starting dev:api and dev:web in background and waiting for readiness...');
  startDetachedNodeScript('dev-api.js');
  startDetachedNodeScript('dev-web.js');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    await sleep(RETRY_DELAY_MS);
    const status = runSmoke(true);
    if (status === 0) {
      console.log(`Core services became healthy on attempt ${attempt}.`);
      const finalStatus = runSmoke(false);
      process.exit(finalStatus);
      return;
    }
  }

  console.error('Core services did not become healthy in time.');
  process.exit(1);
}

main().catch((err) => {
  console.error(`dev:ready failed: ${err.message}`);
  process.exit(1);
});
