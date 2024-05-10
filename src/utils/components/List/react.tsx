import React from "react";

import { twMerge } from "tailwind-merge";

// TODO: consider changing items from an object to an array

// TODO: support selectedItems being an object, array, and single item

// TODO: extract a SelectionList component from List

export type Item = {
    id: number,
    summary: {
        [key: string]: string | number | {
            value: string | number,
            className: string
        }
    }
}

type ListProps = {
    items: Item[],
    /** return false if item selection should not change as result of click*/
    onClickItem?: (itemId: number) => boolean | void,
    selectedItems?: { [key: number]: boolean },
    setSelectedItems?: (newSelectedItems: { [key: number]: boolean }) => void,
    singleSelection?: boolean,
    className?: string
}

export function List({
    items,
    onClickItem,
    selectedItems: selectedItems,
    setSelectedItems: setSelectedItems,
    singleSelection = false,
    className
}: ListProps) {
    const handleSelect = React.useCallback(function (itemId: number) {
        if (setSelectedItems === undefined)
            return;

        if (singleSelection) {
            if (selectedItems?.[itemId] === true)
                setSelectedItems({});
            else
                setSelectedItems({ [itemId]: true });
            return;
        }

        const newSelected = { ...selectedItems };
        if (newSelected[itemId] === true) {
            delete newSelected[itemId];
        } else {
            newSelected[itemId] = true;
        }
        setSelectedItems(newSelected);
    }, [singleSelection, selectedItems, setSelectedItems]);

    const handleClickItem = React.useCallback(function (itemId: number) {
        if (onClickItem?.(itemId) === false)
            return;

        if (setSelectedItems) {
            handleSelect(itemId);
        }
    }, [onClickItem, setSelectedItems, handleSelect]);

    return (
        <div
            className={twMerge(
                "w-11/12 m-2 p-2 flex flex-col gap-4 rounded bg-slate-200 shadow shadow-slate-500 transition duration-300",
                className
            )}
        >
            {items.map((item) =>
                <Item
                    key={item.id}
                    item={item}
                    onClick={() => handleClickItem(item.id)}
                    selected={selectedItems?.[item.id] ? true : false}
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

    const children = Object.entries(item.summary).map(([key, value]) => {
        const className = typeof value === "object" ? value.className : "";
        const content = typeof value === "object" ? value.value : value;
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