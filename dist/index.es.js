/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var UTF8_ACCEPT = 12;
var UTF8_REJECT = 0;
var UTF8_DATA = [
    // The first part of the table maps bytes to character to a transition.
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7,
    10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    // The second part of the table maps a state to a new state when adding a
    // transition.
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    12, 0, 0, 0, 0, 24, 36, 48, 60, 72, 84, 96,
    0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 24, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // The third part maps the current transition to a mask that needs to apply
    // to the byte.
    0x7F, 0x3F, 0x3F, 0x3F, 0x00, 0x1F, 0x0F, 0x0F, 0x0F, 0x07, 0x07, 0x07
];
function decodeURIComponent(uri) {
    var percentPosition = uri.indexOf('%');
    if (percentPosition === -1)
        return uri;
    var length = uri.length;
    var decoded = '';
    var last = 0;
    var codepoint = 0;
    var startOfOctets = percentPosition;
    var state = UTF8_ACCEPT;
    while (percentPosition > -1 && percentPosition < length) {
        var high = hexCodeToInt(uri[percentPosition + 1], 4);
        var low = hexCodeToInt(uri[percentPosition + 2], 0);
        var byte = high | low;
        var type = UTF8_DATA[byte];
        state = UTF8_DATA[256 + state + type];
        codepoint = (codepoint << 6) | (byte & UTF8_DATA[364 + type]);
        if (state === UTF8_ACCEPT) {
            decoded += uri.slice(last, startOfOctets);
            decoded += (codepoint <= 0xFFFF)
                ? String.fromCharCode(codepoint)
                : String.fromCharCode((0xD7C0 + (codepoint >> 10)), (0xDC00 + (codepoint & 0x3FF)));
            codepoint = 0;
            last = percentPosition + 3;
            percentPosition = startOfOctets = uri.indexOf('%', last);
        }
        else if (state === UTF8_REJECT) {
            return null;
        }
        else {
            percentPosition += 3;
            if (percentPosition < length && uri.charCodeAt(percentPosition) === 37)
                continue;
            return null;
        }
    }
    return decoded + uri.slice(last);
}
var HEX = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'a': 10,
    'A': 10,
    'b': 11,
    'B': 11,
    'c': 12,
    'C': 12,
    'd': 13,
    'D': 13,
    'e': 14,
    'E': 14,
    'f': 15,
    'F': 15
};
function hexCodeToInt(c, shift) {
    var i = HEX[c];
    return i === undefined ? 255 : i << shift;
}

