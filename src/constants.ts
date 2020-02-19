import {pki} from "node-forge";

export const DIGEST_ALGORITHM_OID = pki.oids.sha256;
export const SIGNATURE_FILENAME = 'signature.pem';
export const CERTIFICATION_SERVER_PUBLIC_KEY = '';
export const CERTIFICATION_SERVER_URL = 'http://localhost:3000/verify';
