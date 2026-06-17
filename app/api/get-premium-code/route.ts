export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

const premiumCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    used: { type: Boolean, default: false },
    usedByGuildId: { type: String, default: null },
    usedByUserId: { type: String, default: null },
    usedAt: { type: Date, default: null },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    subscriptionStatus: { type: String, default: "active" },
    currentPeriodEnd: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    cancelled: { type: Boolean, default: false },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

const PremiumCode =
  mongoose.models.PremiumCode || mongoose.model("PremiumCode", premiumCodeSchema);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    // Verify the session exists and is completed
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // Connect to DB and find the premium code
    await connectToDatabase();

    const premiumCode = await PremiumCode.findOne({
      notes: `Generated from Stripe checkout session ${sessionId}`,
    });

    if (!premiumCode) {
      return NextResponse.json({ error: "Code not yet generated. Please wait a moment and refresh." }, { status: 404 });
    }

    return NextResponse.json({ code: premiumCode.code });
  } catch (error: any) {
    console.error("[Get Premium Code] Error:", error.message);
    return NextResponse.json({ error: "Failed to retrieve code" }, { status: 500 });
  }
}
