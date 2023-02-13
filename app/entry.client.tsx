import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { useLocation, useMatches } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { useEffect } from "react";
import { ethers } from "ethers";
import { SiweMessage, generateNonce } from "siwe";
import { Buffer } from "buffer";
declare global {
  interface Window {
    ENV: any;
  }
}
window.Buffer = window.Buffer || Buffer;
if (window.ENV.SENTRY_DSN) {
  console.log(window.ENV);
  Sentry.init({
    dsn: window.ENV.SENTRY_DSN,
    tracesSampleRate: 1,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.remixRouterInstrumentation(
          useEffect,
          useLocation,
          useMatches
        ),
      }),
    ],
  });
}

const hydrate = () => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    );
  });
};

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}

const domain = window.location.host;
const origin = window.location.origin;

async function createSiweMessage(
  chainId: number,
  address: string,
  statement: string
) {
  const nonce = generateNonce();
  console.log("nonce", nonce);
  let currentTime = new Date().getTime();
  let expirationTime = new Date(currentTime + 2 * 60 * 1000);
  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: "1",
    chainId: chainId,
    nonce: nonce,
    expirationTime: expirationTime.toISOString(),
  });
  return message.prepareMessage();
}

export const getWeb3 = async () => {
  if (window.ethereum) {
    //@ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const { chainId } = await provider.getNetwork();
    console.log("chainId", chainId);
    const address = await signer.getAddress();
    const message = await createSiweMessage(
      chainId,
      address,
      "Sign in with Ethereum to the app."
    );
    console.log("message", message);
    const signature = await signer.signMessage(message);
    console.log("signature", signature);
    return [message, signature];
  }
  throw new Error("metamask needs to be installed");
};
