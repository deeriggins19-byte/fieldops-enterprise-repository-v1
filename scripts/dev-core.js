const { spawn } = require('child_process');

function spawnCommand(command) {
  return spawn(command, {
    stdio: 'inherit',
    shell: true
  });
}

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const apiCommand = `${npmCmd} run dev:api`;
const webCommand = `${npmCmd} run dev:web`;

console.log('Starting FieldOps core dev stack (API + web)...');

const api = spawnCommand(apiCommand);
const web = spawnCommand(webCommand);

let shuttingDown = false;

function stopAll(signal = 'SIGTERM') {
  if (shuttingDown) return;
  shuttingDown = true;

  try {
    api.kill(signal);
  } catch {}

  try {
    web.kill(signal);
  } catch {}
}

function exitWith(code) {
  stopAll('SIGTERM');
  process.exit(code);
}

api.on('exit', (code) => {
  if (!shuttingDown) {
    console.error(`API dev process exited with code ${code ?? 0}. Stopping core stack.`);
    exitWith(code ?? 1);
  }
});

web.on('exit', (code) => {
  if (!shuttingDown) {
    console.error(`Web dev process exited with code ${code ?? 0}. Stopping core stack.`);
    exitWith(code ?? 1);
  }
});

process.on('SIGINT', () => {
  stopAll('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll('SIGTERM');
  process.exit(0);
});
