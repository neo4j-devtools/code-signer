import * as fs from 'fs';
import * as path from 'path';
import {SIGNATURE_FILENAME} from './constants';
import {digestDirectory} from './digest';
import {sign} from './sign';
import {
    InvalidSignatureError,
    SignatureStatus,
    SignOptions,
    VerifyAppResult,
    VerifyAppPayload,
    RevokationStatus
} from './types';
import {verify} from './verify';

export * from './types';

export const signApp = async (
    appPath: string,
    certPath: string,
    keyPath: string,
    passphrase?: string
): Promise<void> => {
    const digest = await digestDirectory(appPath, [SIGNATURE_FILENAME]);

    const options: SignOptions = {
        certPem: fs.readFileSync(certPath, 'utf8'),
        data: digest,
        privateKeyPem: fs.readFileSync(keyPath, 'utf8'),
        passphrase
    };

    const signature = sign(options);
    fs.writeFileSync(path.join(appPath, SIGNATURE_FILENAME), signature);
};

export const verifyApp = async (payload: VerifyAppPayload): Promise<VerifyAppResult> => {
    const {appPath, rootCertificatePem, checkRevocationStatus} = payload;
    const signaturePath = path.join(appPath, SIGNATURE_FILENAME);
    if (!fs.existsSync(signaturePath)) {
        return {
            status: 'UNSIGNED',
            revocationStatus: 'OK'
        };
    }

    const digest = await digestDirectory(appPath, [SIGNATURE_FILENAME]);
    const signaturePem = fs.readFileSync(signaturePath, 'utf8');
    const result = await verify({
        data: digest,
        rootCertificatePem,
        signaturePem,
        checkRevocationStatus
    });

    if (!result.isValid) {
        return Promise.reject(result.error);
    }
    const status: SignatureStatus = result.isTrusted ? 'TRUSTED' : 'UNTRUSTED';
    const revocationStatus: RevokationStatus =
        typeof result['isRevoked'] === 'undefined' ? 'UNKNOWN' : result.isRevoked ? 'REVOKED' : 'OK';

    return {
        status,
        revocationError: result.revocationError,
        revocationStatus,
        signature: signaturePem,
        certificate: result.certificate
    };
};
