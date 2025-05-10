import { $ } from "@/message";
import "./index.css";

export class SDVXCrawlerUI {
    readonly elem: HTMLDivElement;
    readonly status_elem: HTMLDivElement;

    constructor(elem: HTMLDivElement) {
        this.elem = elem;
        this.elem.classList.add("score-upload-ui");

        this.status_elem = this.elem.appendChild(document.createElement('div'));
        this.status_elem.classList.add('status');
        this.status_elem.textContent = $('initializing');
    }

    setStatus(text: string) {
        this.elem.textContent = text;
    }

    unmount() {
        this.elem.remove();
    }
}