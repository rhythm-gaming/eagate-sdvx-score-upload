import { error_message } from "./error";

export const message = {
    ...error_message,
} as const;

function format(s: string, ...args: string[]): string {
    return s.replace(/%(\d+)/g, (_, n) => args[Number(n) - 1]);
}

export const $ = (key: keyof typeof message, ...args: string[]): string => {
    const data = message[key];

    for(const lang of window.navigator.languages) {
        if(Object.hasOwn(data, lang)) {
            const s = data[lang as keyof typeof data];
            return format(s, ...args);
        }
    }

    return format(data['en'] || `message:${key}`, ...args);
};