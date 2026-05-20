const express = require("express");
const crypto = require("crypto");
const Stripe = require("stripe");

const PremiumCode = require("../models/PremiumCode");
const GuildPremium = require("../models/GuildPremium");

const router = express.Router();

// IMPORTANT:
// Express must use raw body parsing for Stripe signature verification.
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY
    );

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error(
        "Stripe webhook signature verification failed:",
        error.message
      );

      return res
        .status(400)
        .send(
          `Webhook Error: ${error.message}`
        );
    }

    try {
      // ==================================================
      // CHECKOUT COMPLETED
      // Generate a Premium code after purchase
      // ==================================================
      if (
        event.type ===
        "checkout.session.completed"
      ) {
        const session =
          event.data.object;

        const customerId =
          session.customer || null;
        const subscriptionId =
          session.subscription || null;

        // Generate code like: ABCD-EFGH-IJKL
        const code =
          crypto.randomBytes(6)
            .toString("hex")
            .toUpperCase()
            .match(/.{1,4}/g)
            .join("-");

        let subscription = null;
        let currentPeriodEnd = null;

        if (subscriptionId) {
          subscription =
            await stripe.subscriptions.retrieve(
              subscriptionId
            );

          if (
            subscription.current_period_end
          ) {
            currentPeriodEnd =
              new Date(
                subscription.current_period_end *
                  1000
              );
          }
        }

        // Save premium code
        await PremiumCode.create({
          code,
          used: false,
          stripeCustomerId:
            customerId,
          stripeSubscriptionId:
            subscriptionId,
          subscriptionStatus:
            subscription?.status ||
            "active",
          currentPeriodEnd,
          expiresAt:
            currentPeriodEnd,
          cancelled: false
        });

        console.log(
          `Created premium code: ${code}`
        );

        // OPTIONAL:
        // Save code in Stripe metadata so your website
        // can display it to the customer.
        if (session.id) {
          try {
            await stripe.checkout.sessions.update(
              session.id,
              {
                metadata: {
                  premium_code: code
                }
              }
            );
          } catch (error) {
            console.warn(
              "Could not attach code to session metadata:",
              error.message
            );
          }
        }
      }

      // ==================================================
      // SUBSCRIPTION UPDATED OR CANCELLED
      // ==================================================
      if (
        event.type ===
          "customer.subscription.updated" ||
        event.type ===
          "customer.subscription.deleted"
      ) {
        const subscription =
          event.data.object;

        const subscriptionId =
          subscription.id;

        const currentPeriodEnd =
          subscription.current_period_end
            ? new Date(
                subscription.current_period_end *
                  1000
              )
            : null;

        const cancelled =
          subscription.cancel_at_period_end ||
          event.type ===
            "customer.subscription.deleted";

        // Update PremiumCode records
        await PremiumCode.updateMany(
          {
            stripeSubscriptionId:
              subscriptionId
          },
          {
            subscriptionStatus:
              subscription.status,
            currentPeriodEnd,
            expiresAt:
              currentPeriodEnd,
            cancelled
          }
        );

        // Update active guild premium records
        await GuildPremium.updateMany(
          {
            stripeSubscriptionId:
              subscriptionId
          },
          {
            currentPeriodEnd,
            expiresAt:
              currentPeriodEnd,
            cancelled
          }
        );

        console.log(
          `Updated subscription ${subscriptionId}`
        );
      }

      // Acknowledge receipt
      res.json({ received: true });
    } catch (error) {
      console.error(
        "Stripe webhook processing error:",
        error
      );
      res.status(500).json({
        error:
          "Webhook processing failed"
      });
    }
  }
);

module.exports = router;