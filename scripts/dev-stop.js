const { spawnSync } = require('child_process');

const DRY_RUN = process.argv.includes('--dry-run');

function run(command, args) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function getPidOnPort(port) {
  if (process.platform === 'win32') {
    const script = `
      $conn = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1;
      if ($null -eq $conn) { '' } else { $conn.OwningProcess }
    `;
    const result = run('powershell', ['-NoProfile', '-Command', script]);
    return (result.stdout || '').trim();
  }

  const result = run('sh', ['-lc', `lsof -ti tcp:${port} | head -n 1`]);
  return (result.stdout || '').trim();
}

function getCommandLine(pid) {
  if (!pid) return '';

  if (process.platform === 'win32') {
    const script = `(Get-CimInstance Win32_Process -Filter \"ProcessId = ${pid}\").CommandLine`;
    const result = run('powershell', ['-NoProfile', '-Command', script]);
    return (result.stdout || '').trim();
  }

  const result = run('sh', ['-lc', `ps -p ${pid} -o command=`]);
  return (result.stdout || '').trim();
}

function killPid(pid) {
  if (!pid) return false;

  if (DRY_RUN) return true;

  if (process.platform === 'win32') {
    const result = run('taskkill', ['/PID', String(pid), '/F']);
    return result.status === 0;
  }

  const result = run('kill', ['-9', String(pid)]);
  return result.status === 0;
}

function stopPort(port, label) {
  const pid = getPidOnPort(port);
  if (!pid) {
    console.log(`No listener found on port ${port} (${label}).`);
    return true;
  }

  const cmd = getCommandLine(pid).toLowerCase();
  const looksExpected =
    (port === '3000' && cmd.includes('next')) ||
    (port === '3001' && (cmd.includes('nest') || cmd.includes('apps\\api') || cmd.includes('apps/api')));

  if (!looksExpected) {
    console.error(`Port ${port} is used by PID ${pid}, but it does not look like ${label}.`);
    console.error('Refusing to kill unexpected process automatically.');
    return false;
  }

  const action = DRY_RUN ? 'Would stop' : 'Stopping';
  console.log(`${action} ${label} on port ${port} (PID ${pid})...`);

  const killed = killPid(pid);
  if (!killed) {
    console.error(`Failed to stop PID ${pid} on port ${port}.`);
    return false;
  }

  if (!DRY_RUN) {
    console.log(`Stopped ${label} on port ${port}.`);
  }
  return true;
}

function main() {
  const webOk = stopPort('3000', 'web server');
  const apiOk = stopPort('3001', 'api server');

  if (!webOk || !apiOk) {
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('Dry run complete.');
  } else {
    console.log('Dev services stop check complete.');
  }
}

main();
