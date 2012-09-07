require('./test_helper.js');
(function() {
    "use strict";

    var q = QUnit;
    q.test("DiagramBuilder", function() {
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

    });

})();
