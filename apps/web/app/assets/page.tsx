'use client';
import {useEffect,useState} from 'react';
import {AppShell} from '../../components/AppShell';
import {RecordList} from '../../components/RecordList';
import {api} from '../../lib/api';

export default function Page(){
  const[rows,setRows]=useState<any[]>([]);
  const[code,setCode]=useState('PNL-001');
  const[name,setName]=useState('Main Panel');
  const[category,setCategory]=useState('General');
  const[projectId,setProjectId]=useState('');

  async function load(){try{setRows(await api('/assets'))}catch{setRows([])}}
  async function create(){
    const body:any={code,name,category,projectId};
    await api('/assets',{method:'POST',body:JSON.stringify(body)});
    await load();
  }

  useEffect(()=>{load()},[]);
  return <AppShell><h1>Assets</h1><div className='card'><input className='input' value={code} onChange={e=>setCode(e.target.value)} placeholder='Asset code'/><input className='input' value={name} onChange={e=>setName(e.target.value)} placeholder='Asset name'/><input className='input' value={category} onChange={e=>setCategory(e.target.value)} placeholder='Category'/><input className='input' value={projectId} onChange={e=>setProjectId(e.target.value)} placeholder='Project ID (optional)'/><button className='btn' onClick={create}>Create</button></div><RecordList title='Assets' rows={rows}/></AppShell>
}
