function getOvhConfig() {
  return {
    applicationKey: Deno.env.get("OVH_APPLICATION_KEY"),
    applicationSecret: Deno.env.get("OVH_APPLICATION_SECRET"),
    consumerKey: Deno.env.get("OVH_CONSUMER_KEY"),
    serviceName: Deno.env.get("OVH_SMS_SERVICE_NAME"),
    sender: Deno.env.get("OVH_SMS_SENDER") ?? "Prudency",
  };
}

async function computeOvhSignature(
  applicationSecret: string,
  consumerKey: string,
  method: string,
  url: string,
  body: string,
  timestamp: number,
): Promise<string> {
  const toSign = `${applicationSecret}+${consumerKey}+${method}+${url}+${body}+${timestamp}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(toSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `$1$${hashHex}`;
}

export interface OvhSmsResult {
  messageId: string;
}

interface OvhSmsResponse {
  ids: number[];
  invalidReceivers: string[];
  totalCreditsRemoved: number;
  validReceivers: string[];
}

export function isOvhConfigured(): boolean {
  const cfg = getOvhConfig();
  return !!(
    cfg.applicationKey &&
    cfg.applicationSecret &&
    cfg.consumerKey &&
    cfg.serviceName
  );
}

export async function sendSmsViaOvh(
  to: string,
  message: string,
): Promise<OvhSmsResult> {
  const cfg = getOvhConfig();
  if (!cfg.applicationKey || !cfg.applicationSecret || !cfg.consumerKey || !cfg.serviceName) {
    throw new Error("SMS service not configured");
  }

  const ovhUrl = `https://eu.api.ovh.com/1.0/sms/${cfg.serviceName}/jobs`;
  const ovhBody = JSON.stringify({
    charset: "UTF-8",
    coding: "7bit",
    message,
    noStopClause: true,
    priority: "high",
    receivers: [to],
    sender: cfg.sender,
    validityPeriod: 2880,
  });

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await computeOvhSignature(
    cfg.applicationSecret,
    cfg.consumerKey,
    "POST",
    ovhUrl,
    ovhBody,
    timestamp,
  );

  const ovhResponse = await fetch(ovhUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Ovh-Application": cfg.applicationKey,
      "X-Ovh-Timestamp": String(timestamp),
      "X-Ovh-Signature": signature,
      "X-Ovh-Consumer": cfg.consumerKey,
    },
    body: ovhBody,
  });

  if (!ovhResponse.ok) {
    console.error("OVH SMS API error: status", ovhResponse.status);
    throw new Error("Failed to send SMS");
  }

  const ovhData: OvhSmsResponse = await ovhResponse.json();

  if (ovhData.invalidReceivers.length > 0) {
    throw new Error("Invalid phone number");
  }

  return { messageId: String(ovhData.ids[0]) };
}
