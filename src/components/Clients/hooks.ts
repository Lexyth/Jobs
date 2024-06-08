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
    company: useEntry("Company", "input", [
      { current: true, value: client.company || "" },
    ]),
    address: useEntry("Address", "input", [
      { current: true, value: client.address || "" },
    ]),
    zip: useEntry("Zip", "input", [{ current: true, value: client.zip || "" }]),
    city: useEntry("City", "input", [
      { current: true, value: client.city || "" },
    ]),
    country: useEntry("Country", "input", [
      { current: true, value: client.country || "" },
    ]),
    "UST-ID-Nr.": useEntry("UST-ID-Nr.", "input", [
      { current: true, value: client["UST-ID-Nr."] || "" },
    ]),
    "Bestell-Nr.": useEntry("Bestell-Nr.", "input", [
      { current: true, value: client["Bestell-Nr."] || "" },
    ]),
    Zahlungsbedingungen: useEntry("Zahlungsbedingungen", "input", [
      { current: true, value: client.Zahlungsbedingungen || "" },
    ]),
    "Liefer-Nr.": useEntry("Liefer-Nr.", "input", [
      { current: true, value: client["Liefer-Nr."] || "" },
    ]),
    "Nr.": useEntry("Nr.", "input", [
      { current: true, value: client["Nr."] || "" },
    ]),
  };
  return entryMap;
}
