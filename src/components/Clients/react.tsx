import React from "react";

import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";
import { List } from "../../utils/components/List/react";

import { useClientsHandler } from "./hook";
import { useEntry } from "../../utils/components/Entry/hook";
import { useFilter, useEditor } from "../../utils/components/List/hooks";

import { toSummaryData } from "./script";

import { twMerge } from "tailwind-merge";

import type { Client } from "./store";
import type { EntryDataMap } from "../../utils/components/Editor/react";

type ClientsProps = {
  className?: string;
};

// TODO: filter also by company and maybe others.

export function Clients({ className }: ClientsProps): JSX.Element {
  const clientsHandler = useClientsHandler();

  const { filteredItems: filteredClients, component: clientsFilterComponent } =
    useFilter(clientsHandler.getAll(), [
      {
        entry: useEntry("Client Name"),
        test: (client, filterValue) =>
          filterValue === "" ||
          client.name.toLowerCase().includes(filterValue.toLowerCase()),
      },
    ]);

  const toEntryDataMap = React.useCallback((client: Client): EntryDataMap => {
    return {
      name: {
        title: "Name",
        defaultDatas: [{ current: true, value: client.name }],
      },
    };
  }, []);

  const createDefaultItem = React.useCallback((): Client => {
    return {
      id: 0,
      name: "Unknown Client",
    };
  }, []);

  const {
    handleEditItem: handleEditClient,
    editorComponent,
    addButton,
  } = useEditor(
    (client: Client, entryValues) => {
      const newClient = { ...client, ...entryValues };

      if (!clientsHandler.set(newClient)) {
        clientsHandler.add(newClient);
      }
    },
    (client: Client) => {
      clientsHandler.remove(client);
    },
    toEntryDataMap,
    createDefaultItem
  );

  if (!clientsHandler.loaded) {
    return <LoadingSpinner />;
  }

  return (
    <div
      className={twMerge(
        "m-4 p-4 flex flex-col justify-first items-center gap-4 overflow-x-hidden overflow-y-auto rounded bg-slate-300 shadow shadow-slate-400",
        className
      )}
    >
      {clientsFilterComponent}

      {editorComponent}

      <List
        items={filteredClients}
        toSummaryData={(client) => toSummaryData(client)}
        onClick={(index) => {
          const client = filteredClients[index];
          if (client === undefined)
            throw new Error(`Expected item at index ${index}.`);
          handleEditClient(client);
        }}
      />

      {addButton}
    </div>
  );
}
