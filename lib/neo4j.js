import neo4j from "neo4j-driver";
let driver;
function getDriver(){if(!process.env.NEO4J_URI||!process.env.NEO4J_USER||!process.env.NEO4J_PASSWORD)throw new Error("Neo4j environment variables are not configured");if(!driver)driver=neo4j.driver(process.env.NEO4J_URI,neo4j.auth.basic(process.env.NEO4J_USER,process.env.NEO4J_PASSWORD));return driver;}
export async function runCypher(cypher,params={}){const s=getDriver().session();try{const r=await s.run(cypher,params);return r.records.map(x=>Object.fromEntries(Object.entries(x.toObject()).map(([k,v])=>[k,neo4j.isInt(v)?v.toNumber():v])));}finally{await s.close();}}
