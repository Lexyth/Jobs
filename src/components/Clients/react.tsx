import React from "react";

import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";
import { List } from "../../utils/components/List/react";

import { useHandler as useClientsHandler } from "./hooks";
import { useEntryMap } from "./hooks";
import { useEntry } from "../../utils/components/Entry/hook";
import { useFilter, useEditor } from "../../utils/components/List/hooks";

import { toSummaryData } from "./script";

import { twMerge } from "tailwind-merge";

import type { Client } from "./store";

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
      return true;
    },
    (client: Client) => {
      clientsHandler.remove(client);
      return true;
    },
    useEntryMap,
    createDefaultItem
  );

  const handleToSummaryData = React.useCallback(
    (client: Client) => toSummaryData(client),
    []
  );

  const handleClick_List = React.useCallback(
    (index: number) => {
      const client = filteredClients[index];
      if (client === undefined)
        throw new Error(`Expected item at index ${index}.`);
      handleEditClient(client);
    },
    [handleEditClient, filteredClients]
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
        toSummaryData={handleToSummaryData}
        onClick={handleClick_List}
      />

      {addButton}
    </div>
  );
}
