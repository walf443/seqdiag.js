
exports = module.exports = global;
QUnit = require("../node_modules/qunit-tap/node_modules/qunitjs/qunit/qunit");
var qunitTap = require("qunit-tap").qunitTap;
qunitTap(QUnit, require("sys").puts, { noPlan: true });

QUnit.init();
exports.assert = QUnit;
