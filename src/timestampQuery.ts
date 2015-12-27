"use strict";
var promisify = require("bluebird").promisify;

import {exec} from "./exechelper";
import {spawn} from "child_process";
import {Log} from "./logging";
import {openssl} from "./provider";
import * as fs from "fs";

export class TimestampQuery {
    private outFile: string;
    public inFile: string;
    public queryContent = new Buffer('');

    constructor(inFile: string, private useNonce?: boolean) {
        this.inFile = inFile;
        try {
            let stat = fs.statSync(this.inFile);
        } catch (err) {
            Log.error(`File ${this.inFile} does not exist or is not a valid file`);
            throw new Error();
        }
        this.outFile = `${this.inFile}.tsq`;
        if (useNonce === undefined) this.useNonce = true;
    }

    /**
     * Returns the binary output of a request (.tsq file) as Buffer.
     */
    async createQuery(): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            // TODO Mac OS X / Homebrew openssl does not support sha256??
            let args: string[] = ["ts", "-query", "-sha1", "-cert"];
            args = args.concat(["-data", this.inFile]);
            if (!this.useNonce) args.push("-no_nonce");

            let proc = spawn(openssl, args);
            proc.stdout.on('data', data => {
                this.queryContent = Buffer.concat([this.queryContent, data]);
            });
            proc.stdout.on('finish', () => {
                resolve(this.queryContent);
            });
        });
    }

    async writeOutfile(path?: string, overwrite?: boolean) {
        if (!path) path = this.outFile;

        try {
            let stat = fs.statSync(path);
        } catch (err) {
            if (overwrite !== true ) {
                Log.error(`Query output ${path} does already exists, will not overwrite (use --overwrite to force output)`);
                throw err;
            }
        }

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

    async getHumanReadableInfo(path?: string): Promise<string> {
        if (!path && !this.queryContent) {
            throw "Need to call .createQuery() first or supply a path to read from"
        }

        return new Promise<string>((resolve, reject) => {

            let output = '';
            let args = ["ts", "-query", "-text"];
            if (path) args = args.concat(["-in", path]);

            let proc = spawn(openssl, args);
            proc.stdout.on("data", data => {
                output += data.toString("utf-8");
            });
            proc.stdout.on("finish", () => {
                resolve(output);
            });
            // feed stdin if no path was given
            if (!path) {
                proc.stdin.write(this.queryContent);
                proc.stdin.end();
            }
        });
    }
}
