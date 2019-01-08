import * as fs from 'fs';
import * as path from 'path';
import {SIGNATURE_FILENAME} from './constants';
import {digestDirectory} from './digest';
import {sign} from './sign';
import {InvalidSignatureError, SignOptions, VerifyAppResult} from './types';
import {verify} from './verify';

export * from './types';

export const signApp = async (appPath: string, cert: string, key: string): Promise<void> => {
    const digest = await digestDirectory(appPath, [SIGNATURE_FILENAME]);

    const options: SignOptions = {
        certPem: fs.readFileSync(cert, 'utf8'),
        data: digest,
        privateKeyPem: fs.readFileSync(key, 'utf8')
    };

    const signature = sign(options);
    fs.writeFileSync(path.join(appPath, SIGNATURE_FILENAME), signature);
};


export const verifyApp = async (appPath: string, rootCertificatePem?: string): Promise<VerifyAppResult> => {

    const signaturePath = path.join(appPath, SIGNATURE_FILENAME);
    if (!fs.existsSync(signaturePath)) {
        return {
            isSigned: false,
            isTrusted: false
        };
    }

    const digest = await digestDirectory(appPath, [SIGNATURE_FILENAME]);
    const signaturePem = fs.readFileSync(signaturePath, 'utf8');
    const result = verify({
        data: digest,
        rootCertificatePem,
        signaturePem
    });

    if (!result.isValid) {
        return Promise.reject(new InvalidSignatureError(result.error));
    }
    return {
        ...result,
        isSigned: true
    };
};