import { error_message } from "./error";

export const message = {
    ...error_message,

    initializing: {
        en: "Initializing...",
        ko: "초기화 중...",
        ja: "初期化中...",
    },
    fetching_profile: {
        en: "Fetching profile...",
        ko: "프로필 읽는 중...",
    },
    fetching_play_data_index: {
        en: "Fetching play data index (%1 of %2)...",
        ko: "플레이 데이터 목록 읽는 중 (%1/%2)...",
    },
    fetching_play_data: {
        en: "Fetching play data (%1 of %2)...",
        ko: "플레이 데이터 읽는 중 (%1/%2)...",
    },
} as const;

function format(s: string, ...args: unknown[]): string {
    return s.replace(/%(\d+)/g, (s, n) => {
        const arg = args[parseInt(n, 10) - 1];
        if(arg == null) return s;
        return String(arg);
    });
}

export const $ = (key: keyof typeof message, ...args: unknown[]): string => {
    const data = message[key];

    for(const lang of window.navigator.languages) {
        if(Object.hasOwn(data, lang)) {
            const s = data[lang as keyof typeof data];
            return format(s, ...args);
        }
    }

    return format(data['en'] || `message:${key}`, ...args);
};