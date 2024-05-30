import React from "react";

import { twMerge } from "tailwind-merge";

type EntryTypesMapping = {
  input: React.InputHTMLAttributes<HTMLInputElement>;
  label: React.LabelHTMLAttributes<HTMLLabelElement>;
  textarea: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  select: React.SelectHTMLAttributes<HTMLSelectElement>;
  datalist: React.InputHTMLAttributes<HTMLInputElement>;
};

type EntryTypeProps = {
  type?: keyof EntryTypesMapping;
  attributes?: EntryTypesMapping[keyof EntryTypesMapping];
};

type ValueState = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

export type EntryProps = {
  title: string;
  defaultDatas?: {
    description?: string;
    value: string;
    current?: boolean;
  }[];
  className?: string;
} & EntryTypeProps;

export function Entry({
  title,
  type = "input",
  defaultDatas = [],
  attributes,
  value,
  setValue,
  className,
}: EntryProps & ValueState) {
  const id = React.useId();

  const options = defaultDatas.map((defaultData) => (
    <option
      key={defaultData.description ?? "" + defaultData.value}
      value={defaultData.value}
    >
      {defaultData.description ?? defaultData.value}
    </option>
  ));

  let element;
  switch (type) {
    case "input":
      element = (
        <input
          {...((attributes as EntryTypesMapping["input"])?.type === "number"
            ? { min: 0, step: 0.01 }
            : {})}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          {...(attributes as EntryTypesMapping["input"])}
          className="max-w-[75%] m-1 p-1 flex-1 rounded border border-slate-400 shadow-md shadow-slate-400 text-center"
        />
      );
      break;

    case "label":
      element = (
        <label
          {...(attributes as EntryTypesMapping["label"])}
          className="max-w-[75%] m-1 p-1 flex-1 rounded border border-slate-400 shadow-md shadow-slate-400 text-center"
        >
          {value}
        </label>
      );
      break;

    case "textarea":
      element = (
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          {...(attributes as EntryTypesMapping["textarea"])}
          className="max-w-[75%] m-1 p-1 flex-1 rounded border border-slate-400 shadow-md shadow-slate-400 text-center"
        />
      );
      break;

    case "select":
      element = (
        <select
          value={value}
          onChange={(event) => setValue(event.target.value)}
          {...(attributes as EntryTypesMapping["select"])}
          className="max-w-[75%] m-1 p-1 indent-2 flex-1 rounded border border-slate-400 shadow-md shadow-slate-400 text-center"
        >
          {options}
        </select>
      );
      break;

    case "datalist": {
      const datalistId = `datalist-${id}`;
      element = (
        <>
          <input
            {...((attributes as EntryTypesMapping["datalist"])?.type ===
            "number"
              ? { min: 0, step: 0.01 }
              : {})}
            list={datalistId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            {...(attributes as EntryTypesMapping["datalist"])}
            className="max-w-[75%] m-1 p-1 flex-1 rounded border border-slate-400 shadow-md shadow-slate-400 text-center"
          />

          <datalist id={datalistId}>{options}</datalist>
        </>
      );
      break;
    }

    default:
      element = (
        <label
          {...(attributes as EntryTypesMapping["label"])}
          className="text-red-500"
        >
          Unsupported element type
        </label>
      );
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
    </div>
  );
}
