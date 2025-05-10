import { $ } from "@/message";

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