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
export var exec = (cmd: string, options?: any): Promise<SuccessResult | ErrorResult> => {
    let dfd = BPromise.defer();
    execAsync(cmd, options, (error, stdout, stderr) => {
        let result: any  = {
            stdout: stdout,
            stderr: stderr
        };

        if (error || stderr.length > 0) {
            result.error = error;
            dfd.reject(result);
        } else {
            dfd.resolve(result);
        }
    });
    return dfd.promise;
}
