import { EAGATE_ORIGIN } from "./core";
import { Crawler } from "./crawler";
import { $ } from "./message";

async function main() {
    if(window.location.origin !== EAGATE_ORIGIN) {
        throw new Error($('error_not_eagate'));
    }

    const crawler = new Crawler();
    const profile = await crawler.fetchProfile();

    console.log(profile);
}

main().catch((err: Error) => {
    alert(err.message || $('error_unknown'));
    console.error(err);
});