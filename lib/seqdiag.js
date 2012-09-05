(function(exports)
{
    exports.Node = function(id, attributes) {
        this.id = id;
        this.attributes = attributes;
        return this;
    };

    exports.Edge = function(from, to, attributes) {
        this.from = from;
        this.to   = to;
        this.attributes = attributes;
        return this;
    };

    exports.Diagram = function() {

        this.nodeIds = [];
        this.nodeIdOf = {};

        return this;
    };

    exports.Diagram.prototype.addNode = function(node) {
        this["nodeIds"].push(node.id);
        this["nodeIdOf"][node.id] = node;
    };

    exports.Diagram.prototype.nodes = function(node) {
        this["nodeIds"].map (function(item) {
            return this.getNodeById(item);
        });
    };

    exports.Diagram.prototype.getNodeById = function(nodeId) {
        return this["nodeIdOf"][nodeId];
    };

})(typeof exports === 'undefined' ? this['Seqdiag'] = {} : exports );
