import * as React from "react";
import { useState } from "react";
import PaymentLinkDialog from "./sender/PaymentLinkDialog";
import Invoice from "./receiver/Invoice";
import WagmiContainer from "./WagmiContainer";

export function LayoutContainer({ children, setTab }) {
  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900 p-2 pl-4 bg-white">
        <div className="w-full max-w-lg m-auto">
          <img src="/img/hiro.png" className="h-8 inline-block" />
        </div>
      </h3>

      <div className="w-full max-w-lg m-auto py-auto mt-8">
        <div className="border-b border-gray-200 px-6 bg-white">
          <div className="bg-white py-6">{children}</div>
        </div>
      </div>
    </>
  );
}

export default function HiroLinkContainer({ children, paymentConfig }) {
  const [tab, setTab] = useState(null);

  if (tab == "newLink" || paymentConfig == null) {
    return (
      <LayoutContainer setTab={setTab}>
        <Invoice></Invoice>
      </LayoutContainer>
    );
  } else if (paymentConfig) {
    return (
      <WagmiContainer>
        <LayoutContainer setTab={setTab}>
          <PaymentLinkDialog paymentConfig={paymentConfig}></PaymentLinkDialog>
        </LayoutContainer>
      </WagmiContainer>
    );
  }
}
