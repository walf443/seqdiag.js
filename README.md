
Seqdiag.js
----------
sequence diagram on javascript from simple text format.

Example
------------

	<!doctype html>
	<head>
		<script type="text/javascript" src="../lib/seqdiag/parser.js" ></script>
		<script type="text/javascript" src="../lib/seqdiag.js" ></script>
	</head>
	<body>
		<figure id="diag"></figure>
		<script type="text/x-seqdiag" id="seqdiag-text">
			seqdiag {
				A [label = "webapp"];
				B [label = "DB"];

				A -> B[label = "sql"];
				B -> A [label = "result"];
			};
		</script>
		<script type="text/javascript">
			window.onload = function() {
				var taget = document.getElementById('seqdiag-text');
				var ast = SeqdiagParser.parse(target.innerText);
				var diagram = Seqdiag.DiagramBuilder.build(ast);
				var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("width", "1024");
				svg.setAttribute("height", "600");
				var drawer = new Seqdiag.Drawer.SVG(diagram, svg, document);
				drawer.draw();
				var figure = document.getElementById('diag');
				figure.appendChild(svg);
			};
		</script>
	</body>
	</html>

SEE ALSO
-----------
 * examples/try.html
 * seqdiag - http://blockdiag.com/en/seqdiag/

LICENSE
----------------
(c) 2012 Keiji Yoshimi

This project is released under MIT license.
See followings: http://www.opensource.org/licenses/MIT

