import { logEvent } from "firebase/analytics";

import { analytics } from ".";

export const logAnalyticsEvent = (
  eventName: string,
  eventParams?:
    | {
        [key: string]: any;
      }
    | undefined,
) => logEvent(analytics, eventName, eventParams);
