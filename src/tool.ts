"use strict";

import {Log} from "./logging";
import {TimestampQuery} from "./timestampQuery";
import {TimestampRequest} from "./timestampRequest";
import * as P from "./provider";
import * as parseArgs from "minimist";
require('colors');
require('js-array-extensions');

class Main {

    async timestampFile(path, provider) {
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

    async verifyFile(path, provider) {
        // TODO cache certificate chain
    };

    async run(argv: string[]) {

        // process.argv[0] = 'node', process.argv[1] = our script name, so remove the first
        // two elements
        let args: any = parseArgs(argv.slice(2));

        let provider: string[] = [];
        if (typeof args.provider === 'string') {
            provider.push(args.provider);
        } else if (typeof args.provider === 'Array') {
            provider.concat(args.provider);
        }

        let files: string[] = args._;

        for (let file of files) {
            try {
                let result = await this.timestampFile(file, new P.DfnProvider());
                let queryInfo = await result.query.getHumanReadableInfo();
                let requestInfo = await result.request.getHumanReadableInfo();

                let timestamp = requestInfo.split("\n")
                    .filter(line => line.startsWith("Time stamp: "))
                    .firstOrDefault()
                    .substring("Time stamp: ".length);

                let status = requestInfo.split("\n")
                    .filter(line => line.startsWith("Status: Granted")).firstOrDefault();

                if (status && timestamp) {
                    let msg: string = `[ OK ] [ ${timestamp} ] ${file}`;
                    console.log(msg.yellow);

                } else throw "Unexpected output received";
            } catch (err) {
                let msg: string = `[ ERROR ] could not timestamp file ${file}: ${err}`;
                console.log(msg.red);
            }
        }
        return Promise.resolve();
    }
}

let main = new Main();
main.run(process.argv);