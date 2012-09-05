require('./test_helper.js');
(function() {
    "use strict";

    var q = QUnit;

    q.test("Node", function() {
        var nodeA = new Seqdiag.Node("A");
        q.ok(nodeA instanceof Seqdiag.Node, "instance OK");
        q.equal(nodeA.id, "A", "A OK");
        var nodeB = new Seqdiag.Node("B");
        q.ok(nodeB instanceof Seqdiag.Node, "instance OK");
        q.equal(nodeB.id, "B", "B OK");
        q.equal(nodeA.id, "A", "A OK");
    });

    q.test("Edge", function() {
        var nodeA = new Seqdiag.Node("A");
        var nodeB = new Seqdiag.Node("B");
        var edgeAB = new Seqdiag.Edge(nodeA, nodeB, { label: "a" });
        q.ok(edgeAB instanceof Seqdiag.Edge, "instance OK");
        q.strictEqual(edgeAB.from, nodeA, "from OK");
        q.strictEqual(edgeAB.to, nodeB, "to OK");
    });

    q.test("Diagram", function() {
        var diagram = new Seqdiag.Diagram();
        q.ok(diagram instanceof Seqdiag.Diagram, "instance OK");
    });

})();
