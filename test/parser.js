require('./test_helper.js');
(function() {
    "use strict";
    var q = QUnit;

    q.test('Parser', function() {
        var ast = Seqdiag.Parser.parse("seqdiag {\n" + 
            "A[label = \"aaa\"];\n" +
            "B[label = \"bbb\"];\n" +
        "}");

        q.ok(ast instanceof Array, "should return tuple");
        q.equal(ast[0], "graph", "token should be graph");

        q.ok(ast[1] instanceof Object, "graph has token attribute");
        q.equal(ast[1]["id"], "seqdiag", "graph attribute should have 'id'");

        q.ok(ast[1]["stmt"] instanceof Array, "graph attribute should have stmt");

        // for node A
        q.equal(ast[1]["stmt"][0][0], "node", "first statement should be node");
        q.equal(typeof ast[1]["stmt"][0][1] , "object", "node should have attributes");
        q.equal(ast[1]["stmt"][0][1]["id"], "A", "node id should be A");

        q.equal(ast[1]["stmt"][1][0], "node", "first statement should be node");
        q.equal(typeof ast[1]["stmt"][1][1] , "object", "node should have attributes");
        q.equal(ast[1]["stmt"][1][1]["id"], "B", "node id should be B");
    });

    q.start();
})();

