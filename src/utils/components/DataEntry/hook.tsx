import React from "react";

import { DataEntry } from "./react";

import type { DataEntryProps } from "./react";
export type { DataEntryProps };

export function useDataEntry({
    title,
    type = "input",
    inputType = "text",
    defaultDatas = []
}: DataEntryProps): [Value, JSX.Element] {
    const [value, setValue] = React.useState(defaultDatas.find(defaultData => defaultData.current === true)?.value ?? "");

    const component = <DataEntry key={title} title={title} type={type} inputType={inputType} defaultDatas={defaultDatas} value={value} setValue={setValue} />;

    return [value, component];
}