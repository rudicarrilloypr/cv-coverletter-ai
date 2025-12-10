/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// sin apiVersion


export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("No signature", { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Error verifying Stripe webhook:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const metadata = session.metadata || {};

        // 👇 usamos las mismas keys que pusiste en create-checkout-session
        const email =
          (metadata.email as string | undefined) ||
          (session.customer_details?.email as string | null) ||
          session.customer_email ||
          null;

        const creditsString = metadata.credits as string | undefined;
        const creditsToAdd = creditsString ? parseInt(creditsString, 10) : 0;

        console.log("🎯 Webhook session.metadata:", metadata);
        console.log("🎯 email:", email, "creditsToAdd:", creditsToAdd);

        if (!email || !creditsToAdd) {
          console.warn(
            "No email or credits in metadata for checkout.session.completed"
          );
          break;
        }

        await prisma.user.update({
          where: { email },
          data: {
            credits: {
              increment: creditsToAdd,
            },
          },
        });

        console.log(
          `✅ Añadidos ${creditsToAdd} créditos al usuario con email ${email}`
        );

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("Error handling Stripe webhook event:", err);
    return new Response("Webhook handler failed", { status: 500 });
  }
}
