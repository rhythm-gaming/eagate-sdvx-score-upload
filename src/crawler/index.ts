import { $ } from "@/message";
import type { SDVXProfile } from "./type";
import { parseAppealCardUrl, parseVolforce } from "./parse";

export class Crawler {
    SDVX_BASE_URL = "/game/sdvx/vi";

    constructor() {}

    async fetchHTML(url: string|URL, options?: RequestInit): Promise<string> {
        return await fetch(url, options).then((res) => res.text());
    }

    async fetchDocument(url: string|URL, options?: RequestInit): Promise<Document> {
        return new DOMParser().parseFromString(await this.fetchHTML(url, options), "text/html");
    }

    async fetchProfile(): Promise<SDVXProfile> {
        const page = await this.fetchDocument(`${this.SDVX_BASE_URL}/playdata/profile/index.html`);

        const rival_id = page.querySelector("#player_id")?.textContent?.trim();
        if(!rival_id) throw new Error($('error_parse_profile', "rival_id"));

        const player_name_container = page.querySelector("#player_name");
        if(!player_name_container) throw new Error($('error_parse_profile', "player_name"));

        const [p1, p2] = player_name_container.children;
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

        const skill_container = page.querySelector("div.profile_skill");
        const skill_name_container = skill_container?.querySelector("div[class^='profile_skillname']");

        if(skill_container && skill_name_container) {
            const skill_level_name = skill_name_container.textContent?.trim() ?? "";
            if(skill_level_name) profile.skill_level_name = skill_level_name;

            const level_ids = [...skill_container.classList].filter((x) => x.startsWith("skill_")).map((x) => x.slice(6));
            if(level_ids.length === 1) {
                let [level_id] = level_ids;

                const skill_name_class_match = skill_name_container.className.match(/^\s*profile_skillname(_[a-z]+)\s*$/i);
                if(skill_name_class_match) {
                    level_id += skill_name_class_match[1].toLowerCase();
                }

                profile.skill_level_id = level_id;
            }
        }

        return profile;
    }
}