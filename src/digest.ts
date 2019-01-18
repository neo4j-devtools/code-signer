const crypto = require('crypto')
import {hashElement} from 'folder-hash';

const hashAlg = 'blake2b512';

console.log(crypto.getHashes());

export const digestDirectory = async (path: string, excludeFiles: string[]): Promise<string> => {
    const result = await hashElement(path, {
        algo: hashAlg,
        files: {exclude: [...excludeFiles]},
        folders: {ignoreRootName: true}
    });
    return Promise.resolve(result.hash);
};
