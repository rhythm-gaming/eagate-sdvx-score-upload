import { EAGATE_ORIGIN, IDENT, UPLOAD_URL } from "./core";
import { Crawler } from "./crawler";
import { $ } from "./message";
import { SDVXCrawlerUI } from "./ui";
import { Uploader } from "./uploader";

async function main() {
    if(IDENT in window && window[IDENT]) {
        throw new Error($('error_already_running'));
    }

    (window as unknown as { [key: string]: unknown })[IDENT] = true;

    if(window.location.origin !== EAGATE_ORIGIN) {
        throw new Error($('error_not_eagate'));
    }

    const ui_elem = document.createElement("div");
    document.body.appendChild(ui_elem);

    const ui = new SDVXCrawlerUI(ui_elem);
    const crawler = new Crawler();

    ui.setStatus($('fetching_profile'));
    const profile = await crawler.fetchProfile();

    const index_data_list = await crawler.fetchMusicPlayDataIndexDataList({
        limit: 150,
        parallel: 3,
        onProgress(total_pages, curr_page) {
            ui.setStatus($('fetching_play_data_index', curr_page, total_pages));
        },
    });

    ui.setStatus($('uploading_play_data', index_data_list.length));

    const uploader = new Uploader(UPLOAD_URL);
    await uploader.upload('music-data', {
        profile,
        musics: index_data_list,
    });
}

main().catch((err: Error) => {
    alert(err.message || $('error_unknown'));
    console.error(err);
}).finally(() => {
    delete window[IDENT as keyof Window];
});