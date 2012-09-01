(function(exports)
{
    exports.Parser = {
        parse: function(str) {
            var ast =  [];

            var token_graph_start = "{"
            var token_graph_end = "}"

            var length = str.length;
            var i;
            var state;
            for (i = 0; i< length; i++ ) {
                var ch = str[i];
                var graph;
                switch (state) {
                    case "in_graph":
                        if ( ch == token_graph_end ) {
                            ast.push(graph);
                            state = undefined;
                        }
                        break;
                    case "in_statement":
                        if ( ch == ";" ) {
                            state = "in_graph";
                        }
                        break;
                    default:
                        if ( ch == token_graph_start ) {
                            state = "in_statement";
                            graph = ["Graph", {}];
                        }
                        break;
                }
            }

            if ( state != undefined ) {
                throw "Syntax error";
            }
            return ast;
        }
    };

})(typeof exports === 'undefined' ? this['Seqdiag'] = {} : exports );
