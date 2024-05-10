import React from "react";

import { Modal } from "../../utils/components/Modal/react.jsx";
import { List, type Item as ListItem } from "../../utils/components/List/react.jsx";
import { Editor, type ItemValues } from "../../utils/components/Editor/react.jsx";
import { Button } from "../../utils/components/Button/react.jsx";

import { useClientsHandler } from "./hook.js";

import { type Client } from "./store.js";

import { twMerge } from "tailwind-merge";

type ClientsProps = {
    className?: string
};

export function Clients({
    className
}: ClientsProps): JSX.Element {
    const clientsHandler = useClientsHandler();

    const [clientToEdit, setClientToEdit] = React.useState<Client | null>(null);

    function openClientEditor(client: Client) {
        setClientToEdit(client);
    }

    function closeClientEditor() {
        setClientToEdit(null);
    }

    function handleEditClient(newClientData: ItemValues) {
        closeClientEditor();

        if (clientToEdit === null)
            throw new Error("No client to edit");

        const newClient: Client = {
            ...clientToEdit,
            ...newClientData
        }
        clientsHandler.setClient(newClient);
    }

    function handleDeleteClient() {
        closeClientEditor();

        if (clientToEdit)
            clientsHandler.removeClient(clientToEdit);
    }

    function handleAddNewClient() {
        const id = clientsHandler.getClients().reduce((id, client) => client.id > id ? client.id : id, 0) + 1;
        const newClient = {
            id: 0, // auto set when added via clientsHandler.addClient
            name: "Client " + id
        };
        if (clientsHandler.addClient(newClient) === -1)
            console.warn("Could not add client: ", newClient);
    }

    const clients = clientsHandler.getClients();
    const items: ListItem[] = clients.map((client) => ({
        id: client.id,
        summary: {
            "name": client.name
        }
    }))

    return (
        <div
            className={twMerge(
                "m-4 p-4 flex flex-col justify-first items-center gap-4 overflow-x-hidden overflow-y-auto rounded bg-slate-300 shadow shadow-slate-400",
                className
            )}
        >
            {clientToEdit
                && <Modal onClickOutside={closeClientEditor}>
                    <Editor
                        itemData={{
                            name: {
                                title: "Name",
                                defaultDatas: [
                                    { current: true, value: clientToEdit.name }
                                ]
                            }
                        }}
                        onSave={handleEditClient}
                        onCancel={closeClientEditor}
                        onDelete={handleDeleteClient}
                    />
                </Modal>
            }

            <List
                items={items}
                onClickItem={(clientId: number) => {
                    const client = clients.find((client) => client.id === clientId);
                    if (client !== undefined) {
                        openClientEditor(client);
                    }
                }}
            />

            <Button
                title="Add New Client"
                onClick={handleAddNewClient}
            />

        </div>
    );
}