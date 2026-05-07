import { execSync } from 'node:child_process';
import { platform } from 'node:os';

const PORT = Number(process.env.DEV_PORT ?? 5200);
const STALE_HOURS = Number(process.env.STALE_HOURS ?? 2);
const STALE_MS = STALE_HOURS * 60 * 60 * 1000;
const isWin = platform() === 'win32';

function findPidOnPort(port) {
  try {
    if (isWin) {
      const out = execSync(
        `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess"`,
        { encoding: 'utf8' },
      ).trim();
      return out ? Number(out) : null;
    }
    const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out ? Number(out.split('\n')[0]) : null;
  } catch {
    return null;
  }
}

function getStartTimeMs(pid) {
  try {
    if (isWin) {
      const out = execSync(
        `powershell -NoProfile -Command "(Get-Process -Id ${pid}).StartTime.ToString('o')"`,
        { encoding: 'utf8' },
      ).trim();
      const t = Date.parse(out);
      return Number.isFinite(t) ? t : null;
    }
    const out = execSync(`ps -o lstart= -p ${pid}`, { encoding: 'utf8' }).trim();
    const t = Date.parse(out);
    return Number.isFinite(t) ? t : null;
  } catch {
    return null;
  }
}

function killPid(pid) {
  try {
    if (isWin) {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    } else {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
}

const pid = findPidOnPort(PORT);
if (!pid) process.exit(0);

const start = getStartTimeMs(pid);
if (start === null) {
  console.log(`[predev] Port ${PORT} held by PID ${pid}; couldn't read process age, leaving it alone.`);
  process.exit(0);
}

const ageMs = Date.now() - start;
const ageH = (ageMs / 3_600_000).toFixed(1);

if (ageMs >= STALE_MS) {
  console.log(`[predev] Port ${PORT} held by PID ${pid} for ${ageH}h (>= ${STALE_HOURS}h). Killing stale process.`);
  if (!killPid(pid)) console.log(`[predev] Failed to kill PID ${pid}; vite will report the port conflict.`);
} else {
  console.log(`[predev] Port ${PORT} held by PID ${pid} for ${ageH}h (< ${STALE_HOURS}h). Leaving it alone — vite will report the conflict.`);
}
