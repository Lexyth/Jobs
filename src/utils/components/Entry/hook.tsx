import React from "react";

import { Entry } from "./react";

import type { EntryProps } from "./react";

export type { EntryProps as EntryProps };

const DEFAULT_defaultDatas: [] = [];

export type EntryAccessorAndComponent = {
  value: string;
  set: React.Dispatch<React.SetStateAction<string>>;
  component: JSX.Element;
};

export function useEntry(
  title: EntryProps["title"],
  type: EntryProps["type"] = "input",
  defaultDatas?: EntryProps["defaultDatas"],
  attributes?: EntryProps["attributes"]
): EntryAccessorAndComponent {
  const [value, setValue] = React.useState(
    (defaultDatas &&
      defaultDatas.find((defaultData) => defaultData.current === true)
        ?.value) ??
      ""
  );

  const entryAccessorAndComponent = React.useMemo(() => {
    return {
      value,
      set: setValue,
      component: (
        <Entry
          key={title}
          title={title}
          type={type}
          defaultDatas={defaultDatas ?? DEFAULT_defaultDatas}
          {...(attributes && { attributes })}
          value={value}
          setValue={setValue}
        />
      ),
    };
  }, [value, title, type, defaultDatas, attributes]);

  return entryAccessorAndComponent;
}
