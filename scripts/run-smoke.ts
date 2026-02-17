
import { spawn, execSync } from 'child_process';

const PORT = 9002;
const BASE_URL = `http://localhost:${PORT}`;

async function waitForServer() {
  console.log('Waiting for server to be ready...');
  for (let i = 0; i < 60; i++) { // 60s timeout
    try {
      const res = await fetch(`${BASE_URL}/api/health`); // Or just root
      if (res.ok || res.status < 500) return true;
    } catch (e) {
      // ignore
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

async function run() {
  console.log('Starting Smoke Test (Regression Check)...');

  // Start Next.js Server in Background (Without CHAOS, Using Mock DB)
  const server = spawn('npm', ['run', 'dev'], {
    env: { ...process.env, PORT: String(PORT), USE_MOCK_DB: 'true' },
    stdio: 'inherit',
    detached: true,
  });

  try {
    // Wait for server
    // Since we don't have /api/chaos to probe, we probe root
    // But root might redirect. Fetch follows redirects by default? No, node-fetch depends.
    // We just wait for something on port 9002.
    // I'll try fetching the student API which should work.

    let ready = false;
    for (let i = 0; i < 60; i++) {
        try {
            const res = await fetch(`${BASE_URL}/api/chaos`); // Check API availability first
            // Wait, chaos API is disabled in smoke mode? Yes.
            // Check health or seed endpoint
            const res2 = await fetch(`${BASE_URL}/api/test/seed`); // Check if responsive
            if (res2.status < 500) { ready = true; break; }
        } catch (e) {}
        await new Promise(r => setTimeout(r, 1000));
    }

    if (!ready) {
      console.error('Server failed to start in time.');
      process.kill(-server.pid!);
      process.exit(1);
    }

    // Seed Mock DB
    console.log('Seeding Mock DB...');
    await fetch(`${BASE_URL}/api/test/seed`, { method: 'POST' });

    console.log('Server is ready. Running Smoke Tests...');

    execSync(`npx playwright test e2e/smoke.spec.ts`, {
      stdio: 'inherit',
      env: { ...process.env, PORT: String(PORT) }
    });
    console.log('Smoke Tests Passed.');

  } catch (e) {
    console.error('Smoke Tests Failed.');
    throw e;
  } finally {
    if (server.pid) process.kill(-server.pid);
  }
}

run().catch(console.error);
