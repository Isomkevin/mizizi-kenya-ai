const AGENTS_URL = process.env.MASUMI_AGENTS_URL ?? "http://localhost:8080";
const MAX_ATTEMPTS = 30;
const DELAY_MS = 2000;

async function waitForAgents(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`${AGENTS_URL.replace(/\/$/, "")}/health`);
      if (response.ok) {
        const json = (await response.json()) as { status?: string };
        if (json.status === "ok") {
          console.log(`Masumi agents ready at ${AGENTS_URL}`);
          return;
        }
      }
    } catch {
      // retry
    }
    console.log(`Waiting for Masumi agents (${attempt}/${MAX_ATTEMPTS})…`);
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }
  throw new Error(`Masumi agents not reachable at ${AGENTS_URL}`);
}

await waitForAgents();
