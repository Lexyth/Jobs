import React from "react";

import { useEntry } from "../../utils/components/Entry/hook.js";

import { store } from "./store.js";
import { JobsHandler } from "./jobsHandler.js";
import { ClientsHandler } from "../Clients/clientsHandler.js";

import { Status } from "./store.js";
import type { Job } from "./store.js";

export function useJobsHandler() {
  // tell react to reload when the data in the store changes
  React.useSyncExternalStore(store.subscribe, store.getSnapshot);

  return new JobsHandler();
}

export function useEntryMap(job: Job, clientsHandler: ClientsHandler) {
  return {
    clientName: useEntry("Client", "select", [
      { value: "" },
      ...clientsHandler.getAll().map((client) => ({
        current: client.id === job.clientId,
        value: client.name,
      })),
    ]),
    date: useEntry("Date", "input", [{ current: true, value: job.date }], {
      type: "date",
    }),
    description: useEntry("Description", "textarea", [
      { current: true, value: job.description },
    ]),
    count: useEntry(
      "Count",
      "input",
      [{ current: true, value: job.count.toString() }],
      { type: "number" }
    ),
    price: useEntry(
      "Price",
      "datalist",

      [
        { current: true, value: job.price.toString() },
        { description: "Global", value: "0" },
        { description: "Client - Word Price", value: "0" },
        { description: "Client - Line Price", value: "0" },
        { description: "Client - Page Price", value: "0" },
        { description: "Suggested", value: "0" },
      ],
      { type: "number" }
    ),
    net: useEntry(
      "Net",
      "input",
      [{ current: true, value: job.net.toString() }],
      { type: "number" }
    ),
    vat: useEntry(
      "Vat",
      "datalist",
      [
        { current: true, value: job.vat.toString() },
        { description: "Global", value: "0.19" },
        { description: "Client", value: "0.07" },
        { description: "Suggested", value: "0" },
      ],
      { type: "number" }
    ),
    gross: useEntry(
      "Gross",
      "input",
      [{ current: true, value: job.gross.toString() }],
      { type: "number" }
    ),
    status: useEntry(
      "Status",
      "select",
      Object.entries(Status).map(([, value]) => ({
        value: value,
        current: value === job.status,
      }))
    ),
  };
}
