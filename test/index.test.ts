import * as fs from 'fs';
import * as fse from 'fs-extra';
import {pki} from 'node-forge';
import * as path from 'path';
import * as tempy from 'tempy';
import {InvalidSignatureError, signApp, verifyApp} from '../src/index';
import {createLeafCert, createRootCert} from './utils';

let appDir: string;
let appSrc: string;
let signature: string;

const caKeys = pki.rsa.generateKeyPair();
const keys = pki.rsa.generateKeyPair();
const ssKeys = pki.rsa.generateKeyPair();

const rootCert = createRootCert(caKeys);
const selfSignedCert = createRootCert(ssKeys);
const cert = createLeafCert(keys, caKeys.privateKey, rootCert);

const privateKeyPath = tempy.file();
const certPath = tempy.file();
const selfSignedCertPath = tempy.file();
const selfSignedKeyPath = tempy.file();

describe('app-signer', () => {

    beforeAll(async () => {
        fs.writeFileSync(privateKeyPath, pki.privateKeyToPem(keys.privateKey));
        fs.writeFileSync(certPath, cert);

        fs.writeFileSync(selfSignedKeyPath, pki.privateKeyToPem(ssKeys.privateKey));
        fs.writeFileSync(selfSignedCertPath, selfSignedCert);
    });

    beforeEach(async () => {
        appDir = tempy.directory();
        appSrc = path.join(appDir, 'index.js');
        fs.writeFileSync(appSrc, 'Sample graph app');
        signature = path.join(appDir, 'signature.pem');
    });

    it('should sign an app', async () => {
        await signApp(appDir, certPath, privateKeyPath);
        expect(fs.existsSync(signature)).toBeTruthy();
    });

    it('should verify a valid signature', async () => {
        await signApp(appDir, certPath, privateKeyPath);
        const result = await verifyApp(appDir, rootCert);

        expect(result.isSigned).toBeTruthy();
        expect(result.isTrusted).toBeTruthy();
    });

    it('should throw if a signed app has been modified', async () => {
        await signApp(appDir, certPath, privateKeyPath);
        fs.writeFileSync(appSrc, 'Hacked');

        const promise = verifyApp(appDir, rootCert);
        return expect(promise).rejects.toEqual(new InvalidSignatureError('Error: Invalid content digest.'));
    });

    xit('should verify a self-signed app as not trusted', async () => {
        await signApp(appDir, selfSignedCertPath, selfSignedKeyPath);

        const result = await verifyApp(appDir, rootCert);

        expect(result.isSigned).toBeTruthy();
        expect(result.isTrusted).toBeFalsy();
    });

    afterEach(() => {
        if (fs.existsSync(appDir)) {
            fse.removeSync(appDir);
        }
    });

    afterAll(async () => {
        fs.unlinkSync(selfSignedCertPath);
        fs.unlinkSync(selfSignedKeyPath);
        fs.unlinkSync(privateKeyPath);
        fs.unlinkSync(certPath);
    });
});