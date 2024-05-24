import React from "react";

import { clientsStore } from "./store";
import { ClientsHandler } from "./clientsHandler";

// TODO: useClients should become obsolete and ClientsHandler should expose subscribe and getSnapshot methods; maybe get() suffices if ClientsHandler can guarantee immutability

export function useClients() {
  const clients = React.useSyncExternalStore(
    clientsStore.subscribe,
    clientsStore.getSnapshot
  );

  return clients;
}

export function useClientsHandler() {
  useClients();

  return new ClientsHandler();
}
