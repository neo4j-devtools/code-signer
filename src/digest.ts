import {hashElement} from 'folder-hash';

const hashAlg = 'blake2b512';

const excludeDefault = ['*.svg'];

export const digestDirectory = async (path: string, excludeFiles: string[]): Promise<string> => {
    const result = await hashElement(path, {
        algo: hashAlg,
        files: {exclude: [...excludeFiles, ...excludeDefault]},
        folders: {ignoreRootName: true}
    });
    return Promise.resolve(result.hash);
};
