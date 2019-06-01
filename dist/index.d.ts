import { TypeMethod, TypeHandler } from './node';
interface RouterArguments {
    defaultRoute?: Function;
    caseSensitive?: boolean;
    ignoreTrailingSlash?: boolean;
    maxParamLength?: number;
}
export default class Router {
    private defaultRoute;
    private caseSensitive;
    private ignoreTrailingSlash;
    private maxParamLength;
    private tree;
    private routes;
    constructor(opts?: RouterArguments);
    on(method: TypeMethod | Array<TypeMethod>, path: string, opts: object | Function, handler?: Function): void;
    _on(method: TypeMethod | Array<TypeMethod>, path: string, opts: object | Function, handler: Function): void;
    _insert(method: TypeMethod, path: string, kind: number, params: Array<any>, handler: Function, regex?: RegExp): void;
    reset(): void;
    off(method: TypeMethod | Array<TypeMethod>, path: string): any;
    lookup(req: any, res: any, ctx?: any): any;
    _defaultRoute(req: any, res: any, ctx: any): any;
    router(path: string, handler: Function): void;
    get(path: string, handler: Function): void;
    post(path: string, handler: Function): void;
    put(path: string, handler: Function): void;
    delete(path: string, handler: Function): void;
    all(path: string, handler: Function): void;
    find(method: TypeMethod, path: string): {
        handler: Function;
        params: {
            '*': string;
        };
    } | {
        handler: Function;
        params: {
            [label: string]: TypeHandler;
        };
    };
}
export {};
