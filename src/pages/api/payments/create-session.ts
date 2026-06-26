import type { NextApiRequest, NextApiResponse } from "next";

import { createHypPaymentSession, type HypPaymentResult } from "@/lib/hyp-payment";

/**
 * POST /api/payments/create-session
 *
 * Body: {
 *   amount: number,
 *   description: string,
 *   orderId: string,
 *   customerPhone?: string,
 * }
 *
 * Returns HypPaymentResult.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HypPaymentResult>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ status: "error", message: "Method not allowed." });
    return;
  }

  const { amount, description, orderId, customerPhone } = req.body as {
    amount: unknown;
    description: unknown;
    orderId: unknown;
    customerPhone?: unknown;
  };

  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ status: "error", message: "amount must be a positive number." });
    return;
  }

  if (typeof description !== "string" || !description.trim()) {
    res.status(400).json({ status: "error", message: "description is required." });
    return;
  }

  if (typeof orderId !== "string" || !orderId.trim()) {
    res.status(400).json({ status: "error", message: "orderId is required." });
    return;
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (req.headers.origin as string | undefined) ??
    "http://localhost:3000";

  const result = await createHypPaymentSession({
    amount,
    description: description.trim(),
    orderId: orderId.trim(),
    customerPhone: typeof customerPhone === "string" ? customerPhone.trim() : undefined,
    successUrl: `${appUrl}/payment/success`,
    cancelUrl: `${appUrl}/payment/cancel`,
  });

  const httpStatus = result.status === "ok" ? 200 : result.status === "pending" ? 202 : 500;
  res.status(httpStatus).json(result);
}
