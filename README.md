# Code Signer

A CLI tool for signing code used by Neo4j Graph platform.

## Usage

Sign `my-graph-app` directory:

```bash

npx @neo4j/code-signer --app ./my-graph-app-folder \
  --private-key ./private-key.pem \
  --cert ./certificate.pem \
  --passphrase your-private-key-passphrase

```

Verify `my-graph-app`:

```bash

npx @neo4j/code-signer --verify \
  --app ./my-graph-app-folder \
  --root-cert ./rootCA.pem
```

## Development

- Build: `yarn build`
- Test: `yarn test`
- Package: `yarn pack`
