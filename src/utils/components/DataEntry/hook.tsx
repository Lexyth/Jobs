import React from "react";

import { DataEntry } from "./react";

import type { DataEntryProps } from "./react";
export type { DataEntryProps };

export function useDataEntry({
  title,
  type = "input",
  defaultDatas = [],
  attributes,
}: DataEntryProps): [
  string,
  React.Dispatch<React.SetStateAction<string>>,
  JSX.Element
] {
  const [value, setValue] = React.useState(
    defaultDatas.find((defaultData) => defaultData.current === true)?.value ??
      ""
  );

  const component = (
    <DataEntry
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
