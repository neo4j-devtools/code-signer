import {asn1, md, pkcs7, pki, util} from 'node-forge';
import * as crypto from 'crypto';
import fetch from 'node-fetch';

import {mapCertificateInfo} from './certificate';
import {CERTIFICATION_SERVER_PUBLIC_KEY, CERTIFICATION_SERVER_URL, DIGEST_ALGORITHM_OID} from './constants';
import {VerifyCertResult, VerifyOptions, VerifyResult, VerifySignatureResult} from './types';

export const verify = async (options: VerifyOptions): Promise<VerifyResult> => {
    const {data, signaturePem, rootCertificatePem} = options;

    let isValid = false;
    let isTrusted = false;
    let error;
    let certificate: pki.Certificate | undefined;
    const {didRevocationCheck, isRevoked} = await verifyCertificateNotRevoked(signaturePem);

    try {
        ({certificate} = verifySignature(signaturePem, data));
        ({isValid, isTrusted, error} = verifyCertificate(certificate, rootCertificatePem));
    } catch (e) {
        error = e;
    }

    return {
        certificate: certificate ? mapCertificateInfo(certificate) : undefined,
        error,
        isTrusted,
        isValid,
        didRevocationCheck,
        isRevoked
    };
};

export const verifyCertificate = (certificate: pki.Certificate | string, caPem?: string): VerifyCertResult => {
    const cert = typeof certificate === 'string' ? pki.certificateFromPem(certificate) : certificate;
    const caStore = pki.createCaStore();
    if (caPem) {
        caStore.addCertificate(caPem);
    }

    let isValid = false;
    let isTrusted = false;
    let error;
    try {
        pki.verifyCertificateChain(caStore, [cert]);
        isValid = true;
        isTrusted = true;
    } catch (e) {
        if (isCertError(e) && e.error === 'forge.pki.UnknownCertificateAuthority') {
            ({isValid, error} = verifyUntrustedCert(cert));
        } else {
            error = isCertError(e) ? e.message : e;
        }
    }
    return {
        error,
        isTrusted,
        isValid
    };
};

export function verifyCertificateNotRevoked(signaturePem: string): Promise<{didRevocationCheck: boolean, isRevoked: boolean}> {
    const prepped = crypto.createPublicKey({key: CERTIFICATION_SERVER_PUBLIC_KEY});
    const rand = `${Math.random() * 1000}`;
    const verify = crypto.createVerify('RSA-SHA512');

    verify.update(rand);

    return fetch(CERTIFICATION_SERVER_URL, {
        method: 'POST',
        headers: {
            'X-Request-ID': rand,
            'Content-Type': 'text'
        },
        body: signaturePem
    })
        .then((res) => res.text())
        .then((res) => ({
            didRevocationCheck: true,
            isRevoked: !verify.verify(prepped, res, 'base64')
        }))
        .catch(() => ({
            didRevocationCheck: false,
            isRevoked: false
        }));
}

function verifyUntrustedCert(cert: pki.Certificate) {
    let error;
    try {
        const caStore = pki.createCaStore();
        caStore.addCertificate(cert);
        pki.verifyCertificateChain(caStore, [cert]);
    } catch (e) {
        error = e;
    }
    return {
        error,
        isValid: error === undefined
    };
}

function isCertError(object: any): object is pki.CertificateError {
    return 'error' in object && 'message' in object;
}

export const verifySignature = (signaturePem: string, data: string): VerifySignatureResult => {
    const signedData = pkcs7.messageFromPem(signaturePem);
    const signerInfo = parseSignerInfo(signedData);

    if (signerInfo.signatureAlgorithm !== pki.oids.rsaEncryption) {
        throw new Error(`Unsupported signature algorithm OID: ${signerInfo.signatureAlgorithm}`);
    }

    const signedAttrs = signedData.rawCapture.authenticatedAttributes;
    const attrsDigest = digestAttributes(signedAttrs, signerInfo.digestAlgorithm);

    const certificate = signerInfo.certificate;
    const publicKey = certificate.publicKey as pki.rsa.PublicKey;

    const isValid = publicKey.verify(attrsDigest, signerInfo.signature, 'RSASSA-PKCS1-V1_5');

    if (!isValid) {
        throw new Error('Invalid signature.');
    }

    const dataDigest: md.MessageDigest = md.sha256.create();
    const actualDigest = dataDigest
        .update(data)
        .digest()
        .getBytes();

    if (actualDigest !== signerInfo.messageDigest) {
        throw new Error('Invalid content digest.');
    }

    return {
        certificate,
        isValid: true
    };
};

function digestAttributes(signedAttrs: asn1.Asn1[], algorithm: string): string {
    if (algorithm !== DIGEST_ALGORITHM_OID) {
        throw new Error(`Unsupported digest algorithm OID: ${algorithm}`);
    }
    const attrsAsn1 = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SET, true, signedAttrs);
    const bytes = asn1.toDer(attrsAsn1).getBytes();
    const digest: md.MessageDigest = md.sha256.create();
    return digest
        .update(bytes)
        .digest()
        .getBytes();
}

interface SignerInfo {
    certificate: pki.Certificate;

    messageDigest: string;
    digestAlgorithm: string;

    signature: string;
    signatureAlgorithm: string;

    signingTime?: Date;
}

function parseSignerInfo(data: pkcs7.ParsedPkcsSignedData): SignerInfo {
    const capture = data.rawCapture;
    const signedAttrs = capture.authenticatedAttributes;

    let messageDigest: string | undefined;
    let signingTime: Date | undefined;

    for (let i = 0, l = signedAttrs.length; i < l; ++i) {
        const attributeType = toOid(signedAttrs[i].value[0].value);
        const value = (signedAttrs[i].value[1].value[0].value as unknown) as string;
        if (attributeType === pki.oids.messageDigest) {
            messageDigest = value;
        } else if (attributeType === pki.oids.signingTime) {
            signingTime = asn1.utcTimeToDate(value);
        }
    }
    if (!messageDigest) {
        throw new Error('MessageDigest attribute not found.');
    }

    const certificateSerial = util.createBuffer(capture.serial, 'raw').toHex();
    const certificate = data.certificates.find(cert => cert.serialNumber === certificateSerial);

    if (!certificate) {
        throw new Error(`Certificate not found for serial number ${certificateSerial}.`);
    }

    const digestAlgorithm = asn1.derToOid(capture.digestAlgorithm);
    const signatureAlgorithm = toOid(capture.signatureAlgorithm[0].value);
    const signature = capture.signature;

    return {
        certificate,
        digestAlgorithm,
        messageDigest,
        signature,
        signatureAlgorithm,
        signingTime
    };
}

function toOid(asn: asn1.Asn1[]) {
    return asn1.derToOid((asn as unknown) as util.ByteStringBuffer);
}
