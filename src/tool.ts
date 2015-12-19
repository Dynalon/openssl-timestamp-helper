"use strict";

import {Log} from "./logging";
import {TimestampQuery} from "./timestampQuery";

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
            provider = args.provider;
        }

        let files: string[] = args._;

        for (let file of files) {
            try {
                let query = new TimestampQuery(file);
                await query.createQuery();
                await query.writeOutfile();
            } catch (err) {
            }
        }
        return Promise.resolve();
    }
}

let main = new Main();
main.run(process.argv);