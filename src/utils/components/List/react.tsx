import React from "react";

import { twMerge } from "tailwind-merge";
import { Button } from "../Button/react";

// TODO?: extract a SelectionList component from List

export type Value = string | number;

export type StyledValue = { value: Value; className: string };

export type Item = Record<string, Value | StyledValue>;

export type SingleSelection = number | null;
export type MultiSelection = Array<number>;

export type Selection = SingleSelection | MultiSelection;

type SelectionProps = {
  selection: Selection;
  setSelection?: (newSelectedItems: Selection) => void;
  singleSelection?: boolean;
};

type ListProps = {
  items: Item[];
  /** return true if item selection should change as result of click*/
  onClickItem?: (itemId: number) => boolean | void;
  filterEntries?: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
    JSX.Element
  ][];
  className?: string;
} & Partial<SelectionProps>;

type ItemProps = {
  item: Item;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
};

type FilterProps = {
  entries: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
    JSX.Element
  ][];
};

export function List({
  items,
  onClickItem,
  selection,
  setSelection,
  filterEntries,
  className,
}: ListProps) {
  const singleSelection = !Array.isArray(selection);

  const handleSelect = React.useCallback(
    function (indexInItems: number) {
      if (setSelection === undefined) return;

      if (singleSelection) {
        if (selection === indexInItems) {
          setSelection(null);
        } else {
          setSelection(indexInItems);
        }
        return;
      }

      const newSelection = [...selection];
      const indexInSelection = newSelection.findIndex(
        (value) => value === indexInItems
      );
      if (indexInSelection !== -1) {
        console.log("removing", indexInSelection);
        newSelection.splice(indexInSelection, 1);
      } else {
        console.log("adding", indexInItems);
        newSelection.push(indexInItems);
      }
      setSelection(newSelection);
    },
    [singleSelection, selection, setSelection]
  );

  const handleClickItem = React.useCallback(
    function (indexInItems: number) {
      if (onClickItem?.(indexInItems) === true) {
        if (setSelection) {
          handleSelect(indexInItems);
        }
      }
    },
    [onClickItem, setSelection, handleSelect]
  );

  return (
    <div
      className={twMerge(
        "w-11/12 m-2 p-2 flex flex-col gap-4 rounded bg-slate-200 shadow shadow-slate-500 transition duration-300",
        className
      )}
    >
      {filterEntries && <Filter entries={filterEntries} />}

      {items.map((item, index) => (
        <Item
          key={
            (typeof item["id"] === "object" ? item["id"].value : item["id"]) ??
            index
          }
          item={item}
          onClick={() => handleClickItem(index)}
          selected={
            (singleSelection ? selection === index : selection.includes(index))
              ? true
              : false
          }
        />
      ))}
    </div>
  );
}

function Item({ item, onClick, selected, className }: ItemProps) {
  const children = Object.entries(item)
    .filter(([key, _value]) => key !== "id")
    .map(([key, value]) => {
      const className = typeof value === "object" ? value["className"] : "";
      const content = typeof value === "object" ? value["value"] : value;
      const child = (
        <p
          key={key}
          className={twMerge("flex-1", className)}
        >
          {content}
        </p>
      );
      return child;
    });

  return (
    <div
      onClick={onClick}
      className={twMerge(
        "m-2 p-2 flex flex-row space-between items-center gap-4 rounded bg-slate-100 shadow shadow-slate-600 transition duration-300 hover:bg-slate-300 active:bg-slate-200",
        selected && "bg-slate-300 hover:bg-slate-200 active:bg-slate-100",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

function Filter({ entries }: FilterProps): JSX.Element {
  const [visible, setVisible] = React.useState(false);

  if (!visible) {
    return (
      <div>
        <Button
          title="Filter"
          onClick={() => setVisible(true)}
        />
      </div>
    );
  }

  return (
    <div>
      <div>{entries.map((entry) => entry[2])}</div>
      <div>
        <Button
          title="Clear"
          onClick={() => {
            for (const entry of entries) {
              entry[1]("");
            }
          }}
        />
        <Button
          title="Close"
          onClick={() => setVisible(false)}
        />
      </div>
    </div>
  );
}
