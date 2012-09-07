(function(exports)
{
    "use strict";

    /* SYNOPSIS
    //
    //      var Seqdiag = require('seqdiag');
    //      var diagram = new Seqdiag.Diagram();
    //      var nodeA = new Seqdiag.Node("A");
    //      diagram.addNode(nodeA);
    //      var nodeB = new Seqdiag.Node("B");
    //      diagram.addNode(nodeB);
    //      var edgeAB = new Seqdiag.Edge(nodeA, nodeB);
    //      diagram.addEdge(edgeAB);
    */

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
        this.edges = [];

        return this;
    };

    Diagram.prototype.addNode = function(node) {
        this["nodeIds"].push(node.id);
        this["nodeIdOf"][node.id] = node;
    };

    Diagram.prototype.nodes = function(node) {
        var self = this;
        return this["nodeIds"].map (function(item) {
            return self.getNodeById(item);
        });
    };

    Diagram.prototype.getNodeById = function(nodeId) {
        return this["nodeIdOf"][nodeId];
    };

    Diagram.prototype.addEdge = function(edge) {
        this["edges"].push(edge);
    };

    /*
     *  build up Diagram object from parsed tokens.
     *
     *  SYNOPSIS:
     *      var tokens = SeqdiagParser.parse(str);
     *      var diagram = DiagramBuilder.build(tokens);
     *      assert(diagram instanceof Seqdiag.Diagram);
     */
    var DiagramBuilder = {
        build: function(tokens) {
            if ( tokens[0] == "graph" ) {
                return this.buildDiagram(tokens[1]);
            }
        },
        buildDiagram: function(tokens) {
            var diagram = new Diagram();
            for (var i = 0; i < tokens.stmt.length; i++ ) {
                switch ( tokens.stmt[i][0] ) {
                    case "node":
                        var node = this.buildNode(diagram, tokens.stmt[i][1]);
                        diagram.addNode(node);
                        break;
                    case "edge":
                        var edge = this.buildEdge(diagram, tokens.stmt[i][1]);
                        diagram.addEdge(edge);
                        break;
                }
            }
            return diagram;
        },
        buildNode: function(diagram, attribute) {
            var node = new Node(attribute["id"]);
            return node;
        },
        buildEdge: function(diagram, attribute) {
            var from = diagram.getNodeById(attribute[3]);
            var to   = diagram.getNodeById(attribute[3]);
            var edge = new Edge(from, to);
            return edge;
        }
    };

    // declare exports followings:
    exports.Node = Node;
    exports.Edge = Edge;
    exports.Diagram = Diagram;
    exports.DiagramBuilder = DiagramBuilder;

})(typeof exports === 'undefined' ? this['Seqdiag'] = {} : exports );
