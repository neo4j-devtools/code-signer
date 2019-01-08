declare module 'folder-hash' {
    export interface HashElementOptions {
        algo?: string; // 'sha1'
        encoding?: string; // 'base64'
        files?: HashElementRules;
        folders?: HashElementRules;
    }

    export interface HashElementRules {
        exclude?: string[];
        include?: string[];
        matchBasename?: boolean; // true
        matchPath?: boolean; // false
        ignoreRootName?: boolean; // false
    }

    export function hashElement(path: string, options?: HashElementOptions): Promise<any>;
}

declare module 'node-forge-extended' {
    import {asn1, pki, util} from 'node-forge';
    module 'node-forge' {
        namespace pkcs7 {
            interface ParsedPkcsSignedData extends PkcsSignedData {
                rawCapture: {
                    authenticatedAttributes: asn1.Asn1[];
                    contentType: util.ByteStringBuffer;
                    digestAlgorithm: util.ByteStringBuffer;
                    digestAlgorithms: asn1.Asn1;
                    serial: util.ByteStringBuffer;
                    signature: string;
                    signatureAlgorithm: asn1.Asn1[];
                };
                certificates: pki.Certificate[];
            }

            function messageFromPem(messagePem: string): ParsedPkcsSignedData;
        }

        namespace asn1 {
            function utcTimeToDate(date: string): Date;
        }

        namespace pki {
            interface CertificateError {
                error:
                    | 'forge.pki.BadCertificate'
                    | 'forge.pki.UnsupportedCertificate'
                    | 'forge.pki.CertificateRevoked'
                    | 'forge.pki.CertificateExpired'
                    | 'forge.pki.CertificateUnknown'
                    | 'forge.pki.UnknownCertificateAuthority';
                message: string;
            }

            interface CaStore {
                addCertificate: (certPem: string | pki.Certificate) => void;
            }

            function createCaStore(certs?: string[] | pki.Certificate[]): CaStore;

            function verifyCertificateChain(
                caStore: CaStore,
                chain: pki.Certificate[],
                verify?: (
                    verified: boolean | CertificateError,
                    depth: number,
                    certs: pki.Certificate[]
                ) => boolean | CertificateError
            ): boolean;
        }
    }
}
