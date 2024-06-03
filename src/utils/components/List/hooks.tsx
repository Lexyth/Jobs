import React from "react";

import { Filter } from "./react";
import { Modal } from "../Modal/react";
import { Editor } from "../Editor/react";
import { Button } from "../Button/react";

import type { EntryAccessorAndComponent } from "../Entry/hook";
import type { EntryValueMap } from "../Editor/react";

type FilterEntry<Item> = {
  entry: EntryAccessorAndComponent;
  test: (item: Item, entryValue: string) => boolean;
};

export function useSelection<Item>(
  items: Item[],
  initialSelection?: number[],
  isSingleSelection?: boolean,
  onSelectionChange?: (
    index: number,
    selection: number[]
  ) => boolean | undefined
): {
  selection: number[];
  setSelection: React.Dispatch<React.SetStateAction<number[]>>;
  handleSelect: (index: number) => void;
} {
  const [selection, setSelection] = React.useState<number[]>(
    initialSelection ?? []
  );

  const handleChangeSelection = React.useCallback(
    (index: number) => {
      if (setSelection === undefined) return;
      const selectIt = onSelectionChange?.(index, selection);

      if (selectIt === undefined) {
        // toggle selection

        if (isSingleSelection) {
          const newIndex = selection[0] === index ? [] : [index];
          setSelection(newIndex);
          return;
        }

        const idx = selection.indexOf(index);
        if (idx === -1) {
          setSelection([...selection, index]);
        } else {
          const newSelection = [...selection];
          newSelection.splice(idx, 1);
          setSelection(newSelection);
        }
      } else {
        if (isSingleSelection) {
          const newIndex = selectIt ? [index] : [];
          setSelection(newIndex);
          return;
        }

        if (selectIt) {
          // select
          setSelection([...selection, index]);
        } else {
          // deselect
          setSelection(selection.filter((value) => value !== index));
        }
      }
    },
    [onSelectionChange, selection, isSingleSelection]
  );

  React.useEffect(() => {
    setSelection([]);
  }, [items]);

  return {
    selection,
    setSelection,
    handleSelect: handleChangeSelection,
  };
}

export function useFilter<Item>(
  items: Item[],
  entries: FilterEntry<Item>[]
): {
  filteredItems: Item[];
  component: JSX.Element;
} {
  return React.useMemo(() => {
    const filterComponent = (
      <Filter entries={entries.map(({ entry }) => entry)} />
    );

    const filteredItems: Item[] = items.filter((item) =>
      entries.every(({ test, entry }) => test(item, entry.value))
    );

    return {
      filteredItems,
      component: filterComponent,
    };
  }, [entries, items]);
}

export function useEditor<Item extends object>(
  onSave: (item: Item, entryValueMap: EntryValueMap) => boolean | undefined,
  onDelete: (item: Item) => boolean | undefined,
  toEntryMap: (item: Item) => Record<string, EntryAccessorAndComponent>,
  createDefaultItem: () => Item
): {
  handleEditItem: (item: Item) => void;
  editorComponent: JSX.Element | null;
  addButton: JSX.Element;
} {
  const [itemToEdit, setItemToEdit] = React.useState<Item | null>(null);

  const handleEditItem = React.useCallback((item: Item) => {
    setItemToEdit(item);
  }, []);

  const handleCancel = React.useCallback(() => {
    setItemToEdit(null);
  }, []);

  const handleClick_Add = React.useCallback(() => {
    handleEditItem(createDefaultItem());
  }, [handleEditItem, createDefaultItem]);

  let editorComponent = null;
  if (itemToEdit !== null) {
    editorComponent = (
      <ItemEditor
        item={itemToEdit}
        onSave={onSave}
        onCancel={handleCancel}
        onDelete={onDelete}
        toEntryMap={toEntryMap}
      />
    );
  }

  const addButton = (
    <Button
      title="Add"
      onClick={handleClick_Add}
    />
  );

  return {
    handleEditItem,
    editorComponent,
    addButton,
  };
}

function ItemEditor<Item>({
  item,
  onSave,
  onDelete,
  onCancel,
  toEntryMap,
}: {
  item: Item;
  onSave: (item: Item, entryValueMap: EntryValueMap) => boolean | undefined;
  onDelete: (item: Item) => boolean | undefined;
  onCancel: () => void;
  toEntryMap: (item: Item) => Record<string, EntryAccessorAndComponent>;
}) {
  const entryMap = toEntryMap(item);

  const handleSave = React.useCallback(
    (newEntryValueMap: EntryValueMap) => {
      if (item === null) {
        throw new Error("No item to save.");
      }

      if (onSave(item, newEntryValueMap) !== false) {
        onCancel();
      }
    },
    [item, onCancel, onSave]
  );

  const handleDelete = React.useCallback(() => {
    if (item === null) {
      throw new Error("No item to delete.");
    }

    if (onDelete(item) !== false) {
      onCancel();
    }
  }, [item, onCancel, onDelete]);

  return (
    <Modal onClickOutside={onCancel}>
      <Editor
        entryMap={entryMap}
        onSave={handleSave}
        onCancel={onCancel}
        onDelete={handleDelete}
      />
    </Modal>
  );
}
