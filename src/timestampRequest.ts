"use strict";

var colors = require("colors");
var promisify = require("bluebird").promisify;
var BPromise = require("bluebird").Promise;

import {spawn} from "child_process";
import {exec} from "./exechelper";
import {Log} from "./logging";
import {TimestampProvider, openssl, curl as CURL} from "./provider";
import * as fs from "fs";

export class TimestampRequest {
    public outFile: string;
    private provider: TimestampProvider;
    private requestContent: Buffer = new Buffer('');
    private queryContent: Buffer;

    constructor(queryContent: Buffer, provider: TimestampProvider, outFile?: string) {
        if (!queryContent) {
            throw new Error("queryContent is undefined");
        }
        if (!provider) {
            throw new Error("provider cannot be undefined");
        }

        this.queryContent = queryContent;
        this.provider = provider;
        this.outFile = outFile;
    }

    /**
     * Returns the binary output of a request (.tsq file) as string.
     */
    async sendRequest(): Promise<void> {
        let dfd = BPromise.defer();
        let args = [ "-s", "-S", "-H", "Content-Type: application/timestamp-query",
            "--data-binary", "@-", "http://zeitstempel.dfn.de"
        ];
        let curl = spawn(CURL, args);
        curl.stdout.on('data', chunk => {
            this.requestContent = Buffer.concat([this.requestContent, chunk]);
        });
        let fp = fs.createWriteStream('output.tsr');
        curl.stdout.pipe(fp);
        curl.stdin.write(this.queryContent);
        curl.stdin.end();
        curl.stdout.on('finish', () => {
            dfd.resolve(this.requestContent);
        });
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