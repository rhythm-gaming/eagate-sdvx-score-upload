import { $ } from "@/message";
import type { PageInfo, SDVXMusicPlayDataIndex, SDVXMusicPlayDataIndexData, SDVXProfile } from "./type";
import { getPageInfo, getPlayDataIndexData, parseAppealCardUrl, parseVolforce } from "./parse";

async function fetchPages(params: {parallel?: number, onProgress?: (total_pages: number, curr_page: number) => void}, fetchPage: (curr_page: number) => Promise<number>) {
    let total_pages = 1;
    let curr_page = 1;

    while(curr_page <= total_pages) {
        const target_next_pages = [];
        
        for(; target_next_pages.length < (params.parallel ?? 1) && curr_page <= total_pages; ++curr_page) {
            target_next_pages.push(curr_page);
        }

        params.onProgress?.(total_pages, curr_page-1);

        const page_info_list = await Promise.all(target_next_pages.map(fetchPage));
        total_pages = page_info_list.at(-1)!;
    }
}

export class Crawler {
    SDVX_BASE_URL = "/game/sdvx/vi";

    constructor() {}

    async fetchHTML(url: string|URL, options?: RequestInit): Promise<string> {
        return await fetch(url, options).then((res) => res.text());
    }

    async fetchDocument(url: string|URL, options?: RequestInit): Promise<Document> {
        const doc = new DOMParser().parseFromString(await this.fetchHTML(url, options), "text/html");

        const error_elem = doc.querySelector("#error #explain");
        if(error_elem) {
            throw new Error($('error_fetch_page', error_elem.textContent?.trim() || $('error_unknown')));
        }

        return doc;
    }

    async fetchProfile(): Promise<SDVXProfile> {
        const page = await this.fetchDocument(`${this.SDVX_BASE_URL}/playdata/profile/index.html`);

        const rival_id = page.querySelector("#player_id")?.textContent?.trim();
        if(!rival_id) throw new Error($('error_parse_profile', "rival_id"));

        const player_name_elem = page.querySelector("#player_name");
        if(!player_name_elem) throw new Error($('error_parse_profile', "player_name"));

        const [p1, p2] = player_name_elem.children;
        if(!p1 || !p2) throw new Error($('error_parse_profile', "player_name"));

        const appeal_title = p1.textContent?.trim() ?? "";
        const player_name = p2.textContent?.trim() ?? "";

        const volforce = parseVolforce(page.querySelector("#force_point")?.textContent?.trim());
        if(!Number.isSafeInteger(volforce) || volforce < 0) throw new Error($("error_parse_profile", "volforce"));

        const appeal_card_url = page.querySelector("#apcard img")?.getAttribute("src");
        if(!appeal_card_url) throw new Error($("error_parse_profile", "appeal_card_url"));

        const profile: SDVXProfile = {
            rival_id, player_name, volforce,
            appeal_title, appeal_card_id: parseAppealCardUrl(appeal_card_url),
        };

        const skill_elem = page.querySelector("div.profile_skill");
        const skill_name_elem = skill_elem?.querySelector("div[class^='profile_skillname']");

        if(skill_elem && skill_name_elem) {
            const skill_level_name = skill_name_elem.textContent?.trim() ?? "";
            if(skill_level_name) profile.skill_level_name = skill_level_name;

            const level_ids = [...skill_elem.classList].filter((x) => x.startsWith("skill_")).map((x) => x.slice(6));
            if(level_ids.length === 1) {
                let [level_id] = level_ids;

                const skill_name_class_match = skill_name_elem.className.match(/^\s*profile_skillname(_[a-z]+)\s*$/i);
                if(skill_name_class_match) {
                    level_id += skill_name_class_match[1].toLowerCase();
                }

                profile.skill_level_id = level_id;
            }
        }

        return profile;
    }

    async fetchMusicPlayDataIndex(params: {page: number; limit?: number}): Promise<SDVXMusicPlayDataIndex> {
        const url = new URL(`${this.SDVX_BASE_URL}/playdata/musicdata/index.html`, window.location.origin);
        if(params.page) url.searchParams.set("page", params.page.toString());
        if(params.limit) url.searchParams.set("limit", params.limit.toString());

        const doc = await this.fetchDocument(url);
        const page_info = getPageInfo(doc.querySelector("#playdata .page"));
        if(!page_info) throw new Error($('error_parse_music_play_data_index', 'page_info'));

        return {
            page_info,
            data_list: [...doc.querySelectorAll("div#playdata div#pc-list tr.data_col")].map((elem) => getPlayDataIndexData(elem)).filter((x) => x != null),
        };
    }

    async fetchMusicPlayDataIndexDataList(params: {limit?: number, parallel?: number, onProgress?: (total_pages: number, curr_page: number) => void} = {}): Promise<SDVXMusicPlayDataIndexData[]> {
        const data_list: SDVXMusicPlayDataIndexData[] = [];

        await fetchPages(params, async(curr_page) => {
            const data_index = await this.fetchMusicPlayDataIndex({page: curr_page, limit: params.limit});
            data_list.push(...data_index.data_list);

            return data_index.page_info.total_pages;
        });

        return data_list;
    }
}