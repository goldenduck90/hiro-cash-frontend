import React, { createContext } from "react";
import { useInterpret } from "@xstate/react";
import { createPaymentMachine } from "../machines/payment";
// import { APP_ENV } from "../environment";

export const PaymentContext = createContext({});

export const PaymentProvider = (props) => {
  const machine = createPaymentMachine(props.invoice);
  const payment = useInterpret(machine);
  // if (APP_ENV === "development") {
  //   payment.onTransition((state) => console.log(state.value));
  // }
  return (
    <PaymentContext.Provider value={{ payment }}>
      {props.children}
    </PaymentContext.Provider>
  );
};
