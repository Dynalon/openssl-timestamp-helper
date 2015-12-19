"use strict";
var promisify = require("bluebird").promisify;

import {exec} from "./exechelper";
import {Log} from "./logging";
import {TimestampProvider, openssl, curl} from "./provider";
import * as fs from "fs";

export class TimestampRequest {
    public outFile: string;
    private requestContent: string;
    private provider: TimestampProvider;
    private query: string;

    constructor(query: string, provider: TimestampProvider, outFile?: string) {
        if (!query) {
            throw new Error("query is empty");
        }
        if (!provider) {
            throw new Error("provider cannot be undefined");
        }

        this.query = query;
        this.provider = provider;
        this.outFile = outFile;
    }

    /**
     * Returns the binary output of a request (.tsq file) as string.
     */
    async sendRequest(): Promise<string> {
       // look at .swpan() to pipe the inputs
    }

    async writeOutfile(path?: string) {
        if (!path) path = `${this.outFile}`;
        let writeFile = promisify(fs.writeFile);

        try {
            await writeFile(path, this.requestContent);
        }
        catch (err) {
            Log.error(`Could not write content to file: ${path}`);
            throw err;
        }
    }
}