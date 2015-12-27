"use strict";

var promisify = require("bluebird").promisify;
import * as fs from "fs";

import {spawn} from "child_process";
import {Log} from "./logging";
import {TimestampProvider, openssl} from "./provider";

export class TimestampVerify {

    constructor(
        public originalFile: string,
        public requestFile: string,
        private provider: TimestampProvider
    ) {}

    private async invokeVerification(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let args = ["ts", "-verify"];
            let output = '';
            args = args.concat(["-data", this.originalFile]);
            args = args.concat(["-in", this.requestFile]);
            // this makes us essential UNIX only, no windows support :(
            args = args.concat(["-CAfile", "/dev/stdin"]);

            let proc = spawn(openssl, args);
            proc.stdout.on('data', data => {
                output += data.toString('utf-8');
            });
            proc.stdout.on('finish', () => {
                resolve(output);
            });
            proc.stdin.write(this.provider.certificateChain);
            proc.stdin.end();
        });
    }

    public async verifyRequest(): Promise<boolean> {
        let output = await this.invokeVerification();
        if (!output.startsWith("Verification: OK")) {
            return false;
        }
        return true;
    }
}
