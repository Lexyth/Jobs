export function enumMemberFromString(string: string, enumObj: any) {
  const entries = Object.entries(enumObj);
  const index = entries.findIndex(([, v]) => v === string);
  if (index === -1) {
    throw new Error("Invalid enum value: " + string);
  }
  const entry = entries[index];
  if (entry === undefined) {
    throw new Error("Invalid enum value: " + string);
  }
  let e = enumObj[entry[0] as keyof typeof enumObj];
  return e;
}
