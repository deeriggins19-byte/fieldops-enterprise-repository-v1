import React,{useState}from'react';
import{Alert,Button,SafeAreaView,Text,TextInput,View}from'react-native';
import{enqueue,getUnsynced}from'./src/offlineQueue';
import{LaborTimer}from'./src/laborTimer';

const timer=new LaborTimer();

export default function App(){
  const[assetCode,setAsset]=useState('PNL-001');
  const[queued,setQueued]=useState(0);

  function scan(type:string){
    enqueue('scan',{assetCode,type,notes:'mobile scan'});
    setQueued(getUnsynced().length);
    Alert.alert('Queued',`${type} for ${assetCode}`);
  }

  return <SafeAreaView style={{flex:1,backgroundColor:'#020617',padding:24}}>
    <Text style={{color:'white',fontSize:34,fontWeight:'900'}}>FieldOps Mobile</Text>
    <TextInput value={assetCode} onChangeText={setAsset} style={{color:'white',borderColor:'#334155',borderWidth:1,padding:14,borderRadius:16,marginVertical:16}}/>
    <View style={{gap:12}}>
      {['INSTALL_START','INSTALL_COMPLETE','ISSUE_FOUND'].map(e=><Button key={e} title={e} onPress={()=>scan(e)}/>)}
      <Button title='Start Labor' onPress={()=>Alert.alert('Started',String(timer.start()))}/>
      <Button title='Stop Labor' onPress={()=>Alert.alert('Stopped',JSON.stringify(timer.stop()))}/>
    </View>
    <Text style={{color:'white',marginTop:20}}>Unsynced: {queued}</Text>
  </SafeAreaView>
}
