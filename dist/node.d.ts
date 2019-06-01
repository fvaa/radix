export declare type TypeMethod = 'ROUTER' | 'GET' | 'POST' | 'PUT' | 'DELETE';
export declare const HttpMethods: Array<TypeMethod>;
export declare const types: {
    STATIC: number;
    PARAM: number;
    MATCH_ALL: number;
    REGEX: number;
    MULTI_PARAM: number;
};
export interface TypeHandler {
    handler: Function;
    params: Array<any>;
    paramsLength: number;
}
interface TypeHandlerMethods {
    ROUTER?: TypeHandler;
    GET?: TypeHandler;
    POST?: TypeHandler;
    PUT?: TypeHandler;
    DELETE?: TypeHandler;
}
interface NodeChildren {
    [label: string]: Node;
}
interface NodeArguments {
    prefix?: string;
    children?: NodeChildren;
    kind?: number;
    handlers?: TypeHandlerMethods;
    regex?: RegExp | null;
}
export declare const Handlers: {
    new (handlers?: TypeHandlerMethods): {
        ROUTER: TypeHandler;
        GET: TypeHandler;
        POST: TypeHandler;
        PUT: TypeHandler;
        DELETE: TypeHandler;
    };
};
export default class Node {
    prefix: string;
    label: string;
    children: NodeChildren;
    numberOfChildren: number;
    kind: number;
    regex: RegExp | null;
    wildcardChild: Node | null;
    parametricBrother: Node | null;
    handlers: TypeHandlerMethods;
    constructor(options?: NodeArguments);
    readonly types: {
        STATIC: number;
        PARAM: number;
        MATCH_ALL: number;
        REGEX: number;
        MULTI_PARAM: number;
    };
    getLabel(): string;
    addChild(node: Node): Node;
    reset(prefix: string): Node;
    findByLabel(path: string): Node | undefined;
    findChild(path: string, method: TypeMethod): Node | null;
    setHandler(method: TypeMethod, handler: Function, params: Array<any>): void;
    getHandler(method: TypeMethod): TypeHandler;
}
export {};
