"use strict";
var promisify = require("bluebird").promisify;
var MemoryStream = require("memory-stream");
import {exec} from "./exechelper";
import {spawn} from "child_process";
import {Log} from "./logging";
import {openssl} from "./provider";
import * as fs from "fs";
var BPromise = require("bluebird").Promise;

export class TimestampQuery {
    public outFile: string;
    private queryContent = new Buffer('');

    constructor(private inFile: string, private useNonce?: boolean) {
        this.outFile = inFile + '.tsq';
        if (useNonce === undefined) this.useNonce = true;
    }

    /**
     * Returns the binary output of a request (.tsq file) as string.
     */
    async createQuery(): Promise<Buffer> {
        let dfd = BPromise.defer();
        // TODO Mac OS X / Homebrew openssl does not support sha256??
        let args: string[] = ["ts", "-query", "-sha1"];
        args = args.concat(["-data", this.inFile]);
        if (!this.useNonce) args.push("-no_nonce");

        let os = spawn(openssl, args);
        os.stdout.on('data', data => {
            this.queryContent = Buffer.concat([this.queryContent, data]);
        });
        os.stdout.on('finish', () => {
            dfd.resolve(this.queryContent);
        });
        return dfd.promise;
    }

    async writeOutfile(path?: string) {
        if (!path) path = `${this.inFile}.tsq`;
        let writeFile = promisify(fs.writeFile);

        try {
            if (!this.queryContent) throw ('queryContent is undefined');
            await writeFile(path, this.queryContent, 'binary');
        }
        catch (err) {
            Log.error(`Could not write content to file: ${path}`);
            throw err;
        }
    }
}