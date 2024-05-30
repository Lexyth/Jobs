import React from "react";

import { Entry } from "./react";

import type { EntryProps } from "./react";
export type { EntryProps as EntryProps };

export function useEntry({
  title,
  type = "input",
  defaultDatas = [],
  attributes,
}: EntryProps): [
  string,
  React.Dispatch<React.SetStateAction<string>>,
  JSX.Element
] {
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

  return [value, setValue, component];
}
