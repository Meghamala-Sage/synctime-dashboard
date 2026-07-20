/**
 * Local dev server — wraps the same SSM logic as the Lambda handler
 * so the UI can talk to real AWS Parameter Store from your machine.
 *
 * Requires AWS credentials in the standard chain:
 *   - Environment variables  (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)
 *   - ~/.aws/credentials profile
 *   - EC2 / SSO / Container role
 *
 * Usage:  npx ts-node src/server.ts
 */

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { SSMClient, GetParameterCommand, PutParameterCommand } from "@aws-sdk/client-ssm";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const AWS_REGION = process.env.AWS_REGION || "eu-west-1";

const ssm = new SSMClient({ region: AWS_REGION });

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"] }));
app.use(express.json());

// ── Constants ───────────────────────────────────────────────────────────────
const ALLOWED_CONNECTORS = new Set(["ob", "obbarclays", "nordigen"]);
const ALLOWED_ENVIRONMENTS = new Set(["dev03"]);

const CONNECTORS = [
  { id: "ob",          displayName: "Open Banking", parameterName: "/bnkc-ob-dev03/SyncTimes" },
  { id: "obbarclays",  displayName: "OB Barclays",  parameterName: "/bnkc-obbarclays-dev03/SyncTimes" },
  { id: "nordigen",    displayName: "Nordigen",      parameterName: "/bnkc-nordigen-dev03/SyncTimes" }
];

function parameterName(connector: string, environment: string): string {
  return `/bnkc-${connector}-${environment}/SyncTimes`;
}

// ── Routes ──────────────────────────────────────────────────────────────────

/** GET /connectors — list the three connectors */
app.get("/connectors", (_req: Request, res: Response) => {
  res.json({ environment: "dev03", connectors: CONNECTORS });
});

/** GET /sync-times?connector=ob&environment=dev03 — read current value from SSM */
app.get("/sync-times", async (req: Request, res: Response) => {
  const connector   = String(req.query["connector"]   || "").toLowerCase();
  const environment = String(req.query["environment"] || "").toLowerCase();

  if (!ALLOWED_CONNECTORS.has(connector)) {
    res.status(400).json({ message: `Unsupported connector: ${connector}` });
    return;
  }
  if (!ALLOWED_ENVIRONMENTS.has(environment)) {
    res.status(400).json({ message: `Unsupported environment: ${environment}` });
    return;
  }

  const name = parameterName(connector, environment);

  try {
    const result = await ssm.send(
      new GetParameterCommand({ Name: name, WithDecryption: false })
    );

    const rawValue = result.Parameter?.Value;

    if (!rawValue) {
      res.status(404).json({ message: `Parameter ${name} not found in Parameter Store` });
      return;
    }

    res.json({
      connector,
      environment,
      parameterName: name,
      syncTimes: JSON.parse(rawValue)
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to read parameter";
    console.error("[GET /sync-times] SSM error:", err);
    res.status(500).json({ message });
  }
});

/** POST /sync-times — update SSM parameter with new schedule */
app.post("/sync-times", async (req: Request, res: Response) => {
  const { connector, environment, syncTimes, reason, triggerMode = "none" } = req.body as {
    connector: string;
    environment: string;
    syncTimes: Record<string, string>;
    reason?: string;
    triggerMode?: string;
  };

  if (!ALLOWED_CONNECTORS.has(connector)) {
    res.status(400).json({ message: `Unsupported connector: ${connector}` });
    return;
  }
  if (!ALLOWED_ENVIRONMENTS.has(environment)) {
    res.status(400).json({ message: `Unsupported environment: ${environment}` });
    return;
  }
  if (!syncTimes || typeof syncTimes !== "object") {
    res.status(400).json({ message: "syncTimes must be an object" });
    return;
  }

  const name = parameterName(connector, environment);

  // Read the current value so we can return it as previousValue
  let previousValue: string | undefined;
  try {
    const current = await ssm.send(
      new GetParameterCommand({ Name: name, WithDecryption: false })
    );
    previousValue = current.Parameter?.Value;
  } catch {
    previousValue = undefined;
  }

  try {
    const putResult = await ssm.send(
      new PutParameterCommand({
        Name: name,
        Type: "String",
        Value: JSON.stringify(syncTimes),
        Overwrite: true
      })
    );

    console.log(
      `[POST /sync-times] Updated ${name} (v${putResult.Version}) | reason: ${reason ?? "—"}`
    );

    res.json({
      message: "SyncTimes updated",
      connector,
      environment,
      parameterName: name,
      version: putResult.Version,
      previousValue,
      currentValue: JSON.stringify(syncTimes),
      triggerMode
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update parameter";
    console.error("[POST /sync-times] SSM error:", err);
    res.status(500).json({ message });
  }
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[server] Unhandled error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n[SyncTime API] Local dev server  →  http://localhost:${PORT}`);
  console.log(`[SyncTime API] AWS Region         →  ${AWS_REGION}`);
  console.log(`[SyncTime API] Endpoints:`);
  console.log(`  GET  /connectors`);
  console.log(`  GET  /sync-times?connector=<id>&environment=dev03`);
  console.log(`  POST /sync-times\n`);
});
