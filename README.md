# App Signer

A CLI tool for signing Graph Apps for Neo4j Desktop platform.

## Usage

Sign `my-graph-app` directory:

```bash

code-signer --app ./my-graph-app --private-key ./private-key.pem --passphrase password --cert ./certificate.pem
```

Verify `my-graph-app`:

```bash

code-signer --verify --app ./my-graph-app --root-cert ./rootCA.pem
```

## Development

- Build: `yarn build`
- Test: `yarn test`
- Package: `yarn pack`
