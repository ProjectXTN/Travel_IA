export async function requestPlan(trip, signal) {
  const base = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
  const response = await fetch(base + "/plan-trip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
    signal,
  });
  if (!response.ok) {
    const messages = { 400: "invalid", 429: "busy", 504: "timeout" };
    throw new Error(messages[response.status] || "offline");
  }
  const { plan } = await response.json();
  if (typeof plan !== "string" || !plan.trim()) throw new Error("offline");
  return plan;
}
