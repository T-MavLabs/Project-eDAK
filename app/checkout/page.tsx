import { redirect } from "next/navigation";

export default function CheckoutLegacyRedirect() {
  redirect("/market/checkout");
}
