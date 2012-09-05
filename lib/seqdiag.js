(function(exports)
{
    var Node = function(id, attributes) {
        this.id = id;
        this.attributes = attributes;
        return this;
    };

    var Edge = function(from, to, attributes) {
        this.from = from;
        this.to   = to;
        this.attributes = attributes;
        return this;
    };

    var Diagram = function() {

        this.nodeIds = [];
        this.nodeIdOf = {};

        return this;
    };

    Diagram.prototype.addNode = function(node) {
        this["nodeIds"].push(node.id);
        this["nodeIdOf"][node.id] = node;
    };

    Diagram.prototype.nodes = function(node) {
        this["nodeIds"].map (function(item) {
            return this.getNodeById(item);
        });
    };

    Diagram.prototype.getNodeById = function(nodeId) {
        return this["nodeIdOf"][nodeId];
    };

    // declare exports followings:
    exports.Node = Node;
    exports.Edge = Edge;
    exports.Diagram = Diagram;

})(typeof exports === 'undefined' ? this['Seqdiag'] = {} : exports );
