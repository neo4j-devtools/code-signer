import {pki} from 'node-forge';
import {mapCertificateInfo} from '../src/certificate';

describe('certificate', () => {

    it('should parse certificate info', async () => {

        const cert = mapCertificateInfo(pki.certificateFromPem(certPem));
        expect(cert).toEqual({
            expires: new Date('2020-01-09T09:10:15.000Z'),
            issuer:
                {
                    commonName: 'Neo4j Desktop - Code Signing',
                    country: 'US',
                    organization: 'Neo4j, Inc.',
                    organizationalUnit: 'Test'
                },
            serialNumber: '01',
            subject:
                {
                    commonName: 'Graph App Vendor - Code Signing',
                    country: 'US',
                    organization: 'Graph App Vendor',
                    organizationalUnit: 'Test'
                },
            fingerprints:
                {
                    sha1: '17f9e4ca86198869e887c15d01d12be2225a6abe',
                    md5: 'd6486db818f8baaff23d3422112e1e3b'
                }
        })
    });
});

const certPem = '-----BEGIN CERTIFICATE-----\n' +
    'MIIDdjCCAl6gAwIBAgIBATANBgkqhkiG9w0BAQUFADB6MSUwIwYDVQQDExxOZW80\n' +
    'aiBEZXNrdG9wIC0gQ29kZSBTaWduaW5nMQswCQYDVQQGEwJVUzELMAkGA1UECBMC\n' +
    'Q0ExEjAQBgNVBAcTCVNhbiBNYXRlbzEUMBIGA1UEChMLTmVvNGosIEluYy4xDTAL\n' +
    'BgNVBAsTBFRlc3QwHhcNMTkwMTA5MDkxMDE1WhcNMjAwMTA5MDkxMDE1WjCBgjEo\n' +
    'MCYGA1UEAxMfR3JhcGggQXBwIFZlbmRvciAtIENvZGUgU2lnbmluZzELMAkGA1UE\n' +
    'BhMCVVMxCzAJBgNVBAgTAkNBMRIwEAYDVQQHEwlTYW4gTWF0ZW8xGTAXBgNVBAoT\n' +
    'EEdyYXBoIEFwcCBWZW5kb3IxDTALBgNVBAsTBFRlc3QwggEiMA0GCSqGSIb3DQEB\n' +
    'AQUAA4IBDwAwggEKAoIBAQCc7PgjtcLCEpugB57TEjdManpopM/EnIMNPgANEw1g\n' +
    '6Cyw5C4Ivi844Vded+jWxCNIIWbabD/0pitBBt9pX9eE83MQRo390TkCtjimuDjh\n' +
    'wDl/v+a3jg4o03lqSgJaGLjhNkHO9xnYpRaE0Lm76Q4Btew370l3luwowMi3ixdc\n' +
    'rRnvN1AupGekyHaB63lMnExb4YSLguf1Zo1K6XPkEa4plxLBi3wrZrKWeQW98i8G\n' +
    'jICQXyNCGo0fUrd0L7EfU+jhSRd/H/nV3Cz9j7pFRlpHHsjX6QSP2tOScbUm8VY/\n' +
    '+xeuPI0A7pD8nhBBoClcBoz+LoimmHtMHhO+Q/lPX5znAgMBAAEwDQYJKoZIhvcN\n' +
    'AQEFBQADggEBAEfXgTcB/P8f1/2MZjstbOxGHMC3jaoBd+GtVRBveGp1S6aLmwDa\n' +
    '4k5jLjF5DDli5QNS/Nb3xzKdBkS8R/YpuGvbnIdyijCKRzWkFIYNzWWmbNobKw02\n' +
    'hKcklQgYA/r3YlrVHHBIjovFdjiyz6cDh8H7ba5N3vanw/T159Bd+wALzzscxGIj\n' +
    'bCZXm9txb4kagxe/Q0O3IYdY5tTwcXPaoP3ZM7JYvMF8svdeDdCi0FBVyR+50Jtu\n' +
    'NOWtjdBhegj/0l4fv6HFzPlUCaJAua/4XMKgjy2s7C0arI4Fu2vxmB0f1eWwSozS\n' +
    'BM1M5xZe6wwevh15H77tOmywcW8RWtuC5Zs=\n' +
    '-----END CERTIFICATE-----';
