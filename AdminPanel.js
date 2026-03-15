import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import { useUserAuth } from "../context/UserAuthContext";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

export default function AdminPanel({ navigation }) {

  const { user, role, logout } = useUserAuth();

  const [email,setEmail] = useState("");
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const loadUser = async()=>{

      try{

        if(user){

          const snap = await get(ref(db,"users/"+user.uid))

          if(snap.exists()){
            setEmail(snap.val().email)
          }

        }

      }catch(err){
        console.log(err)
      }

      setLoading(false)

    }

    loadUser()

  },[user])

  // ถ้าไม่ใช่ admin
  if(role !== "admin"){
    return(
      <View style={styles.center}>
        <Text style={styles.noAccess}>❌ ไม่มีสิทธิ์เข้าใช้งาน</Text>
      </View>
    )
  }

  if(loading){
    return(
      <View style={styles.center}>
        <ActivityIndicator size="large"/>
      </View>
    )
  }

  return (

    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>ผู้ดูแลระบบ</Text>
      </View>

      {/* USER INFO */}

      <View style={styles.userBox}>

        <MaterialIcons name="admin-panel-settings" size={40} color="#0284C7"/>

        <View>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.role}>Role : {role}</Text>
        </View>

      </View>

      {/* MENU */}

      <View style={styles.menu}>

        <TouchableOpacity
          style={styles.button}
          onPress={()=>navigation.navigate("MemberScreen")}
        >
          <MaterialIcons name="group" size={24} color="#fff"/>
          <Text style={styles.btnText}>จัดการสมาชิก</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={()=>navigation.navigate("VoteScreen")}
        >
          <MaterialIcons name="how-to-vote" size={24} color="#fff"/>
          <Text style={styles.btnText}>จัดการรายการโหวต</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={()=>navigation.navigate("VoteHistory")}
        >
          <MaterialIcons name="bar-chart" size={24} color="#fff"/>
          <Text style={styles.btnText}>ดูผลการโหวต</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button,{backgroundColor:"#DC2626"}]}
          onPress={logout}
        >
          <MaterialIcons name="logout" size={24} color="#fff"/>
          <Text style={styles.btnText}>ออกจากระบบ</Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

container:{
 flex:1,
 backgroundColor:"#F1F5F9",
 padding:20
},

header:{
 marginBottom:30
},

title:{
 fontSize:28,
 fontWeight:"bold"
},

subtitle:{
 color:"#64748B"
},

userBox:{
 flexDirection:"row",
 alignItems:"center",
 backgroundColor:"#fff",
 padding:15,
 borderRadius:10,
 marginBottom:30,
 gap:10
},

email:{
 fontSize:16,
 fontWeight:"bold"
},

role:{
 color:"#64748B"
},

menu:{
 gap:15
},

button:{
 flexDirection:"row",
 alignItems:"center",
 gap:10,
 backgroundColor:"#0284C7",
 padding:15,
 borderRadius:10
},

btnText:{
 color:"#fff",
 fontWeight:"bold",
 fontSize:16
},

center:{
 flex:1,
 justifyContent:"center",
 alignItems:"center"
},

noAccess:{
 fontSize:18,
 color:"red"
}

});