import {cookies} from "next/headers";
import {SignJWT,jwtVerify} from "jose";
const NAME="airport_session";
function key(){if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error("Set JWT_SECRET to at least 32 characters");return new TextEncoder().encode(process.env.JWT_SECRET);}
export async function createSession(user){const token=await new SignJWT({userId:user.User_ID,username:user.Username,role:user.Role}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("8h").sign(key());(await cookies()).set(NAME,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:28800});}
export async function getSession(){const token=(await cookies()).get(NAME)?.value;if(!token)return null;try{return (await jwtVerify(token,key())).payload;}catch{return null;}}
export async function destroySession(){(await cookies()).delete(NAME);}
export async function requireRole(roles=["ADMIN","OPERATOR"]){const session=await getSession();if(!session)return {error:"Unauthenticated",status:401};if(!roles.includes(session.role))return {error:"Forbidden",status:403};return {session};}
