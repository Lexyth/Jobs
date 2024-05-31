import React from "react";

import { EditableList } from "../../utils/components/EditableList/react";
import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";

import { useClientsHandler } from "./hook";
import { useEntry } from "../../utils/components/Entry/hook";
import { useFilter } from "../../utils/components/List/hooks";

import { makeListItemsFromClients } from "./script";

import { type Client } from "./store";
import { type ItemValues as EditorItemValues } from "../../utils/components/Editor/react";

type ClientsProps = {
  className?: string;
};

// TODO: filter also by company and maybe others.

export function Clients({ className }: ClientsProps): JSX.Element {
  const clientsHandler = useClientsHandler();

  const { filteredItems: filteredClients, component: clientsFilterComponent } =
    useFilter(clientsHandler.getAll(), [
      {
        entry: useEntry({
          title: "Client Name",
        }),
        test: (client, filterValue) =>
          filterValue === "" ||
          client.name.toLowerCase().includes(filterValue.toLowerCase()),
      },
    ]);

  const handleCreateNewItem = React.useCallback(function (
    client: Client,
    newClientData: EditorItemValues
  ) {
    return {
      ...client,
      ...newClientData,
    };
  },
  []);

  const handleMakeItemData = React.useCallback(function (client: Client) {
    return {
      name: {
        title: "Name",
        defaultDatas: [{ current: true, value: client.name }],
      },
    };
  }, []);

  const handleCreateDefaultItem = React.useCallback(function () {
    return {
      id: 0,
      name: "Unknown Client",
    };
  }, []);

  if (!clientsHandler.loaded) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {clientsFilterComponent}

      <EditableList<Client>
        items={filteredClients}
        createNewItem={handleCreateNewItem}
        handler={clientsHandler}
        makeItemData={handleMakeItemData}
        makeListItems={(clients: Client[]) => makeListItemsFromClients(clients)}
        createDefaultItem={handleCreateDefaultItem}
        className={className}
      />
    </>
  );
}
