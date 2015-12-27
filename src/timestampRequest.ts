"use strict";

var promisify = require("bluebird").promisify;

import 'js-array-extensions';

import {spawn} from "child_process";
import {Log} from "./logging";
import * as fs from "fs";

import {TimestampQuery} from "./timestampQuery";
import {TimestampProvider, openssl, curl as CURL} from "./provider";

export class TimestampRequest {
    private _outFile: string;
    public get outFile () {
        return this._outFile;
    }

    public requestContent: Buffer = new Buffer("");

    private provider: TimestampProvider;
    private query: TimestampQuery;

    constructor(query: TimestampQuery, provider: TimestampProvider, _outFile?: string) {
        if (!query) {
            throw new Error("query is undefined");
        }
        if (!provider) {
            throw new Error("provider cannot be undefined");
        }

        this.query = query;
        this.provider = provider;
        this._outFile = `${this.query.inFile}.${provider.name}.tsr`;
    }

    /**
     * Returns the binary output of a request (.tsq file) as string.
     */
    async sendRequest(): Promise<Buffer> {
        let args = [ "-s", "-S", "-H", "Content-Type: application/timestamp-query",
            "--data-binary", "@-", this.provider.tsEndpoint
        ];

        return new Promise<Buffer>((resolve, reject) => {
            let curl = spawn(CURL, args);
            curl.stdout.on("data", chunk => {
                this.requestContent = Buffer.concat([this.requestContent, chunk]);
            });
            curl.stdout.on("finish", () => {
                resolve(this.requestContent);
            });
            curl.stdin.write(this.query.queryContent);
            curl.stdin.end();
        });
    }

    async writeOutfile(path?: string, overwrite?: boolean): Promise<string> {
        if (path) this._outFile = path;
        let writeFile = promisify(fs.writeFile);
        let fileExists = true;
        try {
            let stat = fs.statSync(this._outFile);
        } catch (err) {
            fileExists = false;
        } finally {
            if (!fileExists || overwrite) {
                await writeFile(this._outFile, this.requestContent);
                return this._outFile;
            } else {
                Log.error(`File ${this._outFile} already exists and --overwrite was not given, will not overwrite!`);
                throw new Error();
            }
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
            args = args.concat("-in", this._outFile);
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

    async getTimestamp(): Promise<string> {
        let output = await this.getHumanReadableInfo();

        let status = output.split("\n")
            .filter(line => line.startsWith("Status: Granted")).firstOrDefault();

        if (!status)
            throw "Unexpected output, request could not be created";

        let timestamp = output.split("\n")
            .filter(line => line.startsWith("Time stamp: "))
            .firstOrDefault()
            .substring("Time stamp: ".length);

        if (!timestamp)
            throw "Error parsing output";

        return timestamp;
    }
}
