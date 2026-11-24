const base = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
const statusMessages = { 400: "invalid", 429: "busy", 504: "timeout" };
let lastWarmup = 0;

export function warmPlanner() {
  if (!base || Date.now() - lastWarmup < 15 * 60 * 1000) return;
  lastWarmup = Date.now();
  fetch(base + "/", { cache: "no-store" }).catch(() => {});
}

export async function requestPlan(trip, signal, onProgress) {
  const response = await fetch(base + "/plan-trip", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/x-ndjson, application/json" },
    body: JSON.stringify(trip),
    signal,
  });
  if (!response.ok) throw new Error(statusMessages[response.status] || "offline");
  if (!response.headers?.get("content-type")?.includes("application/x-ndjson")) {
    const { plan } = await response.json();
    if (typeof plan !== "string" || !plan.trim()) throw new Error("offline");
    return plan;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  let plan = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      const lines = pending.split("\n");
      pending = lines.pop();
      if (done && pending) lines.push(pending);
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.error) throw new Error(statusMessages[event.error] || "offline");
        if (typeof event.text === "string") {
          plan += event.text;
          onProgress?.(plan);
        }
        if (event.done && plan.trim()) return plan.trim();
      }
      if (done) throw new Error("offline");
    }
  } finally {
    reader.releaseLock();
  }
}
