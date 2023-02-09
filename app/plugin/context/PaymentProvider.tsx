import React, { createContext } from "react";

type PaymentContextType = {
  invoice: any;
};

export const PaymentContext = createContext<PaymentContextType>(
  {} as PaymentContextType
);

export const PaymentProvider = ({
  invoice,
  children,
}: {
  invoice: any;
  children: any;
}) => {
  return (
    <PaymentContext.Provider value={{ invoice }}>
      {children}
    </PaymentContext.Provider>
  );
};
