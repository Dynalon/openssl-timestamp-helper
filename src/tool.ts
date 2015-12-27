"use strict";

import {Log} from "./logging";
import {TimestampQuery} from "./timestampQuery";
import {TimestampRequest} from "./timestampRequest";
import {TimestampVerify} from "./timestampVerify";
import * as P from "./provider";

import * as fs from "fs";
import * as parseArgs from "minimist";

var promisify = require("bluebird").promisify;
require('colors');


class Main {

    async timestampFile(path: string, provider: P.TimestampProvider, verify?: boolean) {
        let query = new TimestampQuery(path, false);
        await query.createQuery();

        let request = new TimestampRequest(query, provider);
        await request.sendRequest();
        await request.writeOutfile();

        return {
            query: query,
            request: request
        };
    }

    async verifyFile(originalFile, requestFile, provider): Promise<void> {
        let verify = new TimestampVerify(originalFile, requestFile, provider);
        let valid = await verify.verifyRequest();
        if (!valid) {
            // delete the .tsr file again
            fs.unlinkSync(requestFile);
            throw new Error("Verification failed");
        }
    };

    async run(argv: string[]) {

        // process.argv[0] = 'node', process.argv[1] = our script name, so remove the first
        // two elements
        let args: any = parseArgs(argv.slice(2));

        let wantedProvider: string[] = [];
        if (typeof args.provider === 'string') {
            wantedProvider.push(args.provider);
        } else if (typeof args.provider === 'Array') {
            wantedProvider.concat(args.provider);
        }

        let skipVerification = false;
        let saveQuery = false;
        let files: string[] = args._;
        let provider = new P.DfnProvider();

        for (let file of files) {
            try {
                let result = await this.timestampFile(file, provider);
                let timestamp = await result.request.getTimestamp();

                // verify with the cert of provider to be sure everything went well
                let verificationMsg = '[ UNVERIFIED ]'.bold;

                if (!skipVerification) {
                    await this.verifyFile(result.query.inFile, result.request.outFile, provider);
                    verificationMsg = '[ VERIFIED ]'.bold;
                }

                let msg: string = '[ OK ] '.green.bold.toString() + verificationMsg;
                msg += ` [ ${timestamp} ] ${result.query.inFile} -> ${result.request.outFile}`;
                console.log(msg);
            } catch (err) {
                let msg: string = `could not timestamp file ${file}: ${err}`;
                Log.error(msg);
            }
        }
        return Promise.resolve();
    }
}

let main = new Main();
main.run(process.argv);
