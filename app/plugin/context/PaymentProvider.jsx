import React, { createContext } from "react";
export const PaymentContext = createContext({});

export const PaymentProvider = ({invoice, children}) => {  
  return (
    <PaymentContext.Provider value={{ invoice }}>
      {children}
    </PaymentContext.Provider>
  );
};
