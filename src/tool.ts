"use strict";

// global configuration
var configuration = new class {
    loglevlel: string = 'debug';
};
var promisify = require("bluebird").promisify;

import {exec} from "./exechelper";
import {openssl, curl} from "./provider";
import * as parseArgs from "minimist";
import {Log} from "./logging";
import * as fs from "fs";

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

class Main {
    async run(argv: string[]) {

        // process.argv[0] = 'node', process.argv[1] = our script name, so remove the first
        // two elements
        let args: any = parseArgs(argv.slice(2));

        let provider: string[] = [];
        if (typeof args.provider === 'string') {
            provider.push(args.provider);
        } else if (typeof args.provider === 'Array') {
            provider = args.provider;
        }

        let files: string[] = args._;

        for (let file of files) {
            try {
                let query = new TimestampQuery(file);
                await query.createQuery();
                await query.writeOutfile();
            } catch (err) {
            }
        }
        return Promise.resolve();
    }
}

let main = new Main();
main.run(process.argv);