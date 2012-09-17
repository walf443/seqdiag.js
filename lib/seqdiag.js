
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
//
//  If you load it from browser, Seqdiag namespace is exported.
//
// @license
// (c) 2012 Keiji Yoshimi
// This project is released under MIT license.
// See followings: http://www.opensource.org/licenses/MIT
*/
(function(exports)
{
    "use strict";

    // -----------------------------------------------------------------------------------------
    // @class Node
    //
    var Node = function(id, attributes) {
        this.id = id;
        this.attributes = attributes;
        return this;
    };

    // -----------------------------------------------------------------------------------------
    // @class Edge
    //
    var Edge = function(from, to, attributes) {
        this.from = from;
        this.to   = to;
        this.attributes = attributes;
        return this;
    };

    // -----------------------------------------------------------------------------------------
    // @class Diagram
    //
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

    // -----------------------------------------------------------------------------------------
    /*
     *  @class DiagramBuilder
     *
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
                        var edge = this.buildEdge(diagram, tokens.stmt[i]);
                        diagram.addEdge(edge);
                        break;
                }
            }
            return diagram;
        },
        buildNode: function(diagram, attribute) {
            var attrs = attribute["attributes"];
            if ( attrs ) {
                attrs = attrs[1];
            } else {
                attrs = null;
            }
            var node = new Node(attribute["id"], attrs);
            return node;
        },
        buildEdge: function(diagram, attribute) {
            var from = diagram.getNodeById(attribute[2]);
            var type = attribute[1];
            if ( ! from ) {
                from = new Node(attribute[2]);
                diagram.addNode(from);
            }
            var to   = diagram.getNodeById(attribute[3]);
            if ( ! to ) {
                to = new Node(attribute[3]);
                diagram.addNode(to);
            }
            var attrs = attribute[4];
            if ( attrs ) {
                attrs = attrs[1];
            } else {
                attrs = {};
            }

            var edge;
            if ( type.indexOf("return") > -1 ) {
                switch (type) {
                    case "return":
                        type = "normal";
                        break;
                    case "return_async_dotted":
                        type = "async_dotted";
                        break;
                    case "return_async":
                        type = "async";
                        break;
                    case "return_dotted":
                        type = "dotted";
                        break;
                }
                attrs["type"] = type;
                edge = new Edge(to, from, attrs);
            } else {
                attrs["type"] = type;
                edge = new Edge(from, to, attrs);
            }
            return edge;
        }
    };

    // -----------------------------------------------------------------------------------------
    // @class Drawer.SVG
    //
    var Drawer = {
        SVG: function(diagram, svg, document) {
            this.diagram = diagram;
            this.document = document;
            this.svg = svg;
            return this;
        }
    };

    Drawer.SVG.prototype.SVG_XML_NAMESPACE = "http://www.w3.org/2000/svg";

    Drawer.SVG.prototype.createSVGElement = function(tagName) {
        return this.document.createElementNS(this.SVG_XML_NAMESPACE, tagName);
    };

    Drawer.SVG.prototype.getNodeRect = function(nodeId) {
        return this.svg.getElementById('node-rect-' + nodeId);
    };

    Drawer.SVG.prototype.draw = function() {
        this.drawNodes();
        this.drawEdges();
        this.drawLifeLines();
    };

    Drawer.SVG.prototype.drawNodes = function() {
        var nodes = this.diagram.nodes();
        var metrics = this.calcNodeMetrics();
        var x = metrics["widthMargin"];
        var y = 10;
        for (var i = 0; i < nodes.length; i++ ) {
            this.drawNode(nodes[i], {
                "x": x,
                "y": y,
                "width": metrics["width"],
                "height": metrics["height"],
            });
            x += metrics["width"] + metrics["widthMargin"];
        }
    };

    Drawer.SVG.prototype.defaultDiagramWidth = 1024;
    Drawer.SVG.prototype.defaultDiagramHeight = 600;
    Drawer.SVG.prototype.defaultWidthMargin = 50;
    Drawer.SVG.prototype.defaultHeightMargin = 50;

    Drawer.SVG.prototype.calcNodeMetrics = function() {
        var svgWidth = parseInt(this.svg.getAttribute("width")) || this.defaultDiagramWidth;
        var svgHeight = parseInt(this.svg.getAttribute("height")) || this.defaultDiagramHeight;
        var widthMargin = this.defaultWidthMargin;
        var heightMargin = this.defaultHeightMargin;
        // svgWidth = ( nodeWidth * length ) + ( widthMargin * ( length + 1 ) )
        var nodeLength = this.diagram.nodes().length;
        var nodeWidth = ( ( svgWidth - widthMargin * ( nodeLength + 1 ) ) / nodeLength );
        var nodeHeight = ( svgHeight / ( this.diagram.edges.length + 1 ) ) - heightMargin;
        return {
            "width": nodeWidth,
            "widthMargin": widthMargin,
            "height": nodeHeight,
            "heightMargin": heightMargin
        }
    };

    Drawer.SVG.prototype.defaultBackgroundColor = "#ffffff";
    Drawer.SVG.prototype.defaultStrokeColor = "#000000";

    Drawer.SVG.prototype.getNodeFillColor = function(node) {
        return Drawer.SVG.prototype.defaultBackgroundColor;
    };

    Drawer.SVG.prototype.getNodeStrokeColor = function(node) {
        return Drawer.SVG.prototype.defaultStrokeColor;
    };

    Drawer.SVG.prototype.charWidth = 8;
    Drawer.SVG.prototype.charHeight = 8;

    Drawer.SVG.prototype.drawNode = function(node, params) {
        var rect = this.createSVGElement('rect');
        rect.setAttribute("id", "node-rect-" + node.id);
        rect.setAttribute("class", "node-rect");
        rect.setAttribute("width", params["width"]);
        rect.setAttribute("height", params["height"]);
        rect.setAttribute("x", params["x"]);
        rect.setAttribute("y", params["y"]);
        rect.setAttribute("fill", this.getNodeFillColor(node));
        rect.setAttribute("stroke", this.getNodeStrokeColor(node));

        this.svg.appendChild(rect);

        var textbox = this.createSVGElement('text');
        if ( node.attributes && node.attributes["label"] !== undefined ) {
            textbox.textContent = node.attributes["label"];
        } else {
            textbox.textContent = node.id;
        }
        textbox.setAttribute("id", "node-textbox-" + node.id);
        textbox.setAttribute("class", "node-text");
        textbox.setAttribute("x", params["x"] + params["width"] / 2.0 - textbox.textContent.length * this.charWidth / 2.0);
        textbox.setAttribute("y", params["y"] + params["height"] / 2.0 + ( this.charHeight / 2.0 ));

        this.svg.appendChild(textbox);
    };

    Drawer.SVG.prototype.drawEdges = function() {
        var y = 100;
        var edges = this.diagram.edges;
        for (var i = 0; i < edges.length; i++ ) {
            this.drawEdge(edges[i], {
                "y": y,
            });
            y += 50;
        }
    };

    Drawer.SVG.prototype.getEdgeStrokeColor = function(edge) {
        return this.defaultStrokeColor;
    };

    Drawer.SVG.prototype.drawEdge = function(edge, params) {
        var path = this.createSVGElement("path");
        var from = this.getNodeRect(edge.from.id);
        var to   = this.getNodeRect(edge.to.id);

        var y = params["y"];
        var fromX   = parseInt(from.getAttribute("x")) + parseInt(from.getAttribute("width")) / 2.0;
        var toX     =   parseInt(to.getAttribute("x")) + parseInt(to.getAttribute("width")) / 2.0;
        path.setAttribute("d", "M " + fromX + " " + y + " L " + toX + " " + y);
        path.setAttribute("stroke", this.getEdgeStrokeColor(edge));
        switch ( edge.attributes["type"] ) {
            case "dotted":
            case "async_dotted":
                path.setAttribute("stroke-dasharray", 5);
                break;
        }

        this.svg.appendChild(path);

        var isAsync = false;
        switch ( edge.attributes["type"] ) {
            case "async":
            case "async_dotted":
                isAsync = true;
                break;
            default:
                isAsync = false;
                break;
        }
        var arrowWidth = 5;
        var arrowHeight = 10;
        var arrowFromX = null;
        if ( fromX < toX ) {
            arrowFromX = toX - arrowWidth;
        } else {
            arrowFromX = toX + arrowWidth;
        }
        if ( isAsync ) {
            var arrowUpper = this.createSVGElement("path");
            arrowUpper.setAttribute("stroke", this.getEdgeStrokeColor(edge));
            arrowUpper.setAttribute("d", "M " + arrowFromX + " " + ( y - arrowHeight / 2 ) + " L " + toX + " " + y);
            this.svg.appendChild(arrowUpper);

            var arrowSupper = this.createSVGElement("path");
            arrowSupper.setAttribute("stroke", this.getEdgeStrokeColor(edge));
            arrowSupper.setAttribute("d", "M " + arrowFromX + " " + ( y + arrowHeight / 2 ) + " L " + toX + " " + y);
            this.svg.appendChild(arrowSupper);

        } else {
            var arrowHead = this.createSVGElement("polygon");
            arrowHead.setAttribute("stroke", this.getEdgeStrokeColor(edge));
            arrowHead.setAttribute("points", [
                [arrowFromX, y - arrowHeight/2],
                [arrowFromX, y + arrowHeight/2],
                [toX, y]
            ].map(function(i) { return i.join(",") }).join(" "));
            this.svg.appendChild(arrowHead);
        }

        if ( edge.attributes && edge.attributes["label"] !== undefined ) {
            var textbox = this.createSVGElement('text');
            textbox.textContent = edge.attributes["label"];
            textbox.setAttribute("class", "edge-text");
            if ( fromX < toX ) {
                textbox.setAttribute("x", fromX + 5);
            } else {
                textbox.setAttribute("x", toX + 20);
            }
            textbox.setAttribute("y", y - 5);
            this.svg.appendChild(textbox);
        }
    };

    Drawer.SVG.prototype.drawLifeLines = function() {
        var nodes = this.diagram.nodes();
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            this.drawLifeLine(nodes[i]);
        }
    };

    Drawer.SVG.prototype.drawLifeLine = function(node) {
        var rect = this.getNodeRect(node.id);
        var rectCenterX = parseInt(rect.getAttribute("x")) + parseInt(rect.getAttribute("width")) / 2.0;
        var rectBottomY = parseInt(rect.getAttribute("y")) + parseInt(rect.getAttribute("height"));

        var line = this.createSVGElement('path');
        line.setAttribute("d", "M " + rectCenterX + " " + rectBottomY + "L " + rectCenterX + " " + this.defaultDiagramHeight);
        line.setAttribute("stroke", "#000000");
        line.setAttribute("stroke-dasharray", 5);
        this.svg.appendChild(line);
    };

    // -----------------------------------------------------------------------------------------
    // declare exports followings:
    exports.Node = Node;
    exports.Edge = Edge;
    exports.Diagram = Diagram;
    exports.DiagramBuilder = DiagramBuilder;
    exports.Drawer = Drawer;

})(typeof exports === 'undefined' ? this['Seqdiag'] = {} : exports );
