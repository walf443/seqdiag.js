
exports = module.exports = global;
QUnit = require("../node_modules/qunit-tap/node_modules/qunitjs/qunit/qunit");
var qunitTap = require("qunit-tap").qunitTap;
qunitTap(QUnit, require("sys").puts, { noPlan: true });

QUnit.init();
exports.assert = QUnit;
exports.Seqdiag = require('../lib/seqdiag');
require('../lib/seqdiag/parser');
exports.Seqdiag.Parser = SeqdiagParser;
