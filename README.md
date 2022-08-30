# Code Signer

A CLI tool for signing code used by Neo4j Graph platform.
Creates a `signature.pem` file in the signed folder.
If verifies signatures locally and against Neo4j:s CRL server
for revoked certificates when online.

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

You can also pass the `--skip-revocation-check` flag to skip the certificate revocation check against Neo4j:s CRL server.

## Common usage pattern

These steps are usually what's needed to sign a node application.

```
# build your app
npm run build

# pack you app
npm pack

# unpack your app
tar xvzf *.tgz

# sign unpacked app folder
npx @neo4j/code-signer --app ./package \
  --private-key ../private-key.pem \
  --cert ../certificate.pem \
  --passphrase your-private-key-passphrase

# pack app again, from inside package/ folder. Important!
cd package
npm pack

# publish, still inside package/ folder
npm publish *.tgz


```

## Development

- Build: `npm build`
- Test: `npm test`
- Package: `npm pack`
