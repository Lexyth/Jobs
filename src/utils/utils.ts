export function enumMemberFromString<
  EnumType extends Record<string, string | number>
>(string: string, enumObj: EnumType): EnumType[keyof EnumType] {
  const entries = Object.entries(enumObj);
  const index = entries.findIndex(([, v]) => v === string);
  if (index === -1) {
    throw new Error(`Key ${string} not found in ${enumObj}`);
  }
  const entry = entries[index];
  const e = enumObj[entry?.[0] as keyof typeof enumObj];
  return e;
}
