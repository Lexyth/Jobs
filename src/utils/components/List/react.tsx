import React from "react";

import { twMerge } from "tailwind-merge";

// TODO?: extract a SelectionList component from List

export type Value = string | number;

export type StyledValue = { value: Value, className: string };

export type Item = Record<string, Value | StyledValue>;

export type SingleSelection = number | null;
export type MultiSelection = Array<number>;

export type Selection = SingleSelection | MultiSelection;

type SelectionProps = {
    selection: Selection,
    setSelection?: (newSelectedItems: Selection) => void,
    singleSelection?: boolean
};

type ListProps = {
    items: Item[],
    /** return true if item selection should change as result of click*/
    onClickItem?: (itemId: number) => boolean | void,
    className?: string
} & Partial<SelectionProps>;

export function List({
    items,
    onClickItem,
    selection,
    setSelection,
    className
}: ListProps) {

    const singleSelection = !Array.isArray(selection);

    const handleSelect = React.useCallback(function (indexInItems: number) {
        if (setSelection === undefined)
            return;

        if (singleSelection) {
            if (selection === indexInItems) {
                setSelection(null);
            } else {
                setSelection(indexInItems);
            } return;
        }

        const newSelection = [...selection];
        const indexInSelection = newSelection.findIndex(value => value === indexInItems);
        if (indexInSelection !== -1) {
            console.log("removing", indexInSelection);
            newSelection.splice(indexInSelection, 1);
        } else {
            console.log("adding", indexInItems);
            newSelection.push(indexInItems);
        }
        setSelection(newSelection);
    }, [singleSelection, selection, setSelection]);

    const handleClickItem = React.useCallback(function (indexInItems: number) {
        if (onClickItem?.(indexInItems) === true) {
            if (setSelection) {
                handleSelect(indexInItems);
            }
        }
    }, [onClickItem, setSelection, handleSelect]);

    return (
        <div
            className={twMerge(
                "w-11/12 m-2 p-2 flex flex-col gap-4 rounded bg-slate-200 shadow shadow-slate-500 transition duration-300",
                className
            )}
        >
            {items.map((item, index) =>
                <Item
                    key={(typeof item["id"] === "object" ? item["id"].value : item["id"]) ?? index}
                    item={item}
                    onClick={() => handleClickItem(index)}
                    selected={(
                        singleSelection
                            ? selection === index
                            : selection.includes(index)
                    ) ? true : false}
                />
            )}
        </div>
    );
}

type ItemProps = {
    item: Item,
    onClick?: () => void,
    selected?: boolean,
    className?: string
};

function Item({
    item,
    onClick,
    selected,
    className
}: ItemProps) {

    const children = Object.entries(item).map(([key, value]) => {
        const className = typeof value === "object" ? value["className"] : "";
        const content = typeof value === "object" ? value["value"] : value;
        const child = (
            <p
                className={twMerge(
                    "flex-1",
                    className
                )}
                key={key}
            >{content}</p>
        );
        return child;
    });

    return (
        <div
            className={twMerge(
                "m-2 p-2 flex flex-row space-between items-center gap-4 rounded bg-slate-100 shadow shadow-slate-600 transition duration-300 hover:bg-slate-300 active:bg-slate-200",
                selected && "bg-slate-300 hover:bg-slate-200 active:bg-slate-100",
                onClick && "cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            {
                children
            }
        </div>
    );
}