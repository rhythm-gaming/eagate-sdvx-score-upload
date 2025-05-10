export class Uploader {
    readonly url: URL;

    constructor(url: URL|string) {
        this.url = new URL(url);
    }

    async upload(data: unknown) {
        
    }
}