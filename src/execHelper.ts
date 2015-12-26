"use strict";
var BPromise = require("bluebird").Promise;
import {exec as execAsync} from "child_process";

interface SuccessResult {
    stdout: string,
    stderr: string
}
interface ErrorResult extends SuccessResult {
    error: any;
}

// helper so that we can use promise instead of callback for node api
export var exec = (cmd: string, options?: any): Promise<SuccessResult> => {
    let dfd = BPromise.defer();
    execAsync(cmd, options, (error, stdout, stderr) => {
        if (error || stderr.length > 0) {
            throw (stderr.toString('utf-8'));
        } else {
            dfd.resolve(stdout);
        }
    });
    return dfd.promise;
}
