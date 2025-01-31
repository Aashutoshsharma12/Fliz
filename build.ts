/**
 * Remove old files, copy front-end ones.
 */

import fs from "fs-extra";
const logger = require("./src/logger");
import childProcess from "child_process";

(async () => {
    try {
        // Remove current build
        await remove('./dist/');
        // Copy front-end files
        await createDirIfNotExists('./dist/pre-start/env');
        await copy('./src/public', './dist/public');
        await copy('./src/pre-start/env/production.env', './dist/pre-start/env/production.env');
        await copy('./src/pre-start/env/development.env', './dist/pre-start/env/development.env');
        // Copy back-end files
        // await exec('tsc --build tsconfig.prod.json && tsc-alias -p tsconfig.json', './')
        await exec('tsc --build tsconfig.prod.json && tsc-alias -p tsconfig.prod.json', './');

    } catch (err) {
        logger.error({
            message: err.message,
            stack: err instanceof Error ? err.stack : undefined,  // Access stack only if it's an instance of Error
            status: err.statusCode,
        });
    }
})();

async function createDirIfNotExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        console.log('enerrrr', dirPath)
        await fs.mkdirp(dirPath);
    }
}

function remove(loc: string): Promise<void> {
    return new Promise((res, rej) => {
        return fs.remove(loc, (err) => {
            return (!!err ? rej(err) : res());
        });
    });
}

function copy(src: string, dest: string): Promise<void> {
    return new Promise((res, rej) => {
        return fs.copy(src, dest, (err) => {
            return (!!err ? rej(err) : res());
        });
    });
}

function exec(cmd: string, loc: string): Promise<void> {
    return new Promise((res, rej) => {
        return childProcess.exec(cmd, { cwd: loc }, (err, stdout, stderr) => {
            if (!!stdout) {
                logger.info(stdout);
            }
            if (!!stderr) {
                logger.warn(stderr);
            }
            return (!!err ? rej(err) : res());
        });
    });
}
