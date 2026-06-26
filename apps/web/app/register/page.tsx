'use client';
import {useState} from 'react';
import {saveSession} from '../../lib/session';

export default function Register(){
  const[tenantName,setTenant]=useState('FieldOps Pilot Company');
  const[fullName,setName]=useState('Pilot Owner');
  const[email,setEmail]=useState('owner@example.com');
  const[password,setPassword]=useState('ChangeMe123!');

  async function go(){
    const r=await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/register`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({tenantName,fullName,email,password})
    });
    if(!r.ok)throw new Error('Register failed');
    saveSession(await r.json());
    location.href='/dashboard';
  }

  return <main className='auth-page'><div className='card auth-card'><h1>Create Workspace</h1><p>Set up your tenant and owner account.</p><input className='input' value={tenantName} onChange={e=>setTenant(e.target.value)}/><input className='input' value={fullName} onChange={e=>setName(e.target.value)}/><input className='input' value={email} onChange={e=>setEmail(e.target.value)}/><input className='input' type='password' value={password} onChange={e=>setPassword(e.target.value)}/><button className='btn' onClick={go}>Create</button></div></main>
}
