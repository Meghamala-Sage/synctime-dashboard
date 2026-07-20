import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
} from "aws-lambda";

import {
  SSMClient,
  GetParameterCommand,
  PutParameterCommand
} from "@aws-sdk/client-ssm";

import {
  LambdaClient,
  InvokeCommand
} from "@aws-sdk/client-lambda";

type Connector = "ob" | "obbarclays" | "nordigen";
type Environment = "dev03";
type TriggerMode = "none" | "invoke-listener";

type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type SyncTimes = Record<Weekday, string>;

interface UpdateSyncTimesRequest {
  connector: Connector;
  environment: Environment;
  syncTimes: SyncTimes;
  reason?: string;
  triggerMode?: TriggerMode;
}

const region = process.env.AWS_REGION || "eu-west-1";
const ssm = new SSMClient({ region });
const lambda = new LambdaClient({ region });

const weekdays: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const allowedConnectors = new Set<string>(["ob", "obbarclays", "nordigen"]);
const allowedEnvironments = new Set<string>(["dev03"]);

function response(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    },
    body: JSON.stringify(body)
  };
}

function validateTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}$/.test(value);
}

function validateSyncTimes(value: unknown): asserts value is SyncTimes {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("syncTimes must be an object");
  }

  const obj = value as Record<string, unknown>;
  const actualKeys = Object.keys(obj).sort();
  const expectedKeys = [...weekdays].sort();

  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    throw new Error(`syncTimes must contain exactly: ${weekdays.join(", ")}`);
  }

  for (const day of weekdays) {
    if (typeof obj[day] !== "string" || !validateTime(obj[day] as string)) {
      throw new Error(`Invalid ${day}; expected HH:mm:ss.SSS`);
    }
  }
}

function parseBody(event: APIGatewayProxyEventV2): UpdateSyncTimesRequest {
  if (!event.body) {
    throw new Error("Missing request body");
  }

  const bodyText = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  const parsed = JSON.parse(bodyText);

  const connector = String(parsed.connector || "").toLowerCase() as Connector;
  const environment = String(parsed.environment || "").toLowerCase() as Environment;
  const triggerMode = (parsed.triggerMode || "none") as TriggerMode;

  if (!allowedConnectors.has(connector)) {
    throw new Error(`Unsupported connector: ${parsed.connector}`);
  }

  if (!allowedEnvironments.has(environment)) {
    throw new Error(`Unsupported environment: ${parsed.environment}`);
  }

  if (triggerMode !== "none" && triggerMode !== "invoke-listener") {
    throw new Error(`Unsupported triggerMode: ${parsed.triggerMode}`);
  }

  validateSyncTimes(parsed.syncTimes);

  return {
    connector,
    environment,
    syncTimes: parsed.syncTimes,
    reason: parsed.reason,
    triggerMode
  };
}

function parameterName(connector: Connector, environment: Environment): string {
  return `/bnkc-${connector}-${environment}/SyncTimes`;
}

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const method = event.requestContext.http.method;

    if (method === "OPTIONS") {
      return response(204, {});
    }

    if (method === "GET" && event.rawPath.endsWith("/connectors")) {
      return response(200, {
        environment: "dev03",
        connectors: [
          {
            id: "ob",
            displayName: "Open Banking",
            parameterName: "/bnkc-ob-dev03/SyncTimes"
          },
          {
            id: "obbarclays",
            displayName: "OB Barclays",
            parameterName: "/bnkc-obbarclays-dev03/SyncTimes"
          },
          {
            id: "nordigen",
            displayName: "Nordigen",
            parameterName: "/bnkc-nordigen-dev03/SyncTimes"
          }
        ]
      });
    }

    if (method === "GET" && event.rawPath.endsWith("/sync-times")) {
      const qs = event.queryStringParameters || {};
      const connector = String(qs["connector"] || "").toLowerCase() as Connector;
      const environment = String(qs["environment"] || "").toLowerCase() as Environment;

      if (!allowedConnectors.has(connector)) {
        return response(400, { message: `Unsupported connector: ${qs["connector"]}` });
      }

      if (!allowedEnvironments.has(environment)) {
        return response(400, { message: `Unsupported environment: ${qs["environment"]}` });
      }

      const name = parameterName(connector, environment);

      const current = await ssm.send(
        new GetParameterCommand({ Name: name, WithDecryption: false })
      );

      const rawValue = current.Parameter?.Value;

      if (!rawValue) {
        return response(404, { message: `Parameter ${name} not found in Parameter Store` });
      }

      const syncTimes = JSON.parse(rawValue) as SyncTimes;

      return response(200, {
        connector,
        environment,
        parameterName: name,
        syncTimes
      });
    }

    if (method !== "POST" || !event.rawPath.endsWith("/sync-times")) {
      return response(404, { message: "Not found" });
    }

    const request = parseBody(event);
    const name = parameterName(request.connector, request.environment);

    let previousValue: string | undefined;

    try {
      const current = await ssm.send(
        new GetParameterCommand({
          Name: name,
          WithDecryption: false
        })
      );

      previousValue = current.Parameter?.Value;
    } catch {
      previousValue = undefined;
    }

    const putResult = await ssm.send(
      new PutParameterCommand({
        Name: name,
        Type: "String",
        Value: JSON.stringify(request.syncTimes),
        Overwrite: true
      })
    );

    let listenerInvokeStatus: number | undefined;

    if (request.triggerMode === "invoke-listener") {
      const functionName = process.env.SYNC_TIME_LISTENER_LAMBDA;

      if (!functionName) {
        throw new Error("SYNC_TIME_LISTENER_LAMBDA is not configured");
      }

      const invokeResult = await lambda.send(
        new InvokeCommand({
          FunctionName: functionName,
          InvocationType: "Event",
          Payload: Buffer.from(
            JSON.stringify({
              source: "synctime-dashboard",
              connector: request.connector,
              environment: request.environment,
              parameterName: name,
              syncTimes: request.syncTimes,
              reason: request.reason
            })
          )
        })
      );

      listenerInvokeStatus = invokeResult.StatusCode;
    }

    return response(200, {
      message: "SyncTimes updated",
      connector: request.connector,
      environment: request.environment,
      parameterName: name,
      version: putResult.Version,
      previousValue,
      currentValue: JSON.stringify(request.syncTimes),
      triggerMode: request.triggerMode,
      listenerInvokeStatus
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("SyncTimes update failed", error);

    return response(400, {
      message: "SyncTimes update failed",
      error: message
    });
  }
}