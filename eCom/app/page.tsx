import Link from "next/link";
import { ShoppingBag, Store, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SellerRedirect } from "@/components/SellerRedirect";

export default function Home() {
  return (
    <>
      <SellerRedirect />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-semibold">VY</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">VYAPAR</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-2">
            Virtual Yet Accessible Postal Aggregated Retail
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by India Post (DAKSH) • Supporting Indian MSMEs
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {/* Buyer Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <CardTitle>I'm a Buyer</CardTitle>
              </div>
              <CardDescription>
                Browse and purchase products from verified Indian MSME sellers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/market">
                  Browse Marketplace
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                <Link href="/auth/login" className="hover:underline">Already have an account?</Link>
              </div>
            </CardContent>
          </Card>

          {/* Seller Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-100 text-green-600">
                  <Store className="h-5 w-5" />
                </div>
                <CardTitle>I'm a Seller (MSME)</CardTitle>
              </div>
              <CardDescription>
                List your products, manage inventory, and reach customers nationwide
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="default" className="w-full">
                <Link href="/auth/signup">
                  Become a Seller
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                <Link href="/auth/login" className="hover:underline">Already registered?</Link>
              </div>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-purple-100 text-purple-600">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle>Admin Access</CardTitle>
              </div>
              <CardDescription>
                Platform governance, seller verification, and product moderation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/admin-login">
                  Admin Login
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                <span className="font-mono">admin / admin123</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="text-center space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/market" className="hover:text-foreground transition-colors">
              Marketplace
            </Link>
            <span>•</span>
            <Link href="/track" className="hover:text-foreground transition-colors">
              Track Parcel
            </Link>
            <span>•</span>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">
              Login
            </Link>
            <span>•</span>
            <Link href="/auth/signup" className="hover:text-foreground transition-colors">
              Sign Up
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            VYAPAR is integrated with India Post DAKSH for seamless logistics and tracking
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
