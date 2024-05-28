import React from "react";

import { Modal } from "../Modal/react";
import { List } from "../List/react";
import { Editor } from "../Editor/react";
import { Button } from "../Button/react";
import { LoadingSpinner } from "../LoadingSpinner/react";

import { twMerge } from "tailwind-merge";

import type { Job } from "../../../components/Jobs/store";
import type { Client } from "../../../components/Clients/store";
import type { JobsHandler } from "../../../components/Jobs/jobsHandler";
import type { ClientsHandler } from "../../../components/Clients/clientsHandler";
import type { SummaryDataWithAttrs as ListItem } from "../List/react";
import type {
  ItemValues as EditorItemValues,
  ItemData as DataEntryItemData,
} from "../Editor/react";

// TODO: remove undefined from className prop; it's only used for when className is set conditionally, but that should be handeled using spreading {...(condition && { className })}

type Item = Job | Client;
type Handler<Type extends Item> = Type extends Job
  ? JobsHandler
  : Type extends Client
  ? ClientsHandler
  : never;

type EditableListProps<Type extends Item> = {
  items: Type[];
  createNewItem: (item: Type, itemData: EditorItemValues) => Type;
  handler: Handler<Type>;
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

type ItemEditorProps<Type extends Item> = {
  item: Type;
  onCancel: () => void;
  createNewItem: (item: Type, itemData: EditorItemValues) => Type;
  handler: Handler<Type>;
  makeItemData: (item: Type) => DataEntryItemData;
};

export function EditableList<Type extends Item>({
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

  const handleClick = React.useCallback(
    function (index: number) {
      const item = items[index];
      if (item === undefined) {
        throw new Error(
          `No item at index ${index} in list of length ${items.length}.`
        );
      }
      setItemToEdit(item);
    },
    [items]
  );

  const handleEditNewItem = React.useCallback(
    function () {
      const newItem: Type = createDefaultItem();
      setItemToEdit(newItem);
    },
    [createDefaultItem]
  );

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
        summaries={listItems}
        onClick={handleClick}
        {...(filterEntries ? { filterEntries } : {})}
      />

      <Button
        title={`Add`}
        onClick={handleEditNewItem}
      />
    </div>
  );
}

function ItemEditor<Type extends Item>({
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

      console.log(newItem);
      if (!handler.set(newItem as Job & Client)) {
        handler.add(newItem as Job & Client);
      }
    },
    [onCancel, item, createNewItem, handler]
  );

  const handleDeleteItem = React.useCallback(
    function () {
      onCancel();

      if (item) handler.remove(item as Job & Client);
    },
    [onCancel, item, handler]
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
