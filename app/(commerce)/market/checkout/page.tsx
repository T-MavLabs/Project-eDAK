"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CreditCard, MapPinHouse, PackageSearch, Truck } from "lucide-react";

import { getCart, placeOrder, type ShippingAddress } from "@/lib/mockOrders";
import { getProductById } from "@/lib/mockProducts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedCard } from "@/components/aceternity/AnimatedCard";
import { AnimatedText } from "@/components/aceternity/AnimatedText";
import { Spotlight } from "@/components/aceternity/Spotlight";

export default function CheckoutPage() {
  const router = useRouter();

  const cart = useMemo(() => getCart(), []);
  const lines = useMemo(() => {
    return cart
      .map((c) => {
        const p = getProductById(c.productId);
        if (!p) return null;
        return { p, q: c.quantity, total: p.priceInr * c.quantity };
      })
      .filter(Boolean) as Array<{ p: NonNullable<ReturnType<typeof getProductById>>; q: number; total: number }>;
  }, [cart]);

  const subtotal = lines.reduce((acc, l) => acc + l.total, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  const [fullName, setFullName] = useState("Aarav Sharma");
  const [phone, setPhone] = useState("9876543210");
  const [addressLine1, setAddressLine1] = useState("Flat 12B, Sector 21");
  const [addressLine2, setAddressLine2] = useState("Near Metro Station");
  const [city, setCity] = useState("Noida");
  const [state, setState] = useState("Uttar Pradesh");
  const [pincode, setPincode] = useState("201301");
  const [digipin, setDigipin] = useState("UP-201301-6K9D");

  const codEligible = lines.every((l) => l.p.codAvailable);

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="rounded-md border bg-background p-6">
          <div className="text-lg font-semibold">No items to checkout</div>
          <p className="mt-2 text-sm text-muted-foreground">Add items to cart to place an order.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/market">Go to Marketplace</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/market/cart">Go to Cart</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Enter shipping details. On placement, we generate a mock India Post tracking ID and redirect to the tracking page.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPinHouse className="h-4 w-4 text-primary" /> Shipping address
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-2">
                <Truck className="h-3.5 w-3.5" /> India Post delivery
              </Badge>
              <Badge variant="secondary">DIGIPIN supported</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();

                const address: ShippingAddress = {
                  fullName: fullName.trim(),
                  phone: phone.trim(),
                  addressLine1: addressLine1.trim(),
                  addressLine2: addressLine2.trim() || undefined,
                  city: city.trim(),
                  state: state.trim(),
                  pincode: pincode.trim(),
                  digipin: digipin.trim().toUpperCase(),
                };

                const { trackingId } = placeOrder(address);
                router.push(`/track?tracking_id=${encodeURIComponent(trackingId)}`);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="name">Full name</label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="phone">Mobile number</label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="a1">Address line 1</label>
                <Textarea id="a1" rows={2} value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="a2">Address line 2 (optional)</label>
                <Input id="a2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="city">City</label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="state">State</label>
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="pin">PIN code</label>
                  <Input id="pin" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="digipin">DIGIPIN</label>
                <Input id="digipin" value={digipin} onChange={(e) => setDigipin(e.target.value)} placeholder="e.g., DL-110001-3F2A" />
                <div className="text-xs text-muted-foreground">
                  Used to demonstrate address intelligence and dynamic hub assignment (demo).
                </div>
              </div>

              <div className="rounded-md border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Payment</div>
                  <Badge variant="secondary" className="gap-2">
                    <CreditCard className="h-3.5 w-3.5" /> {codEligible ? "Cash on Delivery" : "Prepaid (Mock)"}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  This is a demo flow — no real payment is processed.
                </div>
              </div>

              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Place Order & Generate Tracking
              </Button>

              <div className="text-xs text-muted-foreground">
                After placement, you will be redirected to Tracking with a newly generated India Post tracking ID.
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit border-primary/10">
          <CardHeader>
            <CardTitle className="text-base">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {lines.map((l) => (
                <div key={l.p.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <div className="font-medium">{l.p.name}</div>
                    <div className="text-xs text-muted-foreground">Qty: {l.q}</div>
                  </div>
                  <div className="font-medium">₹{l.total.toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
            <div className="h-px w-full bg-border" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping (India Post)</span>
              <span className="font-medium">₹{shipping.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-xl font-semibold">₹{total.toLocaleString("en-IN")}</span>
            </div>

            <Button asChild variant="secondary" className="w-full">
              <Link href="/market/cart">Edit cart</Link>
            </Button>

            <div className="rounded-md border bg-background p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <PackageSearch className="h-4 w-4 text-primary" />
                Tracking will open immediately after order placement.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
