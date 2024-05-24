import React from "react";

import { Modal } from "../Modal/react";
import { List } from "../List/react";
import { Editor } from "../Editor/react";
import { Button } from "../Button/react";
import { LoadingSpinner } from "../LoadingSpinner/react";

import { JobsHandler } from "../../../components/Jobs/jobsHandler";
import { ClientsHandler } from "../../../components/Clients/clientsHandler";

import { twMerge } from "tailwind-merge";

import type { Job } from "../../../components/Jobs/store";
import type { Client } from "../../../components/Clients/store";
import type { Item as ListItem } from "../List/react";
import type {
  ItemValues as EditorItemValues,
  ItemData as DataEntryItemData,
} from "../Editor/react";

// TODO: remove undefined from className prop; it's only used for when className is set conditionally, but that should be handeled using spreading {...(condition && { className })}

type EditableListProps<Type extends Job | Client> = {
  items: Type[];
  createNewItem: (item: Type, itemData: EditorItemValues) => Type;
  handler: Type extends Job
    ? JobsHandler
    : Type extends Client
    ? ClientsHandler
    : never;
  makeItemData: (item: Type) => DataEntryItemData;
  makeListItems: (items: Type[]) => ListItem[];
  createDefaultItem: () => Type;
  filterEntries?: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
    JSX.Element
  ][];
  className?: string | undefined;
};

type ItemEditorProps<Type extends Job | Client> = {
  item: Type;
  onCancel: () => void;
  createNewItem: (item: Type, itemData: EditorItemValues) => Type;
  handler: Type extends Job
    ? JobsHandler
    : Type extends Client
    ? ClientsHandler
    : never;
  makeItemData: (item: Type) => DataEntryItemData;
};

export function EditableList<Type extends Job | Client>({
  items,
  createNewItem,
  handler,
  makeItemData,
  makeListItems,
  createDefaultItem,
  filterEntries,
  className,
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

  if (!handler.loaded) {
    return <LoadingSpinner />;
  }

  const listItems: ListItem[] = makeListItems(items);

  return (
    <div
      className={twMerge(
        "m-4 p-4 flex flex-col justify-first items-center gap-4 overflow-x-hidden overflow-y-auto rounded bg-slate-300 shadow shadow-slate-400",
        className
      )}
    >
      {itemToEdit !== null && (
        <ItemEditor
          item={itemToEdit}
          onCancel={() => setItemToEdit(null)}
          createNewItem={createNewItem}
          handler={handler}
          makeItemData={makeItemData}
        />
      )}

      <List
        items={listItems}
        onClickItem={handleClickItem}
        {...(filterEntries ? { filterEntries } : {})}
      />

      <Button
        title={`Add`}
        onClick={handleAddNewItem}
      />
    </div>
  );
}

function ItemEditor<Type extends Job | Client>({
  item,
  onCancel,
  createNewItem,
  handler,
  makeItemData,
}: ItemEditorProps<Type>): JSX.Element {
  const handleEditItem = React.useCallback(
    function (newItemData: EditorItemValues) {
      onCancel();

      if (item === null) throw new Error(`No Item to edit`);

      const newItem = createNewItem(item, newItemData);

      handler.set(newItem as Job & Client);
    },
    [handler, item]
  );

  const handleDeleteItem = React.useCallback(
    function () {
      onCancel();

      if (item) handler.remove(item as Job & Client);
    },
    [handler, item]
  );

  const itemData: DataEntryItemData = makeItemData(item);

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
