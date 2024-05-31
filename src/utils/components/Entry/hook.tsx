import React from "react";

import { Entry } from "./react";

import type { EntryProps } from "./react";

export type { EntryProps as EntryProps };

export type EntryAccessorAndComponent = {
  value: string;
  set: React.Dispatch<React.SetStateAction<string>>;
  component: JSX.Element;
};

export function useEntry({
  title,
  type = "input",
  defaultDatas = [],
  attributes,
}: EntryProps): EntryAccessorAndComponent {
  const [value, setValue] = React.useState(
    defaultDatas.find((defaultData) => defaultData.current === true)?.value ??
      ""
  );

  const component = (
    <Entry
      key={title}
      title={title}
      type={type}
      defaultDatas={defaultDatas}
      {...(attributes && { attributes })}
      value={value}
      setValue={setValue}
    />
  );

  return { value, set: setValue, component };
}
