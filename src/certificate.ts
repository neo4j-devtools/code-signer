import {pki} from "node-forge";
import {CertificateInfo, Entity} from './types';

export function mapCertificateInfo(cert: pki.Certificate): CertificateInfo {
    return {
        expires: cert.validity.notAfter,
        issuer: mapEntity(cert.issuer),
        serialNumber: cert.serialNumber,
        subject: mapEntity(cert.subject)
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