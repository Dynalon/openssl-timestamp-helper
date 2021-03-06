"use strict"
require ("colors");

export class Log {
    static info(msg) {
        console.log("INFO:" + msg);
    }
    static error(msg) {
        console.log(msg.red.bold);
    }
    static cmd(msg) {
        console.log("CMD: " + msg);
    }
    static debug(msg) {
        console.log("DEBUG: " + msg);
    }
    static warn(msg) {
        console.log("WARN: " + msg.yellow);
    }
}
