export class Uploader {
    readonly url: URL;

    constructor(url: URL|string) {
        this.url = new URL(url);
    }

    async upload(source: string, data: unknown) {
        const form = document.body.appendChild(document.createElement('form'));
        form.action = this.url.toString();
        form.method = 'POST';

        const createInput = (name: string, value: string) => {
            const input = form.appendChild(document.createElement('input'));
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            return input;
        };

        createInput('source', source);
        createInput('data', JSON.stringify(data));

        form.submit();
    }
}