'use client';
import {useState} from 'react';
import {saveSession} from '../../lib/session';

export default function Login(){
  const[email,setEmail]=useState('owner@example.com');
  const[password,setPassword]=useState('ChangeMe123!');

  async function go(){
    const r=await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email,password})
    });
    if(!r.ok)throw new Error('Login failed');
    saveSession(await r.json());
    location.href='/dashboard';
  }

  return <main className='auth-page'><div className='card auth-card'><h1>Welcome Back</h1><p>Sign in to access your FieldOps control center.</p><input className='input' value={email} onChange={e=>setEmail(e.target.value)}/><input className='input' type='password' value={password} onChange={e=>setPassword(e.target.value)}/><button className='btn' onClick={go}>Login</button></div></main>
}
