import React from "react";

import { clientsStore } from "./store";
import { ClientsHandler } from "./clientsHandler";

export function useClientsHandler() {
  React.useSyncExternalStore(clientsStore.subscribe, clientsStore.getSnapshot);
  return new ClientsHandler();
}
