// @ts-check
/** @import { BuildParams } from "./builder" */
/** @import { BuildOptions } from "esbuild"; */

import esbuild from "esbuild";

export class Builder {
    /** @type {BuildParams} */
    args;

    /**
     * @param {Partial<BuildParams>} args
     */
    constructor(args) {
        this.args = {
            mode: 'dev',
            sourcemap: 'linked',
            ...args,
        };
    }

    async run() {
        console.log("Builder running with:", this.args);

        const build_config = await this.creteBuildConfig();
        await esbuild.build(build_config);
    }

    /* esbuild configs */

    /** @returns {Promise<BuildOptions>} */
    async creteBuildConfig() {
        return {
            entryPoints: ["./src/index.ts"],
            bundle: true,
            outfile: this.opt_outfile,
            target: ["chrome135", "firefox137"],

            alias: {
                "react": "preact/compat",
                "react-dom/test-utils": "preact/test-utils",
                "react-dom": "preact/compat",
                "react/jsx-runtime": "preact/jsx-runtime",
            },

            minify: this.opt_minify,
            sourcemap: this.opt_sourcemap,
        };
    }

    get opt_outfile() {
        switch(this.args.mode) {
            case 'dev': return "./dist/upload.dev.js";
            case 'prod': return "./dist/upload.js";
        }
    }

    get opt_minify() {
        switch(this.args.mode) {
            case 'dev': return false;
            case 'prod': return true;
        }

        throw new Error(`Invalid mode: ${this.args.mode}`);
    }

    /** @type {BuildParams['sourcemap']} */
    get opt_sourcemap() {
        return this.args.sourcemap;
    }
}