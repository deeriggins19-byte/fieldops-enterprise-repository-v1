'use client';
import {useEffect,useState} from 'react';
import {AppShell} from '../../components/AppShell';
import {RecordList} from '../../components/RecordList';
import {api} from '../../lib/api';

export default function Page(){
  const[rows,setRows]=useState<any[]>([]);
  const[value,setValue]=useState('SKU-001');

  async function load(){try{setRows(await api('/inventory'))}catch{setRows([])}}
  async function create(){
    const body:any={name:value,title:value,code:value,sku:value,category:'General',priority:'NORMAL',quantity:0};
    await api('/inventory',{method:'POST',body:JSON.stringify(body)});
    await load();
  }

  useEffect(()=>{load()},[]);
  return <AppShell><h1>Inventory</h1><div className='card'><input className='input' value={value} onChange={e=>setValue(e.target.value)}/><button className='btn' onClick={create}>Create</button></div><RecordList title='Inventory' rows={rows}/></AppShell>
}
