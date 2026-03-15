import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { updatePassword, deleteUser } from 'firebase/auth';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { auth } from '../firebase';

export default function SecurityScreen() {
  const navigation = useNavigation();
  const db = getDatabase();
  const user = auth.currentUser;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginAlert, setLoginAlert] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    if (!user) return;
    const securityRef = ref(db, `users/${user.uid}/security`);
    const unsub = onValue(securityRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLoginAlert(data.loginAlertEnabled ?? true);
        setTwoFactor(data.twoFactorEnabled ?? false);
      }
    });
    return () => unsub();
  }, [user]);

  const toggleSecurity = async (key, value) => {
    try {
      await update(ref(db, `users/${user.uid}/security`), { [key]: value });
    } catch (err) {
      Alert.alert('Error', 'ไม่สามารถบันทึกการตั้งค่าได้');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('แจ้งเตือน', 'รหัสผ่านต้องมี 6 ตัวขึ้นไป');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('แจ้งเตือน', 'รหัสผ่านไม่ตรงกัน');
      return;
    }
    try {
      await updatePassword(user, newPassword);
      Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านแล้ว');
      setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') Alert.alert('ความปลอดภัย', 'กรุณา Login ใหม่ก่อนเปลี่ยนรหัสผ่าน');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert("⚠️ ยืนยัน", "ลบบัญชีถาวรหรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", style: "destructive", onPress: async () => {
          try {
            await deleteUser(user);
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (err) {
            Alert.alert("Error", "กรุณา Login ใหม่ก่อนลบบัญชี");
          }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <SafeAreaView style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>รหัสผ่านและความปลอดภัย</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>เปลี่ยนรหัสผ่าน</Text>
        <View style={styles.card}>
          <View style={styles.rowItem}><Text style={styles.inputLabel}>รหัสผ่านใหม่</Text>
            <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholder="••••••" />
          </View>
          <View style={[styles.rowItem, { borderBottomWidth: 0 }]}><Text style={styles.inputLabel}>ยืนยันรหัสผ่าน</Text>
            <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} placeholder="••••••" />
          </View>
          <TouchableOpacity style={styles.updateBtn} onPress={handleChangePassword}><Text style={styles.updateBtnText}>อัปเดต</Text></TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>การป้องกัน</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.textGroup}><Text style={styles.rowTitle}>แจ้งเตือนการเข้าสู่ระบบ</Text></View>
            <Switch value={loginAlert} onValueChange={(val) => { setLoginAlert(val); toggleSecurity('loginAlertEnabled', val); }} />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: '#FF3B30', marginTop: 30 }]}>โซนอันตราย</Text>
        <View style={[styles.card, { borderColor: '#FF3B30', borderWidth: 0.5 }]}>
          <TouchableOpacity style={styles.deleteRow} onPress={handleDeleteAccount}>
            <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>ลบบัญชีผู้ใช้ถาวร</Text>
            <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { backgroundColor: '#1A3B70', paddingBottom: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: Platform.OS === 'android' ? 35 : 10 },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: 'bold' },
  body: { flex: 1, paddingHorizontal: 16 },
  sectionLabel: { fontSize: 13, color: '#666', fontWeight: '600', marginTop: 22, marginBottom: 8 },
  card: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden' },
  rowItem: { padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  inputLabel: { fontSize: 12, color: '#8E8E93' },
  input: { fontSize: 16, color: '#000', marginTop: 4 },
  updateBtn: { backgroundColor: '#1A3B70', margin: 14, height: 45, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  updateBtnText: { color: 'white', fontWeight: 'bold' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  textGroup: { flex: 1 },
  rowTitle: { fontSize: 15 },
  deleteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF5F5' },
});