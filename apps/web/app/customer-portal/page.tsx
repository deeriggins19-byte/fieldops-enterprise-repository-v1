import { AppShell } from '../../components/AppShell';

export default function CustomerPortal(){return <AppShell><h1>Customer Portal</h1><section className='grid'>{['Project Status','Milestones','Approved Updates','Documents'].map(x=><div className='card' key={x}><h2>{x}</h2><p>Customer-safe module.</p></div>)}</section></AppShell>}
