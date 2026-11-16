import mysql from "mysql2/promise";
let pool;
export function getPool(){ if(!pool) pool=mysql.createPool({host:process.env.MYSQL_HOST||"127.0.0.1",port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER||"root",password:process.env.MYSQL_PASSWORD||"",database:process.env.MYSQL_DATABASE||"Airport_operation",waitForConnections:true,connectionLimit:10,dateStrings:true}); return pool; }
export async function query(sql,params=[]){const [rows]=await getPool().execute(sql,params);return rows;}
