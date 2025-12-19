import { redirect } from "next/navigation";

export default function OrdersLegacyRedirect() {
  redirect("/market/orders");
}
