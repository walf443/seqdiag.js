
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
    // @class Separator
    //
    var Separator = function(type, comment) {
        this.type = type;
        this.comment = comment;
        return this;
    };

    // -----------------------------------------------------------------------------------------
    // @class Diagram
    //
    var Diagram = function() {

        this.nodeIds = [];
        this.nodeIdOf = {};
        this.edges = [];
        this.separators = [];
        this.sequences = [];

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
        this["sequences"].push(edge);
    };

    Diagram.prototype.addSeparator = function(separator) {
        this["separators"].push(separator);
        this["sequences"].push(separator);
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
                        if ( tokens.stmt[i][1].indexOf("bidirectional") > -1 ) {
                            var edges = this.buildBidirectionalEdge(diagram, tokens.stmt[i]);
                            diagram.addEdge(edges[0]);
                            diagram.addEdge(edges[1]);
                        } else {
                            var edge = this.buildEdge(diagram, tokens.stmt[i]);
                            diagram.addEdge(edge);
                        }
                        break;
                    case "separator":
                        var separator = this.buildSeparator(diagram, tokens.stmt[i]);
                        diagram.addSeparator(separator);
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
        buildBidirectionalEdge: function(diagram, attribute){
            var type = attribute[1];
            switch ( type ) {
                case "bidirectional":
                    type = "normal";
                    break;
                case "bidirectional_dotted":
                    type = "dotted";
                    break;
                case "bidirectional_async":
                    type = "async";
                    break;
                case "bidirectional_async_dotted":
                    type = "async_dotted";
                    break;
                default:
                    type = "normal";
                    break;
            }
            var toAttr = {};
            if ( attribute[4] ) {
                toAttr["label"] = attribute[4][1]["return"];
            }
            var fromEdge = this.buildEdge(diagram, [attribute[0], type, attribute[2], attribute[3], attribute[4]]);
            var toEdge = this.buildEdge(diagram, [attribute[0],   type, attribute[3], attribute[2], ["attributes", toAttr]]);
            return [fromEdge, toEdge];
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

            if ( from.id == to.id ) {
                type = "self_reference";
            }
            attrs["type"] = type;
            if ( type.indexOf("return") > -1 ) {
                attrs["isReturn"] = true;
            } else {
                attrs["isReturn"] = false;
            }
            if ( type.indexOf("async") > -1 ) {
                attrs["isAsync"] = true;
            } else {
                attrs["isAsync"] = false;
            }
            if ( type.indexOf("dotted") > -1 ) {
                attrs["isDotted"] = true;
            } else {
                attrs["isDotted"] = false;
            }

            var edge;
            if ( attrs["isReturn"] ) {
                edge = new Edge(to, from, attrs);
            } else {
                edge = new Edge(from, to, attrs);
            }
            return edge;
        },
        buildSeparator: function(diagram, attribute) {
            var sep = new Separator(attribute[1], attribute[2]);
            return sep;
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
        this.drawSequences();
        this.drawLifeLines();
    };

    Drawer.SVG.prototype.marginTop = 10;

    Drawer.SVG.prototype.drawNodes = function() {
        var nodes = this.diagram.nodes();
        var metrics = this.calcNodeMetrics();
        var x = metrics["widthMargin"];
        var y = this.marginTop;
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
    Drawer.SVG.prototype.defaultHeightMargin = 30;
    Drawer.SVG.prototype.nodeHeight = 30;

    Drawer.SVG.prototype.calcNodeMetrics = function() {
        var svgWidth = parseInt(this.svg.getAttribute("width")) || this.defaultDiagramWidth;
        var svgHeight = parseInt(this.svg.getAttribute("height")) || this.defaultDiagramHeight;
        var widthMargin = this.defaultWidthMargin;
        var heightMargin = this.defaultHeightMargin;
        // svgWidth = ( nodeWidth * length ) + ( widthMargin * ( length + 1 ) )
        var nodeLength = this.diagram.nodes().length;
        var nodeWidth = ( ( svgWidth - widthMargin * ( nodeLength + 1 ) ) / nodeLength );
        var nodeHeight = this.nodeHeight;
        return {
            "width": nodeWidth,
            "widthMargin": widthMargin,
            "height": nodeHeight,
            "heightMargin": heightMargin
        }
    };

    Drawer.SVG.prototype.defaultBackgroundColor = "#f9f9ff"; // white (little blue)
    Drawer.SVG.prototype.defaultStrokeColor = "#000033"; // black (little navy)

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

    /*
     * @obsolate
     */
    Drawer.SVG.prototype.drawEdges = function() {
        console.log("This method is obsolate. please use drawSequences instread.");
        this.drawSequences();
    }

    Drawer.SVG.prototype.drawSequences = function() {
        var y = this.marginTop + this.nodeHeight;
        var svgHeight = parseInt(this.svg.getAttribute("height")) || this.defaultDiagramHeight;
        var seqMargin = ( svgHeight - y ) / ( this.diagram.sequences.length + 1 );
        y += seqMargin;
        var seqs = this.diagram.sequences;
        for (var i = 0; i < seqs.length; i++ ) {
            if ( seqs[i] instanceof Separator ) {
                this.drawSeparator(seqs[i], {
                    "y": y,
                });
            } else {
                if ( seqs[i].attributes["type"] == "self_reference" ) {
                    this.drawSelfReferenceEdge(seqs[i], {
                        "y": y,
                    });
                } else {
                    this.drawEdge(seqs[i], {
                        "y": y,
                    });
                }
            }
            y += seqMargin;
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
        if ( edge.attributes["isDotted"] ) {
            path.setAttribute("stroke-dasharray", 5);
        }

        this.drawEdgeArrowHead(edge, {
            "fromX": fromX,
            "toX"  : toX,
            "y"    : y
        });

        this.svg.appendChild(path);

        if ( edge.attributes && edge.attributes["label"] !== undefined ) {
            this.drawEdgeText(edge, {
                "fromX": fromX,
                "toX"  : toX,
                "y"    : y
            });
        }
    };

    Drawer.SVG.prototype.drawSelfReferenceEdge = function(edge, params)
    {
        var y = params["y"];

        var target = this.getNodeRect(edge.from.id);
        var nextNode = null;
        var nodes = this.diagram.nodes();
        for ( var i = 0; i < nodes.length; i++ ) {
            if ( target.id == nodes[i].id ) {
                nextNode = nodes[i+1];
                break;
            }
        }
        // for right node's self-reference.
        if ( !nextNode ) {
            nextNode = nodes[nodes.length-1-1];
        }
        var nextNodeRect = this.getNodeRect(nextNode.id);
        var fromX   = parseInt(target.getAttribute("x")) + parseInt(target.getAttribute("width")) / 2.0;
        var toX = fromX + this.svg.width.baseVal.value / nodes.length / 2

        var fromPath = this.createSVGElement("path");
        fromPath.setAttribute("stroke", this.defaultStrokeColor);
        fromPath.setAttribute("d", "M " + fromX + " " + y + " L " + toX + " " + y);
        var toPath = this.createSVGElement("path");
        var selfReferenceEdgeMargin = 15;
        toPath.setAttribute("stroke", this.defaultStrokeColor);
        toPath.setAttribute("d", "M " + toX + " " + ( y + selfReferenceEdgeMargin ) + " L " + fromX + " " + ( y + selfReferenceEdgeMargin ) );

        var sidePath = this.createSVGElement("path");
        sidePath.setAttribute("stroke", this.defaultStrokeColor);
        sidePath.setAttribute("d", "M " + toX + " " + y + " L " + toX + " " + ( y + selfReferenceEdgeMargin ));

        this.svg.appendChild(fromPath);
        this.svg.appendChild(toPath);
        this.svg.appendChild(sidePath);

        this.drawEdgeArrowHead(edge, {
            "fromX": toX,
            "toX": fromX,
            "y" : y + selfReferenceEdgeMargin
        });

        this.drawEdgeText(edge, {
            "fromX": fromX,
            "toX": toX,
            "y" : y
        });

    };

    Drawer.SVG.prototype.arrowWidth = 10;
    Drawer.SVG.prototype.arrowHeight = 6;

    Drawer.SVG.prototype.drawEdgeArrowHead = function(edge, options) {
        var fromX = options["fromX"];
        var toX   = options["toX"];
        var y     = options["y"];

        var arrowWidth = this.arrowWidth;
        var arrowHeight = this.arrowHeight;

        var arrowFromX = null;
        if ( fromX < toX ) {
            arrowFromX = toX - arrowWidth;
        } else {
            arrowFromX = toX + arrowWidth;
        }
        if ( edge.attributes["isAsync"] ) {
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
    };

    Drawer.SVG.prototype.drawEdgeText = function (edge, options) {
        var fromX = options["fromX"];
        var toX   = options["toX"];
        var y     = options["y"];

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
    };

    Drawer.SVG.prototype.drawSeparator = function(sep, options) {
        var y = options["y"];

        var nodes = this.diagram.nodes();
        var firstNodeRect = this.getNodeRect(nodes[0].id);
        var lastNodeRect = this.getNodeRect(nodes[nodes.length-1].id);
        var fromX   = parseInt(firstNodeRect.getAttribute("x"));
        var toX     = parseInt(lastNodeRect.getAttribute("x")) + parseInt(lastNodeRect.getAttribute("width"));
        var path    = this.createSVGElement("path");
        path.setAttribute("d", "M " + fromX + " " + y + " L " + toX + " " + y);
        path.setAttribute("stroke", this.defaultStrokeColor);
        if ( sep.type == "delay" ) {
            path.setAttribute("stroke-dasharray", 5);
        }
        this.svg.appendChild(path);

        var textbox = this.createSVGElement('text');
        textbox.textContent = sep.comment;
        textbox.setAttribute("class", "separator-text");
        textbox.setAttribute("x", fromX + ( toX - fromX ) / 2 - textbox.textContent.length * this.charWidth / 2.0);
        textbox.setAttribute("y", y - 5);
        this.svg.appendChild(textbox);
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
        line.setAttribute("stroke", this.defaultStrokeColor);
        line.setAttribute("stroke-dasharray", 5);
        this.svg.appendChild(line);
    };

    // -----------------------------------------------------------------------------------------
    // declare exports followings:
    exports.Node = Node;
    exports.Edge = Edge;
    exports.Separator = Separator;
    exports.Diagram = Diagram;
    exports.DiagramBuilder = DiagramBuilder;
    exports.Drawer = Drawer;

})(typeof exports === 'undefined' ? this['Seqdiag'] = {} : exports );
