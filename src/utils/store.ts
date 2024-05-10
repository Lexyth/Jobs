
// annotate the type that is returned and dont use any
export function createStore<Type>(
    initialValue: Type
) {
    let value: Type = initialValue;

    let listeners: (() => void)[] = [];

    function unsubscribe(listener: () => void) {
        listeners = listeners.filter((l) => l !== listener);
    }

    function subscribe(listener: () => void) {
        listeners.push(listener);

        return () => unsubscribe(listener);
    }

    function getSnapshot() {
        return value;
    }

    function emit() {
        listeners.forEach((listener) => { listener(); });
    }

    return {
        get() { return value; },
        set(newValue: Type) { value = newValue; emit(); },
        subscribe,
        getSnapshot
    }
}