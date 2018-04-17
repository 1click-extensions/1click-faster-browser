"use strict";
exports.__esModule = true;
var configSyntax_1 = require("../checkers/configSyntax");
var last = function (arr) { return arr[arr.length - 1]; };
exports.parseURL = function (url) {
    var splitted = url.split('://');
    var schema = splitted[0], path = splitted[1];
    var result = {
        schema: schema,
        uri: path.replace(configSyntax_1.URL_QUERY_TAG, ''),
        isExtension: false,
        host: '',
        library: ''
    };
    result.isExtension = result.schema === 'chrome-extension';
    var parsedLibrary = result.uri.split('/');
    var host = parsedLibrary[0];
    result.host = host;
    result.library = last(parsedLibrary);
    return result;
};
