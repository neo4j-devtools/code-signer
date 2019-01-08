import {pkcs7, pki} from "node-forge";
import {DIGEST_ALGORITHM_OID} from './constants';
import {SignOptions} from './types';


export const sign = (options: SignOptions): string => {
    const {data, privateKeyPem, certPem} = options;

    const privateKey = pki.privateKeyFromPem(privateKeyPem);
    const cert = pki.certificateFromPem(certPem);

    const signedData = pkcs7.createSignedData();
    signedData.content = data;
    signedData.addCertificate(cert);
    signedData.addSigner({
        authenticatedAttributes: [
            {
                type: pki.oids.contentType,
                value: pki.oids.data
            },
            {
                type: pki.oids.messageDigest
                // value will be auto-populated at signing time
            },
            {
                type: pki.oids.signingTime
                // value will be auto-populated at signing time
            }
        ],
        certificate: cert,
        digestAlgorithm: DIGEST_ALGORITHM_OID,
        // @ts-ignore
        key: privateKey
    });
    signedData.sign({detached: true});

    // @ts-ignore
    return pkcs7.messageToPem(signedData);
};