import {pki} from "node-forge";

export const DIGEST_ALGORITHM_OID = pki.oids.sha256;
export const SIGNATURE_FILENAME = 'signature.pem';
export const CERTIFICATION_SERVER_PUBLIC_KEY = `
@todo: add verification server public cert
`;
export const CERTIFICATION_SERVER_URL = 'https://trust.neo4j.com/api/v1/verify/app/signature';
