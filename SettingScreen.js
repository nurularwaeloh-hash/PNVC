import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Modal,      // เพิ่มตัวนี้
  TextInput,  // เพิ่มตัวนี้
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserAuth } from '../context/UserAuthContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// ✅ รวมทุุกอย่างของ firebase/database ไว้ในบรรทัดเดียวแบบนี้ครับ
import { getDatabase, ref, onValue, update } from 'firebase/database'; 
import app from '../firebase';

// ✅ ตรวจสอบ Path ของ SecurityScreen (ถ้าอยู่ในโฟลเดอร์เดียวกันให้ใช้ ./)
import SecurityScreen from './SecurityScreen';


export default function SettingScreen() {
  const navigation = useNavigation();
  const { user, logOut } = useUserAuth();

  // --- States ---
  const [profile, setProfile] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const db = getDatabase(app);

// --- Effect: ดึงข้อมูลจาก Firebase ---
  useEffect(() => {
    if (!user) return;

    const profileRef = ref(db, 'users/' + user.uid);
    const unsub = onValue(profileRef, (snap) => {
      const data = snap.val() || {};
      setProfile(data);
      setName(data?.name || '');
      setPhotoUrl(data?.photo || '');
    });

    return () => unsub();
  }, [user]);
  // --- Logic: บันทึกโปรไฟล์ ---
  const saveProfile = async () => {
    try {
      if (!name.trim()) {
        Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อผู้ใช้งาน');
        return;
      }
      await update(ref(db, 'users/' + user.uid), {
        name: name.trim(),
        photo: photoUrl.trim(),
      });
      setEditModal(false);
      Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // --- Logic: ออกจากระบบ ---
  const handleLogout = async () => {
    try {
      await logOut();
      Alert.alert('ออกจากระบบ', 'ออกจากระบบเรียบร้อยแล้ว');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err) {
      Alert.alert('Error', 'ไม่สามารถออกจากระบบได้');
    }
  };

  const displayPhoto = profile?.photo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqNnqnpBmRIOuCtnjelf4fFN1NM38hNJUJEg&s';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Section */}
      <View style={styles.header}>
        <SafeAreaView style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back-ios" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>การตั้งค่า</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>เสร็จสิ้น ✓</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* Section: โปรไฟล์ */}
        <Text style={styles.sectionLabel}>ข้อมูลส่วนตัวและบัญชี</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.profileRow} onPress={() => setEditModal(true)}>
            <Image source={{ uri: displayPhoto }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>ข้อมูล โปรไฟล์</Text>
              <Text style={styles.userName}>{profile?.name || 'กำลังโหลด...'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity>
          
          <MenuRow 
           icon={<Ionicons name="lock-closed-outline" size={20} color="#1A3B70" />} 
  title="รหัสผ่านและความปลอดภัย" 
  subTitle="Passwords & Security" 
  onPress={() => navigation.navigate('Security')} // ชื่อหน้าต้องตรงกับที่ตั้งไว้ใน App.js
          />
          <MenuRow 
            icon={<Ionicons name="notifications-outline" size={20} color="#1A3B70" />} 
            title="การแจ้งเตือน" 
            isLast 
          />
        </View>
        {/* Section: ตั้งค่าแอป */}
        <Text style={styles.sectionLabel}>การแสดงผลและภาษา</Text>
        <View style={styles.sectionCard}>
          <MenuRow 
            icon={<Ionicons name="globe-outline" size={20} color="#1A3B70" />} 
            title="ภาษา (Language)" 
            rightText="ภาษาไทย"
          />
          <MenuRow 
            icon={<Ionicons name="color-palette-outline" size={20} color="#DAA520" />} 
            title="ธีม (Theme)" 
            rightText="ธีมเริ่มต้น"
            isLast 
          />
        </View>

        {/* Section: ช่วยเหลือ */}
        <Text style={styles.sectionLabel}>ข้อมูลแอปและช่วยเหลือ</Text>
        <View style={styles.sectionCard}>
          <MenuRow 
            icon={<Ionicons name="help-circle-outline" size={22} color="#B22222" />} 
            title="ช่วยเหลือและสนับสนุน" 
          />
          <MenuRow 
            icon={<Ionicons name="information-circle-outline" size={22} color="#1A3B70" />} 
            title="เกี่ยวกับแอป" 
            rightText="v1.0.0"
            isLast 
          />
        </View>

        {/* ปุ่มออกจากระบบ */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="white" />
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
     {/* --- Modal แก้ไขโปรไฟล์ --- */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>แก้ไขข้อมูลส่วนตัว</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <MaterialIcons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalAvatarContainer}>
                <Image source={{ uri: displayPhoto }} style={styles.modalAvatar} />
                <Text style={styles.modalAvatarLabel}>ตัวอย่างรูปโปรไฟล์</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>ชื่อผู้ใช้งาน</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="กรอกชื่อ-นามสกุล"
                  style={styles.newInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>URL รูปภาพ</Text>
                <TextInput
                  value={photoUrl}
                  onChangeText={setPhotoUrl}
                  placeholder="https://..."
                  style={styles.newInput}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity style={styles.newCancelBtn} onPress={() => setEditModal(false)}>
                  <Text style={styles.newCancelText}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.newSaveBtn} onPress={saveProfile}>
                  <Text style={styles.newSaveText}>บันทึกข้อมูล</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Component แถวเมนู ---

function MenuRow({ icon, title, subTitle, rightText, isLast, onPress }) {
  return (
    <TouchableOpacity style={[styles.menuRow, isLast && { borderBottomWidth: 0 }]} onPress={onPress}>
      <View style={styles.menuIconContainer}>{icon}</View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subTitle && <Text style={styles.menuSubTitle}>{subTitle}</Text>}
      </View>
      {rightText && <Text style={styles.rightText}>{rightText}</Text>}
      <MaterialIcons name="chevron-right" size={22} color="#C7C7CC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { backgroundColor: '#1A3B70', paddingBottom: 12 },
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    marginTop: Platform.OS === 'android' ? 35 : 10 
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  doneBtn: { backgroundColor: '#34C759', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  doneBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
  body: { flex: 1, paddingHorizontal: 16 },
  sectionLabel: { fontSize: 13, color: '#666', fontWeight: '600', marginTop: 22, marginBottom: 8, marginLeft: 4 },
  sectionCard: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden' },
  profileRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA' },
  avatar: { width: 55, height: 55, borderRadius: 27.5, marginRight: 12 },
  profileInfo: { flex: 1 },
  profileLabel: { fontSize: 15, fontWeight: 'bold', color: '#1A3B70' },
  userName: { fontSize: 14, color: '#333', marginTop: 2 },
  userEmail: { fontSize: 12, color: '#8E8E93' },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  menuIconContainer: { width: 28, alignItems: 'center' },
  menuTextContainer: { flex: 1, marginLeft: 10 },
  menuTitle: { fontSize: 15, color: '#000' },
  menuSubTitle: { fontSize: 11, color: '#8E8E93' },
  rightText: { fontSize: 13, color: '#8E8E93', marginRight: 4 },
  logoutBtn: { backgroundColor: '#E14D45', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 25, marginTop: 35 },
  logoutText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A3B70' },
  modalAvatarContainer: { alignItems: 'center', marginBottom: 20 },
  modalAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  modalAvatarLabel: { fontSize: 12, color: '#8E8E93' },
  inputGroup: { marginBottom: 15 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  newInput: { height: 48, backgroundColor: '#F2F2F7', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E5E5EA' },
  modalActionRow: { flexDirection: 'row', marginTop: 20, marginBottom: 10 },
  newCancelBtn: { flex: 1, height: 48, borderRadius: 24, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  newCancelText: { color: '#666', fontWeight: '600' },
  newSaveBtn: { flex: 2, height: 48, borderRadius: 24, backgroundColor: '#1A3B70', alignItems: 'center', justifyContent: 'center' },
  newSaveText: { color: 'white', fontWeight: 'bold' },
});