/**
 * ML prediction service contract.
 *
 * The production model (Random Forest Regression trained on activity history)
 * is served by the Python service configured through ML_SERVICE_URL. Until that
 * service is registered the app reports "Model Not Configured" and falls back to
 * a transparent, clearly-labelled linear trend — it never pretends a model exists.
 */

export type ModelStatus = "ready" | "not_configured";

export type Prediction = {
  status: ModelStatus;
  method: string;
  nextMonthKg: number | null;
  note: string;
};

export function predictNextMonth(history: { total_kg: number }[]): Prediction {
  if (history.length < 2) {
    return {
      status: "not_configured",
      method: "Random Forest Regression (Python service)",
      nextMonthKg: null,
      note: "Model Not Configured — connect the ML service or log at least two calculations for a trend estimate.",
    };
  }

  const series = [...history].reverse().map((h) => Number(h.total_kg));
  const n = series.length;
  const meanX = (n - 1) / 2;
  const meanY = series.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  series.forEach((y, x) => {
    num += (x - meanX) * (y - meanY);
    den += (x - meanX) ** 2;
  });
  const slope = den === 0 ? 0 : num / den;
  const next = Math.max(0, meanY + slope * (n - meanX));

  return {
    status: "not_configured",
    method: "Linear trend fallback",
    nextMonthKg: Math.round(next * 10) / 10,
    note: "Model Not Configured — this is a transparent linear trend over your own logged calculations, not an ML prediction.",
  };
}
