'use client';
import {useEffect,useState} from 'react';
import {AppShell} from '../../components/AppShell';
import {RecordList} from '../../components/RecordList';
import {api} from '../../lib/api';

export default function Page(){
  const[rows,setRows]=useState<any[]>([]);
  const[name,setName]=useState('New Project');
  const[customerName,setCustomerName]=useState('');
  const[estimatedHours,setEstimatedHours]=useState('0');

  async function load(){try{setRows(await api('/projects'))}catch{setRows([])}}
  async function create(){
    const body:any={name,customerName,estimatedHours:Number(estimatedHours)||0};
    await api('/projects',{method:'POST',body:JSON.stringify(body)});
    await load();
  }

  useEffect(()=>{load()},[]);
  return <AppShell><h1>Projects</h1><div className='card'><input className='input' value={name} onChange={e=>setName(e.target.value)} placeholder='Project name'/><input className='input' value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder='Customer name (optional)'/><input className='input' value={estimatedHours} onChange={e=>setEstimatedHours(e.target.value)} placeholder='Estimated hours' inputMode='decimal'/><button className='btn' onClick={create}>Create</button></div><RecordList title='Projects' rows={rows}/></AppShell>
}
