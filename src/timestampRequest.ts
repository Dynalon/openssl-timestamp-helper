"use strict";

var colors = require("colors");
var promisify = require("bluebird").promisify;
var BPromise = require("bluebird").Promise;

import {spawn} from "child_process";
import {Log} from "./logging";
import * as fs from "fs";

import {TimestampQuery} from "./timestampQuery";
import {TimestampProvider, openssl, curl as CURL} from "./provider";

export class TimestampRequest {
    public outFile: string;
    public requestContent: Buffer = new Buffer("");

    private provider: TimestampProvider;
    private query: TimestampQuery;

    constructor(query: TimestampQuery, provider: TimestampProvider, outFile?: string) {
        if (!query) {
            throw new Error("query is undefined");
        }
        if (!provider) {
            throw new Error("provider cannot be undefined");
        }

        this.query = query;
        this.provider = provider;
        if (!outFile) {
            this.outFile = `${this.query.inFile}.${provider.name}.tsr`;
        }
    }

    /**
     * Returns the binary output of a request (.tsq file) as string.
     */
    async sendRequest(): Promise<void> {
        let dfd = BPromise.defer();
        let args = [ "-s", "-S", "-H", "Content-Type: application/timestamp-query",
            "--data-binary", "@-", this.provider.tsEndpoint
        ];
        let curl = spawn(CURL, args);
        curl.stdout.on("data", chunk => {
            this.requestContent = Buffer.concat([this.requestContent, chunk]);
        });
        curl.stdout.on("finish", () => {
            dfd.resolve(this.requestContent);
        });
        curl.stdin.write(this.query.queryContent);
        curl.stdin.end();

        return dfd.promise;

    }

    async writeOutfile(path?: string): Promise<string> {
        if (path) this.outFile = path;

        let writeFile = promisify(fs.writeFile);

        try {
            await writeFile(this.outFile, this.requestContent);
            return this.outFile;
        }
        catch (err) {
            Log.error(`Could not write content to file: ${path}`);
            throw err;
        }
    }

    /**
     * Gets a human readable string with information about the request.
     * Unfortunately, openssl does not allow to read from stdin in this case, and we won't use
     * /dev/stdin so we remain compatible to windows. We read-back from the file, even if we could
     * read from the buffer. This requires prior calling .writeOutfile() !
     */
    async getHumanReadableInfo(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this.requestContent) {
                throw "Need to .sendRequest() and .writeOutfile() first!";
            }
            let output = "";
            let args = ["ts", "-reply", "-text"];
            args = args.concat("-in", this.outFile);
            let proc = spawn(openssl, args);

            proc.stdout.on("data", data => {
                output += data.toString("utf-8");
            });
            proc.stdout.on("finish", data => {
                resolve(output);
            });
            proc.stdin.write(this.requestContent);
            proc.stdin.end();
        });
    }
}