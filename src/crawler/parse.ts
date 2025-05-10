import { $ } from "@/message";
import type { PageInfo, SDVXMusicPlayDataIndexData } from "./type";

export function parseVolforce(volforce_str: string|null|undefined): number {
    if(!volforce_str) throw new Error($('error_parse_profile', 'volforce'));

    volforce_str = volforce_str.trim();
    if(!volforce_str?.match(/^\d+(\.\d{0,3})?$/)) throw new Error($('error_parse_profile', 'volforce'));

    const dot_ind = volforce_str.indexOf(".");
    if(dot_ind < 0) return parseInt(volforce_str, 10) * 1000;

    const int_part = volforce_str.slice(0, dot_ind);
    let dec_part = volforce_str.slice(dot_ind + 1);
    if(dec_part.length > 3) throw new Error($('error_parse_profile', 'volforce'));

    dec_part = dec_part.padEnd(3, '0');
    return parseInt(int_part, 10) * 1000 + parseInt(dec_part, 10);
}

export function parseAppealCardUrl(appeal_card_url: string): string {
    const match = appeal_card_url.match(/apcard[^?]*\?img=([A-Za-z0-9_\-=]+)/);
    if(!match) throw new Error($('error_parse_profile', 'appeal_card_url'));
    
    return decodeURIComponent(match[1]);
}

export function parseImageUrlPostfix(url: string|null|undefined, needle: string): string|null {
    if(!url) return null;

    const ind = url.indexOf(needle);
    if(ind < 0) return null;

    url = url.slice(ind + needle.length);
    
    const match = url.match(/^([A-Za-z0-9_\-=]+)/);
    if(!match) return null;

    return match[1];
}

export function getPageInfo(elem: Element|null|undefined): PageInfo|null {
    if(!elem) return null;

    let total_pages = 1;

    for(const page_num_elem of elem.querySelectorAll("p.num a span.page_num")) {
        const page_num = parseInt(page_num_elem.textContent?.trim() ?? "", 10);
        if(!Number.isSafeInteger(page_num)) continue;

        if(total_pages < page_num) total_pages = page_num;
    }

    return { total_pages };
}

export function getPlayDataIndexData(elem: Element|null|undefined): SDVXMusicPlayDataIndexData|null {
    if(!elem) return null;

    const [music_elem, ...score_info_elem_list] = elem.querySelectorAll('td');

    const music_link_elem = music_elem.querySelector(".title a");
    if(!music_link_elem) return null;

    const music_id_match = music_link_elem.getAttribute('href')?.match(/music_id=([A-Za-z0-9_\-=]+)/);
    if(!music_id_match) return null;

    const music_id = decodeURIComponent(music_id_match[1]);

    const title = music_link_elem.textContent?.trim() ?? "";
    if(!title) return null;

    const artist = elem.querySelector(".artist")?.textContent?.trim() ?? "";
    if(!artist) return null;

    const diff_list = score_info_elem_list.map((score_info_elem, ind) => {
        const mark_img_elem = score_info_elem.querySelector("img[src*='rival_mark']");
        const mark = parseImageUrlPostfix(mark_img_elem?.getAttribute("src"), "rival_mark_");
        if(!mark || mark === 'no') return;

        const grade_img_elem = score_info_elem.querySelector("img[src*='rival_grade']");
        const grade = parseImageUrlPostfix(grade_img_elem?.getAttribute("src"), "rival_grade_");
        if(!grade || grade === 'no') return;

        const score_txt = score_info_elem.textContent?.trim();
        if(!score_txt?.match(/\d+/)) return null;

        const score = parseInt(score_txt, 10);
        if(!Number.isSafeInteger(score) || score < 0) return null;

        return {
            ind, mark, grade, score,
        } as const;
    }).filter((x) => x != null);

    return {
        music_id,
        title, artist,

        diff_list,
    };
}