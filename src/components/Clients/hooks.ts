import React from "react";

import { useEntry } from "../../utils/components/Entry/hook";

import { store } from "./store";
import { ClientsHandler } from "./clientsHandler";

import type { Client } from "./store";

// TODO: rename to useHandler; whatever exports from clients/hooks.ts knows its for clients

export function useClientsHandler() {
  React.useSyncExternalStore(store.subscribe, store.getSnapshot);
  return new ClientsHandler();
}

export function useEntryMap(client: Client) {
  const entryMap = {
    name: useEntry("Name", "input", [{ current: true, value: client.name }]),
  };
  return entryMap;
}
