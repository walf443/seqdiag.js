require('./test_helper.js');
(function() {
    "use strict";

    var q = QUnit;
    q.module("DiagramBuilder", {
    });

    q.test("normal case", function() {
        var ast = Seqdiag.Parser.parse("seqdiag {\n" + 
            "A[label = \"aaa\", foo = \"bar\"];\n" +
            "B[label = \"あいうえお\"];\n" +
            "C;\n" +
            "A -> B [ label = \"A to B\" ];" +
            "B --> A;" +
        "}");

        var diagram = Seqdiag.DiagramBuilder.build(ast);
        q.ok(diagram instanceof Seqdiag.Diagram, "instance OK");
        q.equal(diagram.nodes().length, 3, "diagram should have 3 nodes");
        q.equal(diagram.edges.length, 2, "diagram should have 2 edge");

        var edgeAB = diagram.edges[0];
        q.equal(edgeAB.attributes["type"], "normal", "edge type OK");
        var edgeBA = diagram.edges[1];
        q.equal(edgeBA.attributes["type"], "dotted", "edge type OK");

    });

    q.test("without defining node case.", function() {
        var ast = Seqdiag.Parser.parse("seqdiag {\n" + 
            "A -> B [ label = \"A to B\" ];" +
            "B --> A;" +
        "}");

        var diagram = Seqdiag.DiagramBuilder.build(ast);
        q.ok(diagram instanceof Seqdiag.Diagram, "instance OK");
        q.equal(diagram.nodes().length, 2, "diagram should have 2 nodes");
        q.equal(diagram.edges.length, 2, "diagram should have 2 edge");

    });
})();
