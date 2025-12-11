// src/app/lib/credits-packages.ts

export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 20,
    priceInCents: 500, // 5.00 USD
  },
  {
    id: "pro",
    name: "Pro",
    credits: 60,
    priceInCents: 1200, // 12.00 USD
  },
  {
    id: "ultimate",
    name: "Ultimate",
    credits: 150,
    priceInCents: 2500, // 25.00 USD
  },
];

// small helper
export function findPackageById(id: string) {
  return CREDIT_PACKAGES.find((p) => p.id === id) ?? null;
}
