const { spawn, spawnSync } = require('child_process');

const PORT = process.env.API_PORT || '3001';

function runCommand(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options
  });
}

function getPidOnPort(port) {
  if (process.platform === 'win32') {
    const script = `
      $conn = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1;
      if ($null -eq $conn) { '' } else { $conn.OwningProcess }
    `;
    const result = runCommand('powershell', ['-NoProfile', '-Command', script]);
    return (result.stdout || '').trim();
  }

  const result = runCommand('sh', ['-lc', `lsof -ti tcp:${port} | head -n 1`]);
  return (result.stdout || '').trim();
}

function getProcessCommandLine(pid) {
  if (!pid) return '';

  if (process.platform === 'win32') {
    const script = `(Get-CimInstance Win32_Process -Filter \"ProcessId = ${pid}\").CommandLine`;
    const result = runCommand('powershell', ['-NoProfile', '-Command', script]);
    return (result.stdout || '').trim();
  }

  const result = runCommand('sh', ['-lc', `ps -p ${pid} -o command=`]);
  return (result.stdout || '').trim();
}

function killProcess(pid) {
  if (!pid) return false;

  if (process.platform === 'win32') {
    const result = runCommand('taskkill', ['/PID', String(pid), '/F']);
    return result.status === 0;
  }

  const result = runCommand('kill', ['-9', String(pid)]);
  return result.status === 0;
}

function startApiDev() {
  const command = process.platform === 'win32'
    ? 'npm.cmd --workspace @fieldops/api run dev'
    : 'npm --workspace @fieldops/api run dev';

  const child = spawn(command, {
    stdio: 'inherit',
    shell: true
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

function main() {
  const pid = getPidOnPort(PORT);

  if (!pid) {
    console.log(`No listener on port ${PORT}. Starting API dev server...`);
    startApiDev();
    return;
  }

  const commandLine = getProcessCommandLine(pid).toLowerCase();
  const looksLikeApiProcess =
    commandLine.includes('nest') ||
    commandLine.includes('apps\\api') ||
    commandLine.includes('fieldops-enterprise-repository-v1\\apps\\api');

  if (!looksLikeApiProcess) {
    console.error(`Port ${PORT} is in use by PID ${pid}.`);
    console.error('Refusing to kill a non-API process. Free the port manually and retry.');
    process.exit(1);
    return;
  }

  console.log(`Port ${PORT} is in use by an API process (PID ${pid}). Restarting it...`);
  const killed = killProcess(pid);
  if (!killed) {
    console.error(`Failed to stop PID ${pid}.`);
    process.exit(1);
    return;
  }

  startApiDev();
}

main();
