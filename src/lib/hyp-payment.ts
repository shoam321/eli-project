/**
 * HYP Payment Integration Scaffold
 * ─────────────────────────────────
 * HYP (הי"פ) is an Israeli payment processing company.
 * To activate real payments, set the following environment variables:
 *
 *   HYP_TERMINAL_ID     — Your terminal ID from the HYP dashboard
 *   HYP_API_PASSWORD    — Your API password / secret key
 *   HYP_BASE_URL        — HYP API base URL (e.g. https://pay.hyp.co.il or sandbox URL)
 *
 * These are server-side variables (no NEXT_PUBLIC_ prefix) — never expose to the browser.
 */

export type HypPaymentRequest = {
  /** Amount in shekels (e.g. 150.00) */
  amount: number;
  /** Short description shown on payment page */
  description: string;
  /** Customer phone for SMS receipt (optional, e.g. "0501234567") */
  customerPhone?: string;
  /** Internal order reference */
  orderId: string;
  /** URL to redirect after successful payment */
  successUrl: string;
  /** URL to redirect after failed/cancelled payment */
  cancelUrl: string;
};

export type HypPaymentResult =
  | { status: "ok"; paymentUrl: string; sessionId: string }
  | { status: "pending"; message: string }
  | { status: "error"; message: string };

/**
 * Creates a HYP payment session on the server side.
 * Called from the API route /api/payments/create-session.
 *
 * When HYP credentials are configured, this will return a real payment URL.
 * Until then it returns a "pending" result with a clear message.
 */
export async function createHypPaymentSession(
  request: HypPaymentRequest,
): Promise<HypPaymentResult> {
  const terminalId = process.env.HYP_TERMINAL_ID;
  const apiPassword = process.env.HYP_API_PASSWORD;
  const baseUrl = process.env.HYP_BASE_URL;

  // ── Not yet configured ───────────────────────────────────────────────────
  if (!terminalId || !apiPassword || !baseUrl) {
    return {
      status: "pending",
      message:
        "HYP credentials are not yet configured. Set HYP_TERMINAL_ID, HYP_API_PASSWORD, and HYP_BASE_URL in your environment variables.",
    };
  }

  // ── Real HYP API call ────────────────────────────────────────────────────
  // Replace the payload structure below with the exact fields required by your
  // HYP terminal type (standard hosted page, iframe, etc.)
  try {
    const payload = {
      TerminalNumber: terminalId,
      Password: apiPassword,
      Amount: request.amount.toFixed(2),
      Description: request.description,
      CustomerPhone: request.customerPhone ?? "",
      OrderID: request.orderId,
      SuccessURL: request.successUrl,
      FailURL: request.cancelUrl,
      CancelURL: request.cancelUrl,
    };

    const response = await fetch(`${baseUrl}/create-transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return { status: "error", message: `HYP API error ${response.status}: ${text}` };
    }

    // TODO: adjust field names to match actual HYP response schema
    const data = (await response.json()) as { PaymentURL?: string; SessionID?: string; Error?: string };

    if (data.Error) {
      return { status: "error", message: data.Error };
    }

    if (!data.PaymentURL) {
      return { status: "error", message: "HYP did not return a payment URL." };
    }

    return {
      status: "ok",
      paymentUrl: data.PaymentURL,
      sessionId: data.SessionID ?? request.orderId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown HYP error.";
    return { status: "error", message };
  }
}