var HttpMethods = ['ROUTER', 'GET', 'POST', 'PUT', 'DELETE'];
var types = {
    STATIC: 0,
    PARAM: 1,
    MATCH_ALL: 2,
    REGEX: 3,
    // It's used for a parameter, that is followed by another parameter in the same part
    MULTI_PARAM: 4
};
var Handlers = buildHandlers();
var Node = /** @class */ (function () {
    function Node(options) {
        if (options === void 0) { options = {}; }
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
    Object.defineProperty(Node.prototype, "types", {
        get: function () {
            return types;
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype.getLabel = function () {
        return this.prefix[0];
    };
    Node.prototype.addChild = function (node) {
        var _this = this;
        var label = '';
        switch (node.kind) {
            case this.types.STATIC:
                label = node.getLabel();
                break;
            case this.types.PARAM:
            case this.types.REGEX:
            case this.types.MULTI_PARAM:
                label = ':';
                break;
            case this.types.MATCH_ALL:
                this.wildcardChild = node;
                label = '*';
                break;
            default: throw new Error("Unknown node kind: " + node.kind);
        }
        if (this.children[label] !== undefined) {
            throw new Error("There is already a child with label '" + label + "'");
        }
        this.children[label] = node;
        this.numberOfChildren = Object.keys(this.children).length;
        var labels = Object.keys(this.children);
        var parametricBrother = this.parametricBrother;
        for (var i = 0; i < labels.length; i++) {
            var child = this.children[labels[i]];
            if (child.label === ':') {
                parametricBrother = child;
                break;
            }
        }
        var iterate = function (node) {
            if (!node)
                return;
            if (node.kind !== _this.types.STATIC)
                return;
            if (node !== _this) {
                node.parametricBrother = parametricBrother || node.parametricBrother;
            }
            var labels = Object.keys(node.children);
            for (var i = 0; i < labels.length; i++) {
                iterate(node.children[labels[i]]);
            }
        };
        iterate(this);
        return this;
    };
    Node.prototype.reset = function (prefix) {
        this.prefix = prefix;
        this.children = {};
        this.kind = this.types.STATIC;
        this.handlers = new Handlers();
        this.numberOfChildren = 0;
        this.regex = null;
        this.wildcardChild = null;
        return this;
    };
    Node.prototype.findByLabel = function (path) {
        return this.children[path[0]];
    };
    Node.prototype.findChild = function (path, method) {
        var child = this.findByLabel(path);
        if (child !== undefined && (child.numberOfChildren > 0 || child.handlers[method] !== null)) {
            if (path.slice(0, child.prefix.length) === child.prefix)
                return child;
        }
        child = this.children[':'] || this.children['*'];
        if (child !== undefined && (child.numberOfChildren > 0 || child.handlers[method] !== null))
            return child;
        return null;
    };
    Node.prototype.setHandler = function (method, handler, params) {
        if (!handler)
            return;
        if (this.handlers[method] === undefined)
            throw new Error("There is already an handler with method '" + method + "'");
        this.handlers[method] = {
            handler: handler,
            params: params,
            paramsLength: params.length
        };
    };
    Node.prototype.getHandler = function (method) {
        return this.handlers[method];
    };
    return Node;
}());
function buildHandlers() {
    return /** @class */ (function () {
        function NodeHelper(handlers) {
            handlers = handlers || {};
            for (var i = 0; i < HttpMethods.length; i++) {
                var m = HttpMethods[i];
                this[m] = handlers[m] || null;
            }
        }
        return NodeHelper;
    }());
}

var NODE_TYPES = types;
var httpMethods = HttpMethods;
var FULL_PATH_REGEXP = /^https?:\/\/.*\//;
var CustomStatusError = /** @class */ (function (_super) {
    __extends(CustomStatusError, _super);
    function CustomStatusError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CustomStatusError;
}(Error));
var Router = /** @class */ (function () {
    function Router(opts) {
        if (opts === void 0) { opts = {}; }
        this.defaultRoute = opts.defaultRoute || null;
        this.caseSensitive = opts.caseSensitive === undefined ? true : opts.caseSensitive;
        this.ignoreTrailingSlash = opts.ignoreTrailingSlash || false;
        this.maxParamLength = opts.maxParamLength || 100;
        this.tree = new Node();
        this.routes = [];
    }
    Router.prototype.on = function (method, path, opts, handler) {
        if (typeof opts === 'function') {
            handler = opts;
            opts = {};
        }
        if (typeof path !== 'string')
            throw new Error('Path should be a string');
        if (path.length === 0)
            throw new Error('The path could not be empty');
        if (path[0] !== '/' && path[0] !== '*')
            throw new Error('The first character of a path should be `/` or `*`');
        if (typeof handler !== 'function')
            throw new Error('Handler should be a function');
        this._on(method, path, opts, handler);
        if (this.ignoreTrailingSlash && path !== '/' && !path.endsWith('*')) {
            if (path.endsWith('/')) {
                this._on(method, path.slice(0, -1), opts, handler);
            }
            else {
                this._on(method, path + '/', opts, handler);
            }
        }
    };
    Router.prototype._on = function (method, path, opts, handler) {
        if (Array.isArray(method)) {
            for (var k = 0; k < method.length; k++) {
                this._on(method[k], path, opts, handler);
            }
            return;
        }
        if (typeof method !== 'string')
            throw new Error('Method should be a string');
        if (httpMethods.indexOf(method) === -1)
            throw new Error("Method '" + method + "' is not an http method.");
        var params = [];
        var j = 0;
        this.routes.push({
            method: method,
            path: path,
            opts: opts,
            handler: handler
        });
        for (var i = 0, len = path.length; i < len; i++) {
            // search for parametric or wildcard routes
            // parametric route
            if (path.charCodeAt(i) === 58) {
                var nodeType = NODE_TYPES.PARAM;
                j = i + 1;
                var staticPart = path.slice(0, i);
                if (this.caseSensitive === false) {
                    staticPart = staticPart.toLowerCase();
                }
                // add the static part of the route to the tree
                this._insert(method, staticPart, 0, null, null, null);
                // isolate the parameter name
                var isRegex = false;
                while (i < len && path.charCodeAt(i) !== 47) {
                    isRegex = isRegex || path[i] === '(';
                    if (isRegex) {
                        i = getClosingParenthensePosition(path, i) + 1;
                        break;
                    }
                    else if (path.charCodeAt(i) !== 45) {
                        i++;
                    }
                    else {
                        break;
                    }
                }
                if (isRegex && (i === len || path.charCodeAt(i) === 47)) {
                    nodeType = NODE_TYPES.REGEX;
                }
                else if (i < len && path.charCodeAt(i) !== 47) {
                    nodeType = NODE_TYPES.MULTI_PARAM;
                }
                var parameter = path.slice(j, i);
                var regex = isRegex ? new RegExp(parameter.slice(parameter.indexOf('('), i)) : null;
                params.push(parameter.slice(0, isRegex ? parameter.indexOf('(') : i));
                path = path.slice(0, j) + path.slice(i);
                i = j;
                len = path.length;
                // if the path is ended
                if (i === len) {
                    var completedPath = path.slice(0, i);
                    if (this.caseSensitive === false) {
                        completedPath = completedPath.toLowerCase();
                    }
                    return this._insert(method, completedPath, nodeType, params, handler, regex);
                }
                // add the parameter and continue with the search
                this._insert(method, path.slice(0, i), nodeType, params, null, regex);
                i--;
            }
            else if (path.charCodeAt(i) === 42) {
                this._insert(method, path.slice(0, i), 0, null, null, null);
                // add the wildcard parameter
                params.push('*');
                return this._insert(method, path.slice(0, len), 2, params, handler, null);
            }
        }
        if (this.caseSensitive === false) {
            path = path.toLowerCase();
        }
        // static route
        this._insert(method, path, 0, params, handler, null);
    };
    Router.prototype._insert = function (method, path, kind, params, handler, regex) {
        if (params === void 0) { params = []; }
        var route = path;
        var currentNode = this.tree;
        var prefix = '';
        var pathLen = 0;
        var prefixLen = 0;
        var len = 0;
        var max = 0;
        var node = null;
        while (true) {
            prefix = currentNode.prefix;
            prefixLen = prefix.length;
            pathLen = path.length;
            len = 0;
            // search for the longest common prefix
            max = pathLen < prefixLen ? pathLen : prefixLen;
            while (len < max && path[len] === prefix[len])
                len++;
            // the longest common prefix is smaller than the current prefix
            // let's split the node and add a new child
            if (len < prefixLen) {
                node = new Node({ prefix: prefix.slice(len),
                    children: currentNode.children,
                    kind: currentNode.kind,
                    handlers: new Handlers(currentNode.handlers),
                    regex: currentNode.regex });
                if (currentNode.wildcardChild !== null) {
                    node.wildcardChild = currentNode.wildcardChild;
                }
                // reset the parent
                currentNode
                    .reset(prefix.slice(0, len))
                    .addChild(node);
                // if the longest common prefix has the same length of the current path
                // the handler should be added to the current node, to a child otherwise
                if (len === pathLen) {
                    if (currentNode.getHandler(method)) {
                        throw new Error("Method '" + method + "' already declared for route '" + route + "'");
                    }
                    currentNode.setHandler(method, handler, params);
                    currentNode.kind = kind;
                }
                else {
                    node = new Node({
                        prefix: path.slice(len),
                        kind: kind,
                        handlers: null,
                        regex: regex
                    });
                    node.setHandler(method, handler, params);
                    currentNode.addChild(node);
                }
                // the longest common prefix is smaller than the path length,
                // but is higher than the prefix
            }
            else if (len < pathLen) {
                // remove the prefix
                path = path.slice(len);
                // check if there is a child with the label extracted from the new path
                node = currentNode.findByLabel(path);
                // there is a child within the given label, we must go deepen in the tree
                if (node) {
                    currentNode = node;
                    continue;
                }
                // there are not children within the given label, let's create a new one!
                node = new Node({ prefix: path, kind: kind, handlers: null, regex: regex });
                node.setHandler(method, handler, params);
                currentNode.addChild(node);
                // the node already exist
            }
            else if (handler) {
                if (currentNode.getHandler(method)) {
                    throw new Error("Method '" + method + "' already declared for route '" + route + "'");
                }
                currentNode.setHandler(method, handler, params);
            }
            return;
        }
    };
    Router.prototype.reset = function () {
        this.tree = new Node();
        this.routes = [];
    };
    Router.prototype.off = function (method, path) {
        var self = this;
        if (Array.isArray(method)) {
            return method.map(function (method) { return self.off(method, path); });
        }
        // method validation
        if (typeof method !== 'string')
            throw new Error('Method should be a string');
        if (httpMethods.indexOf(method) === -1)
            throw new Error("Method '" + method + "' is not an http method.");
        // path validation
        if (typeof path !== 'string')
            throw new Error('Path should be a string');
        if (path.length === 0)
            throw new Error('The path could not be empty');
        if (path[0] !== '/' && path[0] !== '*')
            throw new Error('The first character of a path should be `/` or `*`');
        // Rebuild tree without the specific route
        var ignoreTrailingSlash = this.ignoreTrailingSlash;
        var newRoutes = self.routes.filter(function (route) {
            if (!ignoreTrailingSlash) {
                return !(method === route.method && path === route.path);
            }
            if (path.endsWith('/')) {
                var routeMatches_1 = path === route.path || path.slice(0, -1) === route.path;
                return !(method === route.method && routeMatches_1);
            }
            var routeMatches = path === route.path || (path + '/') === route.path;
            return !(method === route.method && routeMatches);
        });
        if (ignoreTrailingSlash) {
            newRoutes = newRoutes.filter(function (route, i, ar) {
                if (route.path.endsWith('/') && i < ar.length - 1) {
                    return route.path.slice(0, -1) !== ar[i + 1].path;
                }
                else if (route.path.endsWith('/') === false && i < ar.length - 1) {
                    return (route.path + '/') !== ar[i + 1].path;
                }
                return true;
            });
        }
        self.reset();
        newRoutes.forEach(function (route) { return self.on(route.method, route.path, route.opts, route.handler); });
    };
    Router.prototype.lookup = function (req, res, ctx) {
        var handle = this.find(req.method.toUpperCase(), sanitizeUrl(req.pathname));
        if (handle === null)
            return this._defaultRoute(req, res, ctx);
        return ctx === undefined
            ? handle.handler(req, res, handle.params)
            : handle.handler.call(ctx, req, res, handle.params);
    };
    Router.prototype._defaultRoute = function (req, res, ctx) {
        if (this.defaultRoute !== null) {
            return ctx === undefined
                ? this.defaultRoute(req, res)
                : this.defaultRoute.call(ctx, req, res);
        }
        else {
            var error = new CustomStatusError('Not found');
            error.status = 404;
            throw error;
        }
    };
    Router.prototype.router = function (path, handler) {
        return this.on('ROUTER', path, handler);
    };
    Router.prototype.get = function (path, handler) {
        return this.on('GET', path, handler);
    };
    Router.prototype.post = function (path, handler) {
        return this.on('POST', path, handler);
    };
    Router.prototype.put = function (path, handler) {
        return this.on('PUT', path, handler);
    };
    Router.prototype.delete = function (path, handler) {
        return this.on('DELETE', path, handler);
    };
    Router.prototype.all = function (path, handler) {
        return this.on(httpMethods, path, handler);
    };
    Router.prototype.find = function (method, path) {
        if (path.charCodeAt(0) !== 47) { // 47 is '/'
            path = path.replace(FULL_PATH_REGEXP, '/');
        }
        var originalPath = path;
        var originalPathLength = path.length;
        if (this.caseSensitive === false) {
            path = path.toLowerCase();
        }
        var maxParamLength = this.maxParamLength;
        var currentNode = this.tree;
        var wildcardNode = null;
        var pathLenWildcard = 0;
        var decoded = null;
        var pindex = 0;
        var params = [];
        var i = 0;
        var idxInOriginalPath = 0;
        while (true) {
            var pathLen = path.length;
            var prefix = currentNode.prefix;
            var prefixLen = prefix.length;
            var len = 0;
            var previousPath = path;
            // found the route
            if (pathLen === 0 || path === prefix) {
                var handle = currentNode.handlers[method];
                if (handle !== null && handle !== undefined) {
                    var paramsObj = {};
                    if (handle.paramsLength > 0) {
                        var paramNames = handle.params;
                        for (i = 0; i < handle.paramsLength; i++) {
                            paramsObj[paramNames[i]] = params[i];
                        }
                    }
                    return {
                        handler: handle.handler,
                        params: paramsObj,
                    };
                }
            }
            // search for the longest common prefix
            i = pathLen < prefixLen ? pathLen : prefixLen;
            while (len < i && path.charCodeAt(len) === prefix.charCodeAt(len))
                len++;
            if (len === prefixLen) {
                path = path.slice(len);
                pathLen = path.length;
                idxInOriginalPath += len;
            }
            var node = currentNode.findChild(path, method);
            if (node === null) {
                node = currentNode.parametricBrother;
                if (node === null) {
                    return getWildcardNode(wildcardNode, method, originalPath, pathLenWildcard);
                }
                if (originalPath.indexOf('/' + previousPath) === -1) {
                    // we need to know the outstanding path so far from the originalPath since the last encountered "/" and assign it to previousPath.
                    // e.g originalPath: /aa/bbb/cc, path: bb/cc
                    // outstanding path: /bbb/cc
                    var pathDiff = originalPath.slice(0, originalPathLength - pathLen);
                    previousPath = pathDiff.slice(pathDiff.lastIndexOf('/') + 1, pathDiff.length) + path;
                }
                idxInOriginalPath = idxInOriginalPath - (previousPath.length - path.length);
                path = previousPath;
                pathLen = previousPath.length;
                len = prefixLen;
            }
            var kind = node.kind;
            // static route
            if (kind === NODE_TYPES.STATIC) {
                // if exist, save the wildcard child
                if (currentNode.wildcardChild !== null) {
                    wildcardNode = currentNode.wildcardChild;
                    pathLenWildcard = pathLen;
                }
                currentNode = node;
                continue;
            }
            if (len !== prefixLen) {
                return getWildcardNode(wildcardNode, method, originalPath, pathLenWildcard);
            }
            // if exist, save the wildcard child
            if (currentNode.wildcardChild !== null) {
                wildcardNode = currentNode.wildcardChild;
                pathLenWildcard = pathLen;
            }
            // parametric route
            if (kind === NODE_TYPES.PARAM) {
                currentNode = node;
                i = path.indexOf('/');
                if (i === -1)
                    i = pathLen;
                if (i > maxParamLength)
                    return null;
                decoded = decodeURIComponent(originalPath.slice(idxInOriginalPath, idxInOriginalPath + i));
                if (decoded === null)
                    return null;
                params[pindex++] = decoded;
                path = path.slice(i);
                idxInOriginalPath += i;
                continue;
            }
            // wildcard route
            if (kind === NODE_TYPES.MATCH_ALL) {
                decoded = decodeURIComponent(originalPath.slice(idxInOriginalPath));
                if (decoded === null)
                    return null;
                params[pindex] = decoded;
                currentNode = node;
                path = '';
                continue;
            }
            // parametric(regex) route
            if (kind === NODE_TYPES.REGEX) {
                currentNode = node;
                i = path.indexOf('/');
                if (i === -1)
                    i = pathLen;
                if (i > maxParamLength)
                    return null;
                decoded = decodeURIComponent(originalPath.slice(idxInOriginalPath, idxInOriginalPath + i));
                if (decoded === null)
                    return null;
                if (!node.regex.test(decoded))
                    return null;
                params[pindex++] = decoded;
                path = path.slice(i);
                idxInOriginalPath += i;
                continue;
            }
            // multiparametric route
            if (kind === NODE_TYPES.MULTI_PARAM) {
                currentNode = node;
                i = 0;
                if (node.regex !== null) {
                    var matchedParameter = path.match(node.regex);
                    if (matchedParameter === null)
                        return null;
                    i = matchedParameter[1].length;
                }
                else {
                    while (i < pathLen && path.charCodeAt(i) !== 47 && path.charCodeAt(i) !== 45)
                        i++;
                    if (i > maxParamLength)
                        return null;
                }
                decoded = decodeURIComponent(originalPath.slice(idxInOriginalPath, idxInOriginalPath + i));
                if (decoded === null)
                    return null;
                params[pindex++] = decoded;
                path = path.slice(i);
                idxInOriginalPath += i;
                continue;
            }
            wildcardNode = null;
        }
    };
    return Router;
}());
function sanitizeUrl(url) {
    for (var i = 0, len = url.length; i < len; i++) {
        var charCode = url.charCodeAt(i);
        // Some systems do not follow RFC and separate the path and query
        // string with a `;` character (code 59), e.g. `/foo;jsessionid=123456`.
        // Thus, we need to split on `;` as well as `?` and `#`.
        if (charCode === 63 || charCode === 59 || charCode === 35) {
            return url.slice(0, i);
        }
    }
    return url;
}
function getWildcardNode(node, method, path, len) {
    if (node === null)
        return null;
    var decoded = decodeURIComponent(path.slice(-len));
    if (decoded === null)
        return null;
    var handle = node.handlers[method];
    if (handle !== null && handle !== undefined) {
        return {
            handler: handle.handler,
            params: { '*': decoded },
        };
    }
    return null;
}
function getClosingParenthensePosition(path, idx) {
    // `path.indexOf()` will always return the first position of the closing parenthese,
    // but it's inefficient for grouped or wrong regexp expressions.
    // see issues #62 and #63 for more info
    var parentheses = 1;
    while (idx < path.length) {
        idx++;
        // ignore skipped chars
        if (path[idx] === '\\') {
            idx++;
            continue;
        }
        if (path[idx] === ')') {
            parentheses--;
        }
        else if (path[idx] === '(') {
            parentheses++;
        }
        if (!parentheses)
            return idx;
    }
    throw new TypeError('Invalid regexp expression in "' + path + '"');
}

export default Router;
