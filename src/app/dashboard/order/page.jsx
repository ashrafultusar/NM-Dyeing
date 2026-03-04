
import { OrdersContent } from "@/components/order/OrdersContent";
import { Suspense } from "react";

export default function Orders() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}