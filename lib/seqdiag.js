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
                if ( state === "in_graph" ) {
                    if ( ch == token_graph_end ) {
                        ast.push(["Graph", {}]);
                    }
                } else {
                    if ( ch == token_graph_start ) {
                        state = "in_graph";
                    }
                }
            }

            return ast;
        }
    };

})(typeof exports === 'undefined' ? this['Seqdiag'] = {} : exports );
