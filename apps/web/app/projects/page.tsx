'use client';
import {useEffect,useState} from 'react';
import {AppShell} from '../../components/AppShell';
import {RecordList} from '../../components/RecordList';
import {api} from '../../lib/api';

export default function Page(){
  const[rows,setRows]=useState<any[]>([]);
  const[value,setValue]=useState('New Project');

  async function load(){try{setRows(await api('/projects'))}catch{setRows([])}}
  async function create(){
    const body:any={name:value,title:value,code:value,sku:value,category:'General',priority:'NORMAL',quantity:0};
    await api('/projects',{method:'POST',body:JSON.stringify(body)});
    await load();
  }

  useEffect(()=>{load()},[]);
  return <AppShell><h1>Projects</h1><div className='card'><input className='input' value={value} onChange={e=>setValue(e.target.value)}/><button className='btn' onClick={create}>Create</button></div><RecordList title='Projects' rows={rows}/></AppShell>
}
