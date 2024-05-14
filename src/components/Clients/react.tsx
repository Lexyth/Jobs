import React from "react";

import { Modal } from "../../utils/components/Modal/react";
import { List, type Item as ListItem } from "../../utils/components/List/react";
import { Editor, type ItemValues as EditorItemValues, type ItemData as EditorItemData } from "../../utils/components/Editor/react";
import { Button } from "../../utils/components/Button/react";
import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";

import { useClientsHandler } from "./hook";

import { makeListItemsFromClients } from "./script";

import { type Client } from "./store";

import { twMerge } from "tailwind-merge";

type ClientsProps = {
    className?: string
};

type ClientEditorProps = {
    client: Client,
    onCancel: () => void,
}

type ClientListProps = {
    clients: Client[],
    onClickItem: (clientId: number) => void,
}

type AddNewClientButtonProps = {
    openClientEditor: (client: Client) => void
}

export function Clients({
    className
}: ClientsProps): JSX.Element {
    const clientsHandler = useClientsHandler();

    const [clientToEdit, setClientToEdit] = React.useState<Client | null>(null);

    const openClientEditor = React.useCallback(function (client: Client) {
        setClientToEdit(client);
    }, []);

    const closeClientEditor = React.useCallback(function () {
        setClientToEdit(null);
    }, []);

    const handleClickClient = React.useCallback(function (clientId: number) {
        const client = clientsHandler.getClient(clientId);
        if (client !== undefined) {
            openClientEditor(client);
        }
    }, [clientsHandler, openClientEditor]);

    if (!clientsHandler.loaded) {
        return <LoadingSpinner />
    }

    const clients = clientsHandler.getClients();

    return (
        <div
            className={twMerge(
                "m-4 p-4 flex flex-col justify-first items-center gap-4 overflow-x-hidden overflow-y-auto rounded bg-slate-300 shadow shadow-slate-400",
                className
            )}
        >
            {clientToEdit && <ClientEditor client={clientToEdit} onCancel={closeClientEditor} />}

            <ClientList clients={clients} onClickItem={handleClickClient} />

            <AddNewClientButton openClientEditor={openClientEditor} />

        </div>
    );
}

function ClientEditor({
    client,
    onCancel,
}: ClientEditorProps): JSX.Element {

    const clientsHandler = useClientsHandler();

    const handleEditClient = React.useCallback(function (newClientData: EditorItemValues) {
        onCancel();

        if (client === null)
            throw new Error("No client to edit");

        const newClient: Client = {
            ...client,
            ...newClientData
        }

        clientsHandler.setClient(newClient);
    }, [client, clientsHandler]);

    const handleDeleteClient = React.useCallback(function () {
        onCancel();

        if (client)
            clientsHandler.removeClient(client);
    }, [client, clientsHandler]);

    const itemData: EditorItemData = {
        name: {
            title: "Name",
            defaultDatas: [
                { current: true, value: client.name }
            ]
        }
    };
    return (
        <Modal onClickOutside={onCancel}>
            <Editor
                itemData={itemData}
                onSave={handleEditClient}
                onCancel={onCancel}
                onDelete={handleDeleteClient}
            />
        </Modal>
    );
}

function ClientList({
    clients,
    onClickItem
}: ClientListProps): JSX.Element {
    const items: ListItem[] = makeListItemsFromClients(clients);

    return <List items={items} onClickItem={onClickItem} />;
}

function AddNewClientButton({
    openClientEditor
}: AddNewClientButtonProps): JSX.Element {
    const clientsHandler = useClientsHandler();

    const handleAddNewClient = React.useCallback(function () {
        const newClient = {
            id: 0, // auto set when added via clientsHandler.addClient
            name: "Unknown Client"
        };

        clientsHandler.addClient(newClient);

        openClientEditor(newClient);
    }, [clientsHandler])

    return <Button title="Add New Client" onClick={handleAddNewClient} />;
}