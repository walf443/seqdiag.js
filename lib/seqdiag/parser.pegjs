// SEE ALSO:
//  http://www.graphviz.org/content/dot-language

start
    = graph

graph
    = id: ID space '{' spaces s:stmt_list spaces '}' { return ["graph", { "id": id, "stmt": s}]; }

stmt_list
    = stmts+

stmts
    = s:stmt spaces { return s }

stmt
    = s:node_stmt { return s }
    / s:edge_stmt { return s }
    / s:attr_stmt { return s }

attr_stmt
    = attr_id attr_list ';'

attr_id
    = node
    / edge

node = ID
edge = edge_stmt

attr_list
    = '[' spaces a:a_list spaces ']' { return ["attributes", a ] }

a_list
    = a:a_pair+ { var obj = {}; for (var i =0; i < a.length; i++ ) { obj[a[i][0]] = a[i][1] }; return obj }

a_pair
    = key:ID spaces '=' spaces val:ID spaces ','? spaces { return [key, val] }

edge_stmt
    = id:node_id spaces rhs:edge_rhs spaces attr:attr_list? ';' { return ["edge", rhs[0], id, rhs[1], attr == '' ? null : attr]; }

edge_rhs
    = op:edge_op spaces id:node_id { return [op, id]; }

// extend dot language for seqdiag.
edge_op
    = '-' '>' '>'  { return "asynchronus" }
    / '-' '-' '>' '>'  { return "asynchronus_dotted" }
    / '-' '>' { return "normal" }
    / '<' '<' '-' '-'  { return "return_asynchronus_dotted" }
    / '<' '<' '-'  { return "return_asynchronus" }
    / '-' '-' '>' { return "dotted" }
    / '<' '-' '-' { return "return_dotted" }
    / '<' '-' { return "return" }

node_stmt
    = id:node_id attr:attr_list? ';' { return ["node", { "id": id, "attributes": attr == '' ? null : attr }] }

node_id
    = ID

subgraph
    = ''

ID
    = s:identifier+ { return s.join('') }
    / '"' s:string '"' { return s.join('') }

identifier
    = [a-zA-Z0-9]

string
    = [^"]+

spaces
    = space*

space
    = [ \n]

