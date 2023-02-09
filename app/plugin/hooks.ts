import { PaymentContext } from "./context/PaymentProvider";
import { useContext } from "react";

export const usePayment = () => {
  const ctx = useContext(PaymentContext);
  return { invoice: ctx.invoice };
};
