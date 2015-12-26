"use strict";

import {Log} from "./logging";
import {TimestampQuery} from "./timestampQuery";
import {TimestampRequest} from "./timestampRequest";
import * as P from "./provider";
var colors = require("colors");

import * as parseArgs from "minimist";


class Main {
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
                let query = new TimestampQuery(file, false);
                let queryContent = await query.createQuery();
                await query.writeOutfile();

                let request = new TimestampRequest(queryContent, new P.DfnProvider());
                await request.sendRequest();
            } catch (err) {
                console.log(err);
            }
        }
        return Promise.resolve();
    }
}

let main = new Main();
main.run(process.argv);