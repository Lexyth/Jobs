import React from "react";

import { Entry } from "./react";

import type { EntryProps } from "./react";

export type { EntryProps as EntryProps };

export type EntryAccessorAndComponent = {
  value: string;
  set: React.Dispatch<React.SetStateAction<string>>;
  component: JSX.Element;
};

// TODO: replace object with parameter for each key (e.g. EntryProps["title"])

export function useEntry({
  title,
  type = "input",
  defaultDatas,
  attributes,
}: EntryProps): EntryAccessorAndComponent {
  const [value, setValue] = React.useState(
    (defaultDatas &&
      defaultDatas.find((defaultData) => defaultData.current === true)
        ?.value) ??
      ""
  );

  const entryAccessorAndComponent = React.useMemo(() => {
    console.log("ReMemo entryAccessorAndComponent");
    return {
      value,
      set: setValue,
      component: (
        <Entry
          key={title}
          title={title}
          type={type}
          defaultDatas={defaultDatas ?? []}
          {...(attributes && { attributes })}
          value={value}
          setValue={setValue}
        />
      ),
    };
  }, [value, title, type, defaultDatas, attributes]);

  return entryAccessorAndComponent;
}
