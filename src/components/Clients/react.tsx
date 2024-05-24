import React from "react";

import { EditableList } from "../../utils/components/EditableList/react";
import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";

import { useClientsHandler } from "./hook";
import { useDataEntry } from "../../utils/components/DataEntry/hook";

import { makeListItemsFromClients } from "./script";

import { type Client } from "./store";
import { type ItemValues as EditorItemValues } from "../../utils/components/Editor/react";

type ClientsProps = {
  className?: string;
};

export function Clients({ className }: ClientsProps): JSX.Element {
  const clientsHandler = useClientsHandler();

  const [filterClientName, setFilterClientName, filterClientNameComponent] =
    useDataEntry({
      title: "Client Name",
    });

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

  let clients: Client[] = clientsHandler.getAll();

  if (filterClientName !== "") {
    clients = clients.filter((client) =>
      client.name.toLowerCase().includes(filterClientName.toLowerCase())
    );
  }

  return (
    <EditableList<Client>
      items={clients}
      createNewItem={handleCreateNewItem}
      handler={clientsHandler}
      makeItemData={handleMakeItemData}
      makeListItems={(clients: Client[]) => makeListItemsFromClients(clients)}
      createDefaultItem={handleCreateDefaultItem}
      filterEntries={[
        [filterClientName, setFilterClientName, filterClientNameComponent],
      ]}
      className={className}
    />
  );
}
