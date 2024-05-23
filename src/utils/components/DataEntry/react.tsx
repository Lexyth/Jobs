import React, { type HTMLInputTypeAttribute } from "react";

import { twMerge } from "tailwind-merge";

export type DataEntryProps = {
    title: string,
    type?: "input" | "label" | "textarea" | "select" | "datalist",
    inputType?: HTMLInputTypeAttribute,
    defaultDatas?: {
        description?: string,
        value: string,
        current?: boolean
    }[],
    className?: string
};

type ValueState = {
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>
};

export function DataEntry({
    title,
    type = "input",
    inputType = "text",
    defaultDatas = [],
    value,
    setValue,
    className
}: DataEntryProps & ValueState) {
    const id = React.useId();

    const options = defaultDatas.map((defaultData) =>
        <option
            key={defaultData.description ?? "" + defaultData.value}
            value={defaultData.value}
        >
            {defaultData.description ?? defaultData.value}
        </option>
    );

    let element;
    switch (type) {
        case "input":
            element = <input
                type={inputType}
                {...(inputType === "number" ? { min: 0, step: 0.01 } : {})}
                className="max-w-[75%] m-1 p-1 flex-1 rounded border border-slate-400 shadow-md shadow-slate-400 text-center"
                value={value}
                onChange={(event) => setValue(event.target.value)}
            />;
            break;

        case "label":
            element = <label
                className="max-w-[75%] m-1 p-1 flex-1 rounded border border-slate-400 shadow-md shadow-slate-400 text-center"
            >{value}</label>;
            break;

        case "textarea":
            element = <textarea
                className="max-w-[75%] m-1 p-1 flex-1 rounded border border-slate-400 shadow-md shadow-slate-400 text-center"
                value={value}
                onChange={(event) => setValue(event.target.value)}
            />;
            break;

        case "select":
            element = <select
                className="max-w-[75%] m-1 p-1 indent-2 flex-1 rounded border border-slate-400 shadow-md shadow-slate-400 text-center"
                value={value}
                onChange={(event) => setValue(event.target.value)}
            >{options}</select>;
            break;

        case "datalist":
            const datalistId = `datalist-${id}`;
            element = (<>
                <input
                    className="max-w-[75%] m-1 p-1 flex-1 rounded border border-slate-400 shadow-md shadow-slate-400 text-center"
                    type={inputType}
                    {...(inputType === "number" ? { min: 0, step: 0.01 } : {})}
                    list={datalistId}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                />

                <datalist id={datalistId}>
                    {options}
                </datalist>
            </>);
            break;

        default:
            element = <label>Unsupported element type</label>;
            break;
    }

    return (
        <div
            className={twMerge(
                "min-w-[40%] m-4 px-4 py-2 flex flex-row justify-between items-center gap-4 flex-1 overflow-hidden rounded bg-slate-200 shadow shadow-slate-400",
                className
            )}
        >
            <p>{title}</p>
            {element}
        </div >
    );
}