'use client';
import {useState} from 'react';
import {AppShell} from '../../components/AppShell';
import {api} from '../../lib/api';

export default function AI(){
  const[assetCode,setAsset]=useState('PNL-001');
  const[issue,setIssue]=useState('Device issue');
  const[result,setResult]=useState<any>(null);
  async function run(){setResult(await api('/ai/troubleshoot',{method:'POST',body:JSON.stringify({assetCode,issue})}))}
  return <AppShell><section className='headline card'><p className='eyebrow'>Copilot Assist</p><h1>Amara AI Command Center</h1><p>Generate field troubleshooting guidance with one click.</p></section><div className='card'><label className='field-label'>Asset Code</label><input className='input' value={assetCode} onChange={e=>setAsset(e.target.value)}/><label className='field-label'>Issue Description</label><textarea value={issue} onChange={e=>setIssue(e.target.value)}/><button className='btn' onClick={run}>Troubleshoot</button></div>{result&&<section className='card'><h2 className='result-title'>Recommended Action Plan</h2>{result.summary&&<p className='result-summary'>{result.summary}</p>}{Array.isArray(result.steps)&&result.steps.length>0&&<ol className='result-steps'>{result.steps.map((step:string,idx:number)=><li key={`${step}-${idx}`}>{step}</li>)}</ol>}<pre>{JSON.stringify(result,null,2)}</pre></section>}</AppShell>
}
