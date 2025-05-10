// @ts-check

/** @import { Plugin } from "esbuild"; */

import fs from "node:fs/promises";

/**
 * @param {string} css 
 */
function createInjectScript(css) {
    const css_str = '['+css.split('\n').map((s) => s.trim()).filter((s) => !!s).map((s) => JSON.stringify(s)).join(',')+'].join("")';
    const css_id = `css-${crypto.randomUUID()}`;

    return `
        const css_id="${css_id}";
        if(!document.getElementById(css_id)) {
            const elem = document.head.appendChild(document.createElement('style'));
            elem.id = css_id;
            elem.appendChild(document.createTextNode(${css_str}));
        }
    `.trim();
}

/** @type {Plugin} */
export const InlineCSSPlugin = {
    name: 'inline-css',
    setup({onLoad}) {
        onLoad({filter: /\.css$/}, async(args) => {
            const css = await fs.readFile(args.path, 'utf-8');
            return {
                contents: createInjectScript(css),
            };
        });
    },
};