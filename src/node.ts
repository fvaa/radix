
export type TypeMethod = 'ROUTER' | 'GET' | 'POST' | 'PUT' | 'DELETE';
export const HttpMethods: Array<TypeMethod> = ['ROUTER', 'GET', 'POST', 'PUT', 'DELETE'];

export const types = {
  STATIC: 0,
  PARAM: 1,
  MATCH_ALL: 2,
  REGEX: 3,
  // It's used for a parameter, that is followed by another parameter in the same part
  MULTI_PARAM: 4
}

export interface TypeHandler {
  handler: Function,
  params: Array<any>,
  paramsLength: number
}

interface TypeHandlerMethods {
  ROUTER?: TypeHandler,
  GET?: TypeHandler,
  POST?: TypeHandler,
  PUT?: TypeHandler,
  DELETE?: TypeHandler
}

interface NodeChildren {
  [label: string]: Node,
}

interface NodeArguments {
  prefix?: string,
  children?: NodeChildren,
  kind?: number,
  handlers?: TypeHandlerMethods,
  regex?: RegExp | null,
}

export const Handlers = buildHandlers();

export default class Node {
  public prefix: string;
  public label: string;
  public children: NodeChildren;
  public numberOfChildren: number;
  public kind: number;
  public regex: RegExp | null;
  public wildcardChild: Node | null;
  public parametricBrother: Node | null;
  public handlers: TypeHandlerMethods;

  constructor(options: NodeArguments = {}) {
    this.prefix = options.prefix || '/';
    this.label = this.prefix[0];
    this.children = options.children || {};
    this.numberOfChildren = Object.keys(this.children).length;
    this.kind = options.kind || this.types.STATIC;
    this.handlers = new Handlers(options.handlers);
    this.regex = options.regex || null;
    this.wildcardChild = null;
    this.parametricBrother = null;
  }

  get types() {
    return types;
  }

  getLabel() {
    return this.prefix[0];
  }

  addChild(node: Node): Node {
    let label: string = '';

    switch (node.kind) {
      case this.types.STATIC: label = node.getLabel(); break;
      case this.types.PARAM:
      case this.types.REGEX:
      case this.types.MULTI_PARAM: label = ':'; break;
      case this.types.MATCH_ALL: this.wildcardChild = node; label = '*'; break;
      default: throw new Error(`Unknown node kind: ${node.kind}`);
    }

    if (this.children[label] !== undefined) {
      throw new Error(`There is already a child with label '${label}'`);
    }

    this.children[label] = node;
    this.numberOfChildren = Object.keys(this.children).length;

    const labels: Array<string> = Object.keys(this.children);
    let parametricBrother: Node | null = this.parametricBrother;
    for (let i = 0; i < labels.length; i++) {
      const child: Node = this.children[labels[i]];
      if (child.label === ':') {
        parametricBrother = child;
        break;
      }
    }

    const iterate = (node: Node | null | undefined) => {
      if (!node) return;
      if (node.kind !== this.types.STATIC) return;
      if (node !== this) {
        node.parametricBrother = parametricBrother || node.parametricBrother;
      }
      const labels: Array<string> = Object.keys(node.children);
      for (let i = 0; i < labels.length; i++) {
        iterate(node.children[labels[i]]);
      }
    }

    iterate(this);

    return this;
  }

  reset(prefix: string): Node {
    this.prefix = prefix;
    this.children = {};
    this.kind = this.types.STATIC;
    this.handlers = new Handlers();
    this.numberOfChildren = 0;
    this.regex = null;
    this.wildcardChild = null;
    return this;
  }

  findByLabel(path: string): Node | undefined {
    return this.children[path[0]];
  }

  findChild(path: string, method: TypeMethod): Node | null {
    let child: Node = this.findByLabel(path);
    if (child !== undefined && (child.numberOfChildren > 0 || child.handlers[method] !== null)) {
      if (path.slice(0, child.prefix.length) === child.prefix) return child;
    }
    child = this.children[':'] || this.children['*']
    if (child !== undefined && (child.numberOfChildren > 0 || child.handlers[method] !== null)) return child;
    return null;
  }

  setHandler(method: TypeMethod, handler: Function, params: Array<any>) {
    if (!handler) return;
    if (this.handlers[method] === undefined) throw new Error(`There is already an handler with method '${method}'`);
    this.handlers[method] = {
      handler: handler,
      params: params,
      paramsLength: params.length
    }
  }

  getHandler(method: TypeMethod) {
    return this.handlers[method];
  }
}

function buildHandlers () {
  return class NodeHelper {

    public ROUTER: TypeHandler;
    public GET: TypeHandler;
    public POST: TypeHandler;
    public PUT: TypeHandler;
    public DELETE: TypeHandler;

    constructor(handlers?: TypeHandlerMethods) {
      handlers = handlers || {};
      for (let i = 0; i < HttpMethods.length; i++) {
        const m: TypeMethod = HttpMethods[i];
        this[m] = handlers[m] || null;
      }
    }
  }
}