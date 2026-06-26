'use client';
import {useEffect,useState} from 'react';
import {AppShell} from '../../components/AppShell';
import {RecordList} from '../../components/RecordList';
import {api} from '../../lib/api';

export default function Page(){
  const[rows,setRows]=useState<any[]>([]);
  const[value,setValue]=useState('Install device');

  async function load(){try{setRows(await api('/work-orders'))}catch{setRows([])}}
  async function create(){
    const body:any={name:value,title:value,code:value,sku:value,category:'General',priority:'NORMAL',quantity:0};
    await api('/work-orders',{method:'POST',body:JSON.stringify(body)});
    await load();
  }

  useEffect(()=>{load()},[]);
  return <AppShell><h1>Work Orders</h1><div className='card'><input className='input' value={value} onChange={e=>setValue(e.target.value)}/><button className='btn' onClick={create}>Create</button></div><RecordList title='Work Orders' rows={rows}/></AppShell>
}
