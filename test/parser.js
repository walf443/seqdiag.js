require('./test_helper.js');
(function() {
    "use strict";

    QUnit.test('Parser', function() {
        Seqdiag.Parser.parse("test");
        QUnit.ok(1);
    });

    QUnit.start();
})();

