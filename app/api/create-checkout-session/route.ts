import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const plan = searchParams.get("plan")

  if (!plan || !["monthly", "lifetime"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const isMonthly = plan === "monthly"
  const priceId = isMonthly
    ? process.env.STRIPE_MONTHLY_PRICE_ID!
    : process.env.STRIPE_LIFETIME_PRICE_ID!

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isMonthly ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#premium`,
    })

    return NextResponse.redirect(session.url!, 303)
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
