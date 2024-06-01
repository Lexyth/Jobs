import React from "react";

import { store } from "./store";
import { ClientsHandler } from "./clientsHandler";

export function useClientsHandler() {
  React.useSyncExternalStore(store.subscribe, store.getSnapshot);
  return new ClientsHandler();
}
