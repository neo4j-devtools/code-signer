export interface HashElementOptions {
    algo?: string; // 'sha1'
    encoding?: string; // 'base64'
    files?: HashElementRules;
    folders?: HashElementRules;
}

export interface HashElementRules {
    exclude?: string[];
    include?: string[];
    matchBasename?: boolean; // true
    matchPath?: boolean; // false
    ignoreRootName?: boolean; // false
}

export function hashElement(path: string, options?: HashElementOptions): Promise<any>;
