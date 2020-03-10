#!/usr/bin/env node

import * as fs from 'fs';
import * as parseArgs from 'minimist';
import {signApp, verifyApp} from '.';

run();

async function run() {
    const args = parseArgs(process.argv);
    const skipRevocationCheck = !!args['skip-revocation-check'];
    try {
        if (args.verify) {
            const rootCert = args['root-cert'] ? fs.readFileSync(args['root-cert'], 'utf8') : undefined;
            const result = await verifyApp({
                appPath: args.app,
                rootCertificatePem: rootCert,
                checkRevocationStatus: !skipRevocationCheck
            });
            console.dir(result);
            if (result.status === 'UNSIGNED') {
                process.exit(1);
            }
        } else {
            await signApp(args.app, args.cert, args['private-key'], args.passphrase);
            console.log('Signed successfully.');
        }
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}
