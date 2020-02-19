import {pki} from 'node-forge';

export type SignatureStatus = 'TRUSTED' | 'UNSIGNED' | 'UNTRUSTED';

export interface VerifyAppResult {
    status: SignatureStatus;
    certificate?: CertificateInfo;
    signature?: string;
    isRevoked?: boolean;
    didRevocationCheck?: boolean;
}

export class InvalidSignatureError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export interface VerifyOptions {
    data: string;
    signaturePem: string;
    rootCertificatePem?: string;
}

export interface VerifyResult {
    isValid: boolean;
    isTrusted: boolean;
    isRevoked: boolean;
    didRevocationCheck: boolean;
    error?: any;
    certificate?: CertificateInfo;
}

export interface SignOptions {
    data: string;
    privateKeyPem: string; //TODO: use password protected keystore instead (see PKCS#12)
    passphrase?: string;
    certPem: string;
}

export interface VerifySignatureResult {
    isValid: boolean;
    certificate: pki.Certificate;
}

export interface VerifyCertResult {
    isValid: boolean;
    isTrusted: boolean;
    error?: any;
}

export interface CertificateInfo {
    issuer: Entity;
    subject: Entity;
    serialNumber: string;
    expires: Date;
    fingerprints: Fingerprints;
}

export interface Fingerprints {
    sha1: string;
    md5: string;
}

export interface Entity {
    organization: string;
    organizationalUnit: string;
    commonName: string;
    country: string;
}
