import {asn1, md, pki} from "node-forge";
import {CertificateInfo, Entity, Fingerprints} from './types';

export function mapCertificateInfo(cert: pki.Certificate): CertificateInfo {
    return {
        expires: cert.validity.notAfter,
        issuer: mapEntity(cert.issuer),
        serialNumber: cert.serialNumber,
        subject: mapEntity(cert.subject),
        fingerprints: fingerprints(cert),
    };
}

interface ForgeEntity {
    getField: (sn: string | pki.CertificateFieldOptions) => any;
}

function mapEntity(entity: ForgeEntity): Entity {
    return {
        commonName: getField(entity, 'CN'),
        country: getField(entity, 'C'),
        organization: getField(entity, 'O'),
        organizationalUnit: getField(entity, 'OU')
    };
}

function getField(entity: ForgeEntity, shortName: string): string {
    const field = entity.getField(shortName);
    return !!field ? field.value : '';
}

function fingerprints(cert: pki.Certificate): Fingerprints {
    const bytes = asn1.toDer(pki.certificateToAsn1(cert)).getBytes();
    const sha1: md.MessageDigest = md.sha1.create();
    const md5: md.MessageDigest = md.md5.create();
    return {
        sha1: sha1.update(bytes).digest().toHex(),
        md5: md5.update(bytes).digest().toHex()
    };
}
