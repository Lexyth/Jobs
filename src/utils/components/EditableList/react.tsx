import React from "react";

import { Modal } from "../Modal/react";
import { List, type Item as ListItem } from "../List/react";
import { Editor, type ItemValues as EditorItemValues, type ItemData as EditorItemData } from "../Editor/react";
import { Button } from "../Button/react";
import { LoadingSpinner } from "../LoadingSpinner/react";

import { JobsHandler } from "../../../components/Jobs/jobsHandler";
import { ClientsHandler } from "../../../components/Clients/clientsHandler";

import { twMerge } from "tailwind-merge";

import type { Job } from "../../../components/Jobs/store";
import { type Client } from "../../../components/Clients/store";

type EditableListProps<Type extends Job | Client> = {
    className?: string | undefined,
    loaded: boolean,
    itemType: string,
    createNewItem: (item: Type, itemData: EditorItemValues) => Type,
    handler: Type extends Job ? JobsHandler : Type extends Client ? ClientsHandler : never,
    makeItemData: (item: Type) => EditorItemData,
    makeListItems: (items: Type[]) => ListItem[],
    createDefaultItem: () => Type
};

type ItemEditorProps<Type extends Job | Client> = {
    item: Type,
    onCancel: () => void,
    itemType: string,
    createNewItem: (item: Type, itemData: EditorItemValues) => Type,
    handler: Type extends Job ? JobsHandler : Type extends Client ? ClientsHandler : never,
    makeItemData: (item: Type) => EditorItemData
}

export function EditableList<Type extends Job | Client>({
    className,
    loaded,
    itemType,
    createNewItem,
    handler,
    makeItemData,
    makeListItems,
    createDefaultItem
}: EditableListProps<Type>): JSX.Element {
    const [itemToEdit, setItemToEdit] = React.useState<Type | null>(null);

    const handleClickItem = React.useCallback(function (itemId: number) {
        const item = handler.get(itemId) as Type | undefined;
        if (item !== undefined) {
            setItemToEdit(item);
        }
    }, []);

    const handleAddNewItem = React.useCallback(function () {
        const newItem: Type = createDefaultItem();

        handler.add(newItem as Job & Client);

        setItemToEdit(newItem);
    }, []);

    if (!loaded) {
        return <LoadingSpinner />;
    }

    const items = handler.getAll() as Type[];
    const listItems: ListItem[] = makeListItems(items);

    return (
        <div
            className={twMerge(
                "m-4 p-4 flex flex-col justify-first items-center gap-4 overflow-x-hidden overflow-y-auto rounded bg-slate-300 shadow shadow-slate-400",
                className
            )}
        >
            {itemToEdit !== null &&
                <ItemEditor item={itemToEdit} onCancel={() => setItemToEdit(null)} itemType={itemType} createNewItem={createNewItem} handler={handler} makeItemData={makeItemData} />
            }

            <List items={listItems} onClickItem={handleClickItem} />

            <Button title={`Add New ${itemType}`} onClick={handleAddNewItem} />
        </div>
    );
}

function ItemEditor<Type extends Job | Client>({
    item,
    onCancel,
    itemType,
    createNewItem,
    handler,
    makeItemData
}: ItemEditorProps<Type>): JSX.Element {

    const handleEditItem = React.useCallback(function (newItemData: EditorItemValues) {
        onCancel();

        if (item === null)
            throw new Error(`No ${itemType} to edit`);

        const newItem = createNewItem(item, newItemData);

        handler.set(newItem as Job & Client);
    }, [handler, item]);

    const handleDeleteItem = React.useCallback(function () {
        onCancel();

        if (item)
            handler.remove(item as Job & Client);
    }, [handler, item]);

    const itemData: EditorItemData = makeItemData(item);

    return (
        <Modal onClickOutside={onCancel}>
            <Editor
                itemData={itemData}
                onSave={handleEditItem}
                onCancel={onCancel}
                onDelete={handleDeleteItem}
            />
        </Modal>
    );
}