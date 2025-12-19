"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, MapPin, Navigation, PackageSearch, Truck, Loader2 } from "lucide-react";

import { clearCart, generateTrackingId, getCart } from "@/lib/mockOrders";
import { autoFetchDigipin, fetchDigipinByAddress, fetchDigipinByLocation } from "@/lib/digipin";
import {
  createOrder,
  createOrderItems,
  fetchProductsByIds,
  setOrderTrackingId,
} from "@/supabase/queries";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CheckoutPage() {
  const router = useRouter();

  const cart = useMemo(() => getCart(), []);
  const [productsById, setProductsById] = useState<
    Record<string, Awaited<ReturnType<typeof fetchProductsByIds>>[number]>
  >({});

  useEffect(() => {
    const ids = Array.from(new Set(cart.map((c) => c.productId)));
    fetchProductsByIds(ids)
      .then((rows) => {
        const map: Record<string, (typeof rows)[number]> = {};
        rows.forEach((p) => (map[p.id] = p));
        setProductsById(map);
      })
      .catch(() => setProductsById({}));
  }, [cart]);

  const lines = useMemo(() => {
    return cart
      .map((c) => {
        const p = productsById[c.productId];
        if (!p) return null;
        return { p, q: c.quantity, total: Number(p.price) * c.quantity };
      })
      .filter(Boolean) as Array<{
      p: NonNullable<(typeof productsById)[string]>;
      q: number;
      total: number;
    }>;
  }, [cart, productsById]);

  const subtotal = lines.reduce((acc, l) => acc + l.total, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  const [email, setEmail] = useState("aarav@example.com");
  const [fullName, setFullName] = useState("Aarav Sharma");
  const [phone, setPhone] = useState("9876543210");
  const [addressLine1, setAddressLine1] = useState("Flat 12B, Sector 21");
  const [addressLine2, setAddressLine2] = useState("Near Metro Station");
  const [city, setCity] = useState("Noida");
  const [state, setState] = useState("Uttar Pradesh");
  const [pincode, setPincode] = useState("201301");
  const [digipin, setDigipin] = useState("UP-201301-6K9D");
  const [fetchingDigipin, setFetchingDigipin] = useState(false);
  const [digipinError, setDigipinError] = useState<string | null>(null);

  const codEligible = true;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch DIGIPIN when address fields are complete
  useEffect(() => {
    if (addressLine1 && city && state && pincode && pincode.length === 6) {
      // Debounce: wait 1 second after user stops typing
      const timer = setTimeout(() => {
        handleAutoFetchDigipin();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [addressLine1, city, state, pincode]);

  async function handleAutoFetchDigipin() {
    if (!addressLine1 || !city || !state || !pincode || pincode.length !== 6) {
      return;
    }

    setFetchingDigipin(true);
    setDigipinError(null);

    try {
      const result = await fetchDigipinByAddress(
        `${addressLine1}${addressLine2 ? `, ${addressLine2}` : ""}`,
        city,
        state,
        pincode
      );
      
      if (result) {
        setDigipin(result);
      }
    } catch (err) {
      // Silently fail for auto-fetch (user can manually fetch)
      console.warn("Auto-fetch DIGIPIN failed:", err);
    } finally {
      setFetchingDigipin(false);
    }
  }

  async function handleFetchByAddress() {
    if (!addressLine1 || !city || !state || !pincode) {
      setDigipinError("Please fill in address, city, state, and PIN code first");
      return;
    }

    setFetchingDigipin(true);
    setDigipinError(null);

    try {
      const result = await fetchDigipinByAddress(
        `${addressLine1}${addressLine2 ? `, ${addressLine2}` : ""}`,
        city,
        state,
        pincode
      );
      
      if (result) {
        setDigipin(result);
      } else {
        setDigipinError("Could not fetch DIGIPIN. Please enter manually.");
      }
    } catch (err) {
      setDigipinError(err instanceof Error ? err.message : "Failed to fetch DIGIPIN");
    } finally {
      setFetchingDigipin(false);
    }
  }

  async function handleFetchByLocation() {
    setFetchingDigipin(true);
    setDigipinError(null);

    try {
      const result = await fetchDigipinByLocation();
      
      if (result) {
        setDigipin(result);
      } else {
        setDigipinError("Could not fetch DIGIPIN from location. Please try address or enter manually.");
      }
    } catch (err) {
      setDigipinError(err instanceof Error ? err.message : "Failed to fetch DIGIPIN from location");
    } finally {
      setFetchingDigipin(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="rounded-xl border vyapar-card bg-background p-6 vyapar-soft-shadow vyapar-fade-in text-center">
          <div className="vyapar-kicker">Checkout</div>
          <div className="mt-2 text-lg font-semibold">No items selected</div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            To proceed, add an item from Available Services to your cart.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Button asChild className="bg-primary hover:bg-primary/90 vyapar-gentle-transition">
              <Link href="/market">Go to Marketplace</Link>
            </Button>
            <Button asChild variant="secondary" className="vyapar-gentle-transition">
              <Link href="/market/cart">Go to Cart</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-3 vyapar-fade-in">
        <div className="vyapar-kicker">Service application form</div>
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Provide delivery details. After submission, a service receipt and India Post tracking ID will be generated.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 mb-6 vyapar-slide-up">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold vyapar-gentle-transition">
            1
          </div>
          <div className="h-1 flex-1 rounded-full bg-muted">
            <div className="h-full w-full rounded-full bg-primary vyapar-gentle-transition" style={{ width: "100%" }} />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold vyapar-gentle-transition">
            2
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Delivery details</span>
          <span>Confirmation</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 vyapar-slide-up">
        <Card className="lg:col-span-2 overflow-hidden vyapar-card">
          {/* Government-style form header */}
          <div className="border-b vyapar-trust-badge px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="vyapar-kicker">India Post assisted delivery</div>
                <div className="mt-1 text-base font-semibold text-foreground">
                  Delivery details (Addressee and Address)
                </div>
                <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Service available across India • Tracking generated on submission
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-2 vyapar-chip vyapar-gentle-transition">
                  <Truck className="h-3.5 w-3.5" /> Delivered using India Post
                </Badge>
                <Badge variant="secondary" className="vyapar-chip vyapar-gentle-transition">Official Address Code supported</Badge>
              </div>
            </div>
          </div>
          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                setError(null);

                try {
                  const user_email = email.trim().toLowerCase();
                  if (!user_email || !user_email.includes("@")) {
                    throw new Error("Please enter a valid email address.");
                  }

                  const dp = digipin.trim().toUpperCase();
                  if (!dp) throw new Error("DIGIPIN is required.");

                  // Create order in Supabase
                  const order = await createOrder({
                    user_email,
                    total_amount: total,
                    digipin: dp,
                    status: "placed",
                  });

                  // Insert order items
                  await createOrderItems(
                    order.id,
                    lines.map((l) => ({
                      product_id: l.p.id,
                      quantity: l.q,
                      price_at_purchase: Number(l.p.price),
                    })),
                  );

                  // Generate an India Post tracking id and store it on the order
                  const trackingId = generateTrackingId();
                  await setOrderTrackingId(order.id, trackingId);

                  // Remember email for order history and clear cart
                  window.localStorage.setItem("edak_demo_email", user_email);
                  clearCart();

                  // Redirect to India Post platform tracking UI
                  router.push(`/track?tracking_id=${encodeURIComponent(trackingId)}`);
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "Failed to place order.";
                  setError(msg);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="vyapar-gentle-transition" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Used for receipt lookup and tracking access.
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="name">Full name</label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="vyapar-gentle-transition" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="phone">Mobile number</label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="vyapar-gentle-transition" />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="a1">Address line 1</label>
                <Textarea id="a1" rows={2} value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="vyapar-gentle-transition" />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="a2">Address line 2 (optional)</label>
                <Input id="a2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="vyapar-gentle-transition" />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="city">City</label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="vyapar-gentle-transition" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="state">State</label>
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} className="vyapar-gentle-transition" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="pin">PIN code</label>
                  <Input id="pin" value={pincode} onChange={(e) => setPincode(e.target.value)} className="vyapar-gentle-transition" />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="digipin">India Address Code (DIGIPIN)</label>
                <div className="flex gap-2">
                  <Input 
                    id="digipin" 
                    value={digipin} 
                    onChange={(e) => setDigipin(e.target.value)} 
                    placeholder="e.g., DL-110001-3F2A" 
                    className="vyapar-gentle-transition flex-1"
                    disabled={fetchingDigipin}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleFetchByAddress}
                    disabled={fetchingDigipin || !addressLine1 || !city || !state || !pincode}
                    title="Fetch DIGIPIN from address"
                  >
                    {fetchingDigipin ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleFetchByLocation}
                    disabled={fetchingDigipin}
                    title="Fetch DIGIPIN from device location"
                  >
                    {fetchingDigipin ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {digipinError && (
                  <div className="text-xs text-destructive">{digipinError}</div>
                )}
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Official Address Code used for accurate routing and hub assignment.
                  {fetchingDigipin && " Fetching DIGIPIN..."}
                  {!fetchingDigipin && digipin && " ✓ DIGIPIN fetched automatically"}
                </div>
              </div>

              <div className="rounded-xl border vyapar-trust-badge bg-muted/30 p-4 vyapar-soft-shadow">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Payment</div>
                  <Badge variant="secondary" className="gap-2 vyapar-chip vyapar-gentle-transition">
                    <CreditCard className="h-3.5 w-3.5" /> {codEligible ? "Cash on Delivery" : "Prepaid"}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  For this demo, payment is collected on delivery (COD).
                </div>
              </div>

              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 vyapar-gentle-transition"
                disabled={submitting}
              >
                {submitting ? "Placing order..." : "Place Order & Generate Tracking"}
              </Button>

              {error ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="text-xs text-muted-foreground">
                After placement, you’ll be redirected to Tracking with a newly generated India Post tracking ID.
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit vyapar-card vyapar-soft-shadow">
          <CardHeader>
            <CardTitle className="text-base">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {lines.map((l, idx) => (
                <div key={l.p.id} className="flex items-start justify-between gap-3 text-sm vyapar-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
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

            <Button asChild variant="secondary" className="w-full vyapar-gentle-transition">
              <Link href="/market/cart">Edit cart</Link>
            </Button>

            <div className="rounded-xl border vyapar-trust-badge bg-background/80 p-3 text-xs text-muted-foreground vyapar-soft-shadow">
              <div className="flex items-center gap-2">
                <PackageSearch className="h-4 w-4 text-primary" />
                Tracking opens immediately after order placement.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
