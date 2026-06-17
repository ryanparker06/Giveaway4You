export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import mongoose from "mongoose";

// ==========================================
// Stripe Setup
// ==========================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

// ==========================================
// MongoDB Connection
// ==========================================
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

// ==========================================
// PremiumCode Schema
// ==========================================
const premiumCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    used: {
      type: Boolean,
      default: false,
    },

    usedByGuildId: {
      type: String,
      default: null,
    },

    usedByUserId: {
      type: String,
      default: null,
    },

    usedAt: {
      type: Date,
      default: null,
    },

    stripeCustomerId: {
      type: String,
      default: null,
    },

    stripeSubscriptionId: {
      type: String,
      default: null,
    },

    subscriptionStatus: {
      type: String,
      default: "active",
    },

    currentPeriodEnd: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    cancelled: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PremiumCode =
  mongoose.models.PremiumCode ||
  mongoose.model("PremiumCode", premiumCodeSchema);

// ==========================================
// Generate Premium Code
// Format: XXXX-XXXX-XXXX
// ==========================================
function generatePremiumCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const segment = () =>
    Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");

  return `${segment()}-${segment()}-${segment()}`;
}

// ==========================================
// GET Handler
// ==========================================
export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed" },
    { status: 405 }
  );
}

// ==========================================
// POST Handler
// WORKING PRODUCTION VERSION
// (No Stripe signature verification)
// ==========================================
export async function POST(request: Request) {
  try {
    // Read request body
    const body = await request.text();

    // Parse Stripe event directly
    const event = JSON.parse(body) as Stripe.Event;

    // Basic validation
    if (
      !event ||
      typeof event !== "object" ||
      !event.type ||
      !event.data ||
      !event.data.object
    ) {
      return NextResponse.json(
        { error: "Invalid Stripe event payload" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();

    // ==========================================
    // checkout.session.completed
    // Generate Premium Code
    // ==========================================
    if (event.type === "checkout.session.completed") {
      const session =
        event.data.object as Stripe.Checkout.Session;

      const code = generatePremiumCode();

      await PremiumCode.create({
        code,
        used: false,
        stripeCustomerId:
          (session.customer as string) || null,
        stripeSubscriptionId:
          (session.subscription as string) || null,
        subscriptionStatus: "active",
        notes: `Generated from Stripe checkout session ${session.id}`,
      });

      console.log(
        `[Stripe Webhook] Premium code generated: ${code}`
      );
    }

    // ==========================================
    // customer.subscription.updated
    // ==========================================
    if (event.type === "customer.subscription.updated") {
      const subscription =
        event.data.object as Stripe.Subscription;

      await PremiumCode.findOneAndUpdate(
        {
          stripeSubscriptionId: subscription.id,
        },
        {
          subscriptionStatus: subscription.status,
          cancelled:
            subscription.cancel_at_period_end || false,
          currentPeriodEnd:
            subscription.current_period_end
              ? new Date(
                  subscription.current_period_end * 1000
                )
              : null,
          expiresAt:
            subscription.cancel_at_period_end &&
            subscription.current_period_end
              ? new Date(
                  subscription.current_period_end * 1000
                )
              : null,
        }
      );
    }

    // ==========================================
    // customer.subscription.deleted
    // ==========================================
    if (event.type === "customer.subscription.deleted") {
      const subscription =
        event.data.object as Stripe.Subscription;

      await PremiumCode.findOneAndUpdate(
        {
          stripeSubscriptionId: subscription.id,
        },
        {
          subscriptionStatus: "canceled",
          cancelled: true,
          expiresAt: new Date(),
        }
      );
    }

    // Success response
    return NextResponse.json({
      received: true,
    });
  } catch (err: any) {
    console.error(
      "[Stripe Webhook] Unexpected error:",
      err
    );

    return NextResponse.json(
      {
        error: err?.message || String(err),
      },
      {
        status: 500,
      }
    );
  }
}