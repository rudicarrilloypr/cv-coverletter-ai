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

        // ID único de esta sesión de checkout (lo usamos para retry-safe)
        const stripeId = session.id;

        // 👇 usamos las mismas keys que pusiste en create-checkout-session
        const email =
          (metadata.email as string | undefined) ||
          (session.customer_details?.email as string | null) ||
          session.customer_email ||
          null;

        const creditsString = metadata.credits as string | undefined;
        const packId = metadata.packId as string | undefined;
        const creditsToAdd = creditsString ? parseInt(creditsString, 10) : 0;

        // Info de pago (amount_total viene en la unidad mínima, ej. centavos)
        const amount =
          typeof session.amount_total === "number" ? session.amount_total : 0;
        const currency = session.currency || "usd";

        console.log("🎯 Webhook session.metadata:", metadata);
        console.log("🎯 email:", email, "creditsToAdd:", creditsToAdd);
        console.log("🎯 stripeId:", stripeId, "amount:", amount, "currency:", currency);

        if (!email || !creditsToAdd || !packId) {
          console.warn(
            "checkout.session.completed sin email, credits o packId en metadata. No se aplica."
          );
          break;
        }

        // 1️⃣ Retry-safe: ¿ya procesamos este stripeId?
        const existingPurchase = await prisma.purchase.findUnique({
          where: { stripeId },
        });

        if (existingPurchase) {
          console.log(
            `⚠️ Webhook ya procesado para stripeId=${stripeId}, ignorando reintento.`
          );
          break;
        }

        // 2️⃣ Buscar usuario por email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.error(
            `❌ Usuario no encontrado para email=${email}. No se aplican créditos.`
          );
          break;
        }

        // 3️⃣ Transacción: sumar créditos + registrar Purchase
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: {
              credits: {
                increment: creditsToAdd,
              },
            },
          });

          await tx.purchase.create({
            data: {
              userId: user.id,
              stripeId,
              packId,
              credits: creditsToAdd,
              amount,
              currency,
            },
          });
        });

        console.log(
          `✅ Añadidos ${creditsToAdd} créditos al usuario ${email} y registrada compra ${stripeId}`
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
