import {pki} from "node-forge";

export const DIGEST_ALGORITHM_OID = pki.oids.sha256;
export const SIGNATURE_FILENAME = 'signature.pem';