import { EditableList as EditableList } from "../../utils/components/EditableList/react";

import { useClientsHandler } from "./hook";

import { makeListItemsFromClients } from "./script";

import { type Client } from "./store";

// TODO?: add a search field to search for a client

type ClientsProps = {
    className?: string
};

export function Clients({
    className
}: ClientsProps): JSX.Element {

    const clientsHandler = useClientsHandler();

    return <EditableList
        className={className}

        itemType="Client"

        loaded={clientsHandler.loaded}

        createNewItem={(client, newClientData) => ({
            ...client,
            ...newClientData
        })}

        handler={clientsHandler}

        makeItemData={(client: Client) => ({
            name: {
                title: "Name",
                defaultDatas: [
                    { current: true, value: client.name }
                ]
            }
        })}

        makeListItems={(clients) => makeListItemsFromClients(clients)}

        createDefaultItem={() => ({
            id: 0,
            name: "Unknown Client"
        })}
    />;
}