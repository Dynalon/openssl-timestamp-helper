import {exec} from "./exechelper";

export class TimestampQuery {
    public outFile: string;
    private queryContent;

    constructor(private inFile: string, private useNonce?: boolean) {
        if (useNonce === undefined) useNonce = true;
    }

    /**
     * Returns the binary output of a request (.tsq file) as string.
     */
    async createQuery(): Promise<string> {
        let cmd = `${openssl} ts -query -data ${this.inFile} -sha256`;
        if (!this.useNonce) cmd += " -no_nonce";
        try {
            Log.cmd(cmd);
            var result = await exec(cmd);
            this.queryContent = result.stdout;
            Log.debug(this.queryContent);
            return this.queryContent;
        } catch (err) {
            Log.error(result.stderr);
            throw (err);
        }
    }

    async writeOutfile(path?: string) {
        if (!path) path = `${this.inFile}.tsq`;
        let writeFile = promisify(fs.writeFile);

        try {
            await writeFile(path, this.queryContent);
        }
        catch (err) {
            Log.error(`Could not write content to file: ${path}`);
            throw err;
        }
    }
}