import { getSession } from './session';

export async function api(path:string, options:any={}) {
  const session=getSession();
  const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${path}`,{
    ...options,
    headers:{'Content-Type':'application/json',...(session?.token?{Authorization:`Bearer ${session.token}`}:{})}
  });
  if(!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
