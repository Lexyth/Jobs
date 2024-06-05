import React from "react";

import { useEntry } from "../../utils/components/Entry/hook";

import { store } from "./store";
import { ClientsHandler } from "./clientsHandler";

import type { Client } from "./store";

export function useHandler() {
  React.useSyncExternalStore(store.subscribe, store.getSnapshot);
  return new ClientsHandler();
}

export function useEntryMap(client: Client) {
  const entryMap = {
    name: useEntry("Name", "input", [{ current: true, value: client.name }]),
  };
  return entryMap;
}
