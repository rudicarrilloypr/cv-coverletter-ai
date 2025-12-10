// src/app/api/billing/create-checkout-session/route.ts
import Stripe from "stripe";
import { auth } from "@/app/auth";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// sin apiVersion


type CreditPackId = "starter" | "pro" | "ultimate";

const CREDIT_PACKS: Record<
  CreditPackId,
  { credits: number; priceId: string }
> = {
  starter: {
    credits: 10,
    priceId: process.env.STRIPE_PRICE_STARTER!, // price_xxx
  },
  pro: {
    credits: 30,
    priceId: process.env.STRIPE_PRICE_PRO!, // price_xxx
  },
  ultimate: {
    credits: 80,
    priceId: process.env.STRIPE_PRICE_ULTIMATE!, // price_xxx
  },
};

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para comprar créditos." },
        { status: 401 }
      );
    }

    const { packId } = await req.json();
    const pack = CREDIT_PACKS[packId as CreditPackId];

    if (!pack) {
      return NextResponse.json(
        { error: "Paquete de créditos inválido." },
        { status: 400 }
      );
    }

    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: pack.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        email: session.user.email,
        credits: String(pack.credits),
        packId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Error creando sesión de checkout:", err);
    return NextResponse.json(
      { error: "No se pudo crear la sesión de pago." },
      { status: 500 }
    );
  }
}
