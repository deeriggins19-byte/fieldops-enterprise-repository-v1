'use client';
import {useState} from 'react';
import {AppShell} from '../../components/AppShell';
import {api} from '../../lib/api';

export default function Forecasting(){
  const[projectId,setProjectId]=useState('');
  const[result,setResult]=useState<any>(null);
  async function run(){setResult(await api(`/forecasting/projects/${projectId}`,{method:'POST'}))}
  return <AppShell><h1>Forecasting</h1><div className='card'><input className='input' placeholder='Project ID' value={projectId} onChange={e=>setProjectId(e.target.value)}/><button className='btn' onClick={run}>Run Forecast</button></div>{result&&<div className='card'><pre>{JSON.stringify(result,null,2)}</pre></div>}</AppShell>
}
