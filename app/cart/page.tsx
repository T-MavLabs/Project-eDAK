import { redirect } from "next/navigation";

export default function CartLegacyRedirect() {
  redirect("/market/cart");
}
