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

    q.test('edge types', function() {
        var ast = Seqdiag.Parser.parse("seqdiag {\n" + 
            "A -> B;" +
            "B --> C;" +
            "B <-- C;" +
            "A <- B;" +
            "A ->> B;" +
            "B -->> C;" +
            "B <<-- C;" +
            "A <<- B;" +
            "A -> A;" +
        "}");

        var diagram = Seqdiag.DiagramBuilder.build(ast);
        q.ok(diagram instanceof Seqdiag.Diagram, "diagram OK");
        q.equal(diagram.edges.length, 9);

        q.equal(diagram.edges[0].attributes["type"], "normal", "normal OK");
        q.equal(diagram.edges[0].attributes["isReturn"], false, "isReturn OK");
        q.equal(diagram.edges[0].attributes["isDotted"], false, "isDotted OK");
        q.equal(diagram.edges[0].attributes["isAsync"],  false, "isAsync OK");

        q.equal(diagram.edges[1].attributes["type"], "dotted", "dotted OK");
        q.equal(diagram.edges[1].attributes["isReturn"], false, "isReturn OK");
        q.equal(diagram.edges[1].attributes["isDotted"], true, "isDotted OK");
        q.equal(diagram.edges[1].attributes["isAsync"],  false, "isAsync OK");

        q.equal(diagram.edges[2].attributes["type"], "return_dotted", "return_dotted OK");
        q.equal(diagram.edges[2].attributes["isReturn"], true, "isReturn OK");
        q.equal(diagram.edges[2].attributes["isDotted"], true, "isDotted OK");
        q.equal(diagram.edges[2].attributes["isAsync"],  false, "isAsync OK");

        q.equal(diagram.edges[3].attributes["type"], "return", "return OK");
        q.equal(diagram.edges[3].attributes["isReturn"], true, "isReturn OK");
        q.equal(diagram.edges[3].attributes["isDotted"], false, "isDotted OK");
        q.equal(diagram.edges[3].attributes["isAsync"],  false, "isAsync OK");

        q.equal(diagram.edges[4].attributes["type"], "async", "async OK");
        q.equal(diagram.edges[4].attributes["isReturn"], false, "isReturn OK");
        q.equal(diagram.edges[4].attributes["isDotted"], false, "isDotted OK");
        q.equal(diagram.edges[4].attributes["isAsync"],  true, "isAsync OK");

        q.equal(diagram.edges[5].attributes["type"], "async_dotted", "async_dotted OK");
        q.equal(diagram.edges[5].attributes["isReturn"], false, "isReturn OK");
        q.equal(diagram.edges[5].attributes["isDotted"], true, "isDotted OK");
        q.equal(diagram.edges[5].attributes["isAsync"],  true, "isAsync OK");

        q.equal(diagram.edges[6].attributes["type"], "return_async_dotted", "return_async_dotted OK");
        q.equal(diagram.edges[6].attributes["isReturn"], true, "isReturn OK");
        q.equal(diagram.edges[6].attributes["isDotted"], true, "isDotted OK");
        q.equal(diagram.edges[6].attributes["isAsync"],  true, "isAsync OK");

        q.equal(diagram.edges[7].attributes["type"], "return_async", "return_async OK");
        q.equal(diagram.edges[7].attributes["isReturn"], true, "isReturn OK");
        q.equal(diagram.edges[7].attributes["isDotted"], false, "isDotted OK");
        q.equal(diagram.edges[7].attributes["isAsync"],  true, "isAsync OK");

        q.equal(diagram.edges[8].attributes["type"], "self_reference", "self_reference OK");
        q.equal(diagram.edges[8].attributes["isReturn"], false, "isReturn OK");
        q.equal(diagram.edges[8].attributes["isDotted"], false, "isDotted OK");
        q.equal(diagram.edges[8].attributes["isAsync"],  false, "isAsync OK");
    });

    q.test('auto return edge', function() {
        var ast = Seqdiag.Parser.parse("seqdiag {\n" + 
            "A => B;" +
            "A ==> B;" +
            "A =>> B;" +
            "A ==>> B;" +
        "}");
        var diagram = Seqdiag.DiagramBuilder.build(ast);
        q.ok(diagram instanceof Seqdiag.Diagram, "diagram OK");
        q.equal(diagram.edges.length, 4 * 2);

        q.equal(diagram.edges[0].attributes["type"], "normal", "normal OK");
        q.equal(diagram.edges[0].attributes["isReturn"], false, "isReturn OK");
        q.equal(diagram.edges[0].attributes["isDotted"], false, "isDotted OK");
        q.equal(diagram.edges[0].attributes["isAsync"],  false, "isAsync OK");
        q.equal(diagram.edges[0].from.id, "A", "from OK");
        q.equal(diagram.edges[0].to.id, "B", "from OK");
        q.equal(diagram.edges[1].attributes["type"], "normal", "normal OK");
        q.equal(diagram.edges[1].attributes["isReturn"], false, "isReturn OK");
        q.equal(diagram.edges[1].attributes["isDotted"], false, "isDotted OK");
        q.equal(diagram.edges[1].attributes["isAsync"],  false, "isAsync OK");
        q.equal(diagram.edges[1].from.id, "B", "from OK");
        q.equal(diagram.edges[1].to.id, "A", "from OK");


    });
})();
