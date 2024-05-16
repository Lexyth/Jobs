export function enumMemberFromString(string: string, _enum: any) {
    const entries = Object.entries(_enum);
    const index = entries.findIndex(([, v]) => v === string);
    if (index === -1) {
        throw new Error("Invalid enum value: " + string);
    }
    const entry = entries[index];
    if (entry === undefined) {
        throw new Error("Invalid enum value: " + string);
    }
    let e = _enum[entry[0] as keyof typeof _enum];
    return e;
}