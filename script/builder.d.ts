export interface BuildParams {
    mode: 'dev'|'prod';
    sourcemap: boolean|'linked'|'external'|'inline'|'both';
}