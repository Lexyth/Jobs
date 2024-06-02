import React from "react";

import { Button } from "../Button/react";

import { twMerge } from "tailwind-merge";

import type { EntryAccessorAndComponent as Entry } from "../Entry/hook";

export type ValueWithClassName = { value: string; className: string };

/** value | {value, className} */
export type SummaryValue = string | ValueWithClassName;

export type SummaryData = Record<string, SummaryValue>;

export type SummaryDataWithAttrs = SummaryData & {
  _attrs?: JSX.IntrinsicAttributes & {
    className?: string;
  };
};

export type SummaryProps = {
  summaryData: SummaryDataWithAttrs;
  onClick?: () => void;
  className?: string;
};

export type ListProps<Item extends object> = {
  items: Item[];
  toSummaryData: (item: Item) => SummaryDataWithAttrs;
  onClick?: (index: number, items: Item[]) => void;
  className?: string;
};

export type FilterProps = {
  entries: Entry[];
};

/**
 * You can prefix keys with an underscore (e.g.: _id) if you want them to be ignored.
 * @param summary
 * @param onClick
 * @param className
 */
export function Summary({
  summaryData,
  onClick,
  className,
}: SummaryProps): JSX.Element {
  const textRow = Object.entries(summaryData).map(([key, value]) => {
    if (key.startsWith("_")) return null;

    let className: string = "";
    let text: string;
    if (typeof value === "string") {
      text = value;
    } else {
      text = (value as ValueWithClassName).value;
      className = (value as ValueWithClassName).className;
    }
    const textCell = (
      <span
        key={key}
        className={twMerge("flex-1", className)}
      >
        {text}
      </span>
    );
    return textCell;
  });

  return (
    <div
      onClick={onClick}
      className={twMerge(
        "m-2 p-2 flex flex-row space-between items-center gap-4 rounded bg-slate-100 shadow shadow-slate-600 transition duration-300 hover:bg-slate-300 active:bg-slate-200",
        onClick && "cursor-pointer",
        className
      )}
    >
      {textRow}
    </div>
  );
}

export function List<Item extends object>({
  items,
  toSummaryData,
  onClick,
  className,
}: ListProps<Item>): JSX.Element {
  const createClickHandler = React.useCallback(
    (index: number) => {
      return () => {
        onClick?.(index, items);
      };
    },
    [onClick, items]
  );

  return (
    <div
      className={twMerge(
        "w-11/12 m-2 p-2 flex flex-col gap-4 rounded bg-slate-200 shadow shadow-slate-500 transition duration-300",
        className
      )}
    >
      {items.map((item, index) => {
        const summaryData = toSummaryData(item);
        return (
          <Summary
            key={index}
            {...summaryData["_attrs"]}
            summaryData={summaryData}
            onClick={createClickHandler(index)}
          />
        );
      })}
    </div>
  );
}

export function Filter({ entries }: FilterProps): JSX.Element {
  const [expanded, setExpanded] = React.useState(false);

  const handleClose = React.useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const handleClear = React.useCallback(() => {
    for (const entry of entries) {
      entry.set("");
    }
  }, [entries]);

  if (!expanded) {
    return (
      <div>
        <Button
          title="Filter"
          onClick={handleClose}
        />
      </div>
    );
  }

  return (
    <div>
      <div>{entries.map((entry) => entry.component)}</div>
      <div>
        <Button
          title="Clear"
          onClick={handleClear}
        />
        <Button
          title="Close"
          onClick={handleClose}
        />
      </div>
    </div>
  );
}
