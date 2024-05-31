import React from "react";

import { Filter } from "./react";

import { twMerge } from "tailwind-merge";

import type { SummaryDataWithAttrs } from "./react";
import { EntryAccessorAndComponent } from "../Entry/hook";

type FilterEntry<Item> = {
  entry: EntryAccessorAndComponent;
  test: (item: Item, entryValue: string) => boolean;
};

export function useSelection(
  summaryDatas: SummaryDataWithAttrs[],
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

  summaryDatas.forEach((summaryData, index) => {
    if (!selection.includes(index)) {
      return;
    }

    if (summaryData._attrs === undefined) {
      summaryData._attrs = {};
    }
    summaryData._attrs.className = twMerge(
      "bg-red-300 hover:bg-red-200 active:bg-red-100",
      summaryData._attrs.className
    );
  });

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
}
