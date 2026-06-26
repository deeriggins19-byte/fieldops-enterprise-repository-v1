'use client';
import {useEffect,useState} from 'react';
import {AppShell} from '../../components/AppShell';
import {RecordList} from '../../components/RecordList';
import {api} from '../../lib/api';

export default function Page(){
  const[rows,setRows]=useState<any[]>([]);
  const[title,setTitle]=useState('Install device');
  const[description,setDescription]=useState('');
  const[priority,setPriority]=useState('NORMAL');
  const[projectId,setProjectId]=useState('');
  const[assetId,setAssetId]=useState('');

  async function load(){try{setRows(await api('/work-orders'))}catch{setRows([])}}
  async function create(){
    const body:any={title,description,priority,projectId,assetId};
    await api('/work-orders',{method:'POST',body:JSON.stringify(body)});
    await load();
  }

  useEffect(()=>{load()},[]);
  return <AppShell><h1>Work Orders</h1><div className='card'><input className='input' value={title} onChange={e=>setTitle(e.target.value)} placeholder='Title'/><input className='input' value={description} onChange={e=>setDescription(e.target.value)} placeholder='Description (optional)'/><input className='input' value={priority} onChange={e=>setPriority(e.target.value)} placeholder='Priority'/><input className='input' value={projectId} onChange={e=>setProjectId(e.target.value)} placeholder='Project ID (optional)'/><input className='input' value={assetId} onChange={e=>setAssetId(e.target.value)} placeholder='Asset ID (optional)'/><button className='btn' onClick={create}>Create</button></div><RecordList title='Work Orders' rows={rows}/></AppShell>
}
