export const KEY='fieldops.session';
export function saveSession(session:any){localStorage.setItem(KEY,JSON.stringify(session))}
export function getSession(){if(typeof window==='undefined') return null; const raw=localStorage.getItem(KEY); return raw?JSON.parse(raw):null}
export function logout(){localStorage.removeItem(KEY); location.href='/login'}
