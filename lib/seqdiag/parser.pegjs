// SEE ALSO:
//  http://www.graphviz.org/content/dot-language

start
    = graph

graph
    = id: ID space '{' spaces s:stmt_list spaces '}' { return ["graph", { "id": id.join(''), "stmt": s}]; }

stmt_list
    = stmts+

stmts
    = s:stmt ";" spaces { return s }

stmt
    = s:node_stmt { return s }
    / s:edge_stmt { return s }
    / s:attr_stmt { return s }
    / s:ID '=' ID { return s }
    / s:subgraph { return s }

attr_stmt
    = attr_id attr_list

attr_id
    = graph
    / node
    / edge

node = ID
edge = ID

attr_list
    = '[' a_list ']'

a_list
    = ID spaces '=' spaces ID spaces ','?

edge_stmt
    = ''

node_stmt
    = id:node_id attr:attr_list { return ["node", { "id": id.join(''), "attributes": attr }] }

node_id
    = ID

subgraph
    = ''

ID
    = s:identifier+ { return s }
    / '"' s:string '"' { return s }

identifier
    = [a-zA-Z0-9]

string
    = [^"]+

spaces
    = space*

space
    = [ \n]
