import {pki} from 'node-forge';


export function createRootCert(keys: pki.KeyPair) {
    const cert = createCert(keys);
    const attrs = getAttrs('Neo4j, Inc.', 'Neo4j Desktop - Code Signing');
    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    cert.sign(keys.privateKey);
    return pki.certificateToPem(cert);
}

export function createLeafCert(keys: pki.KeyPair, caKey: pki.PrivateKey, caPem: string) {
    const caCert = pki.certificateFromPem(caPem);
    const cert = createCert(keys);
    const attrs = getAttrs('Graph App Vendor', 'Graph App Vendor - Code Signing');
    cert.setSubject(attrs);
    cert.setIssuer(caCert.subject.attributes);

    cert.sign(caKey);
    return pki.certificateToPem(cert);
}

function createCert(keys: pki.KeyPair) {
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    return cert;
}

function getAttrs(organization: string, cn: string) {
    return [
        {
            name: 'commonName',
            value: cn
        },
        {
            name: 'countryName',
            value: 'US'
        },
        {
            shortName: 'ST',
            value: 'CA'
        },
        {
            name: 'localityName',
            value: 'San Mateo'
        },
        {
            name: 'organizationName',
            value: organization
        },
        {
            shortName: 'OU',
            value: 'Test'
        }
    ];
}
