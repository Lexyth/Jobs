import React from "react";

import { store } from "./store.js";

import { JobsHandler } from "./jobsHandler.js";

export function useJobsHandler() {
  // tell react to reload when the data in the store changes
  React.useSyncExternalStore(store.subscribe, store.getSnapshot);

  return new JobsHandler();
}
