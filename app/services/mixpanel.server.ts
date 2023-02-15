import type { OauthCredential } from "@prisma/client";
import Mixpanel from "mixpanel";
import { getClientIPAddress } from "remix-utils";

const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN;

let mixpanelClient;
if (MIXPANEL_TOKEN) {
  mixpanelClient = Mixpanel.init(MIXPANEL_TOKEN);
} else {
  console.log("MIXPANEL_TOKEN not set, not tracking events");
  mixpanelClient = {
    track: function () {},
  };
}

export const mixpanel = mixpanelClient;

export function distinctId(oauth: OauthCredential) {
  return `${oauth.provider}-${oauth.userId}`;
}

export function mixpanelTrack(
  request: any,
  oauth: OauthCredential,
  event: string,
  properteis: any
) {
  mixpanel.track(event, {
    distinct_id: distinctId(oauth),
    ip: getClientIPAddress(request),
    ...properteis,
  });
}
