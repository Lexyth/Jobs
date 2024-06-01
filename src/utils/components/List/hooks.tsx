import React from "react";

import { Filter } from "./react";
import { Modal } from "../Modal/react";
import { Editor } from "../Editor/react";
import { Button } from "../Button/react";

import type { EntryAccessorAndComponent } from "../Entry/hook";
import type { EntryDataMap, EntryValueMap } from "../Editor/react";

type FilterEntry<Item> = {
  entry: EntryAccessorAndComponent;
  test: (item: Item, entryValue: string) => boolean;
};

// TODO!: return number or number[] depending on singleSelection

export function useSelection<Item>(
  items: Item[],
  initialSelection: null | number | number[],
  onSelectionChange?: (index: number, selection: number[]) => boolean | void
): {
  selection: number[];
  setSelection: React.Dispatch<React.SetStateAction<number[]>>;
  handleSelect: (index: number) => void;
} {
  const singleSelection = !Array.isArray(initialSelection);

  if (!Array.isArray(initialSelection)) {
    if (initialSelection === null) {
      initialSelection = [];
    } else {
      initialSelection = [initialSelection];
    }
  }

  const [selection, setSelection] = React.useState<number[]>(initialSelection);

  const handleChangeSelection = React.useCallback(
    (index: number) => {
      if (setSelection === undefined) return;
      const selectIt = onSelectionChange?.(index, selection);

      if (selectIt === undefined) {
        if (singleSelection) {
          setSelection(selection[0] === index ? [] : [index]);
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
        if (singleSelection) {
          setSelection(selectIt ? [index] : []);
          return;
        }

        if (selectIt) {
          setSelection([...selection, index]);
        } else {
          setSelection(selection.filter((value) => value !== index));
        }
      }
    },
    [onSelectionChange, singleSelection, selection]
  );

  React.useEffect(() => {
    setSelection([]);
  }, [items]);

  return {
    selection: selection,
    setSelection: setSelection,
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

export function useEditor<Item extends {}>(
  onSave: (item: Item, entryValueMap: EntryValueMap) => false | void,
  onDelete: (item: Item) => false | void,
  toEntryDataMap: (item: Item) => EntryDataMap,
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

  const handleSave = React.useCallback(
    (newEntryValueMap: EntryValueMap) => {
      if (itemToEdit === null) {
        throw new Error("No item to save.");
      }

      if (onSave(itemToEdit, newEntryValueMap) !== false) {
        handleCancel();
      }
    },
    [itemToEdit, handleCancel, onSave]
  );

  const handleDelete = React.useCallback(() => {
    if (itemToEdit === null) {
      throw new Error("No item to delete.");
    }

    if (onDelete(itemToEdit) !== false) {
      handleCancel();
    }
  }, [itemToEdit, handleCancel, onDelete]);

  const addButton = (
    <Button
      title="Add"
      onClick={() => handleEditItem(createDefaultItem())}
    />
  );

  let editorComponent = null;
  if (itemToEdit !== null) {
    const entryDataMap = toEntryDataMap(itemToEdit);

    editorComponent = (
      <Modal onClickOutside={handleCancel}>
        <Editor
          entryDataMap={entryDataMap}
          onCancel={() => handleCancel()}
          onSave={(newEntryValueMap) => handleSave(newEntryValueMap)}
          onDelete={() => handleDelete()}
        />
      </Modal>
    );
  }

  return {
    handleEditItem,
    editorComponent,
    addButton,
  };
}
