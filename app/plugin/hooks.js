import { PaymentContext } from "./context/PaymentProvider";
import { useContext } from "react";
import { useActor, useSelector } from "@xstate/react";

export const usePayment = () => {
  const ctx = useContext(PaymentContext);
  const [payment, send] = useActor(ctx.payment);
  return { state: payment, send: send };
};

export const usePaymentExists = (memo) => {
  const ctx = useContext(PaymentContext);
  return useSelector(ctx.paymentService, (state) => {
    return !!state.context.payments.find((p) => p.id === `payment-${memo}`);
  });
};
