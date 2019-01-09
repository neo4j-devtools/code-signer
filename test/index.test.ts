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

const tmpDir = tempy.directory();

const privateKeyPath = path.join(tmpDir, 'privateKey');
const encryptedKeyPath = path.join(tmpDir, 'encryptedKey');
const certPath = path.join(tmpDir, 'cert');
const selfSignedCertPath = path.join(tmpDir, 'ssCert');
const selfSignedKeyPath = path.join(tmpDir, 'ssKey');

describe('app-signer', () => {

    beforeAll(async () => {
        fs.writeFileSync(privateKeyPath, pki.privateKeyToPem(keys.privateKey));
        //@ts-ignore
        fs.writeFileSync(encryptedKeyPath, pki.encryptRsaPrivateKey(keys.privateKey, 'password'));
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

    it('should sign an app with an encrypted key', async () => {
        await signApp(appDir, certPath, encryptedKeyPath, 'password');
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
        if (fs.existsSync(tmpDir)) {
            fse.removeSync(tmpDir);
        }
    });
});