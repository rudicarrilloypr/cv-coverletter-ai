// src/app/api/stripe/checkout/route.ts
import Stripe from "stripe";
import { auth } from "@/app/auth";
import { findPackageById } from "@/app/lib/credits-packages";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// sin apiVersion


export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return Response.json(
        { error: "Debes iniciar sesión para comprar créditos." },
        { status: 401 }
      );
    }

    const email = session.user.email;
    const body = await req.json();
    const { packageId } = body as { packageId?: string };

    if (!packageId) {
      return Response.json(
        { error: "Falta el paquete de créditos (packageId)." },
        { status: 400 }
      );
    }

    const pkg = findPackageById(packageId);
    if (!pkg) {
      return Response.json(
        { error: "Paquete de créditos no válido." },
        { status: 400 }
      );
    }

    // Creamos Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd", // o mxn si prefieres
            unit_amount: pkg.priceInCents,
            product_data: {
              name: `${pkg.name} – ${pkg.credits} créditos`,
            },
          },
        },
      ],
      customer_email: email, // súper importante para identificar luego
      metadata: {
        // lo usaremos en el webhook para saber cuántos créditos dar
        packageId: pkg.id,
        credits: String(pkg.credits),
        userEmail: email,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
    });

    return Response.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe Checkout error:", err);
    return Response.json(
      { error: "Error creando la sesión de pago." },
      { status: 500 }
    );
  }
}
