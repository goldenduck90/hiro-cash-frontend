import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { useLocation, useMatches } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { useEffect } from "react";
import invariant from "tiny-invariant";

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
