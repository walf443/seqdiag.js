require('./test_helper.js');
(function() {
    "use strict";
    var q = QUnit;

    q.test('Parser', function() {
        var ast = Seqdiag.Parser.parse("seqdiag {\n" + 
            "A[label = \"aaa\"];\n" +
            "B[label = \"bbb\"];\n" +
        "}");
        q.ok(ast instanceof Array);
        q.ok(ast[0] instanceof Array);
        q.equal(ast[0][0], "Graph");
    });

    q.start();
})();

