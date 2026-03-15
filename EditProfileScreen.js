import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

// Firebase Imports
import { getAuth, updateProfile } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, update } from 'firebase/database';
import app from '../firebase'; 

export default function EditProfileScreen({ navigation }) {
  const auth = getAuth(app);
  const user = auth.currentUser;
  const storage = getStorage(app);
  const db = getDatabase(app);

  // State สำหรับเก็บข้อมูล
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
  const [loading, setLoading] = useState(false);

  // --- 1. ฟังก์ชันเลือกรูปจากแกลเลอรี ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('ขออภัย', 'แอปต้องการสิทธิ์เข้าถึงรูปภาพเพื่อเปลี่ยนโปรไฟล์');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  // --- 2. ฟังก์ชันแปลง URI เป็น Blob และอัปโหลดไป Firebase Storage ---
  const uploadImageAsync = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () { resolve(xhr.response); };
      xhr.onerror = function (e) { reject(new TypeError("Network request failed")); };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const fileRef = storageRef(storage, `avatars/${user.uid}`);
    await uploadBytes(fileRef, blob);
    
    // คืนค่าเป็น URL ออนไลน์
    return await getDownloadURL(fileRef);
  };

  // --- 3. ฟังก์ชันบันทึกข้อมูลทั้งหมด ---
  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อผู้ใช้งาน");
      return;
    }

    setLoading(true);
    try {
      let finalPhotoURL = photoURL;

      // ถ้า photoURL เป็นไฟล์ในเครื่อง (เริ่มด้วย file://) ให้ทำการอัปโหลดก่อน
      if (photoURL && photoURL.startsWith('file://')) {
        finalPhotoURL = await uploadImageAsync(photoURL);
      }

      // A: อัปเดตข้อมูลใน Firebase Auth
      await updateProfile(auth.currentUser, {
      displayName: displayName,
      photoURL: finalPhotoURL
    });

      // 2. อัปเดตข้อมูลใน Database (ที่คุณทำไว้แล้ว)
    const userDbRef = dbRef(db, `users/${user.uid}`);
    await update(userDbRef, {
      displayName: displayName,
      photoURL: finalPhotoURL,
    });
    
    await user.reload(); // รีเฟรชข้อมูลผู้ใช้หลังอัปเดต

      Alert.alert("สำเร็จ", "อัปเดตข้อมูลเรียบร้อย", [
      { text: "ตกลง", onPress: () => navigation.goBack() } // พอกลับหน้า Home รูปควรจะเปลี่ยนตาม
    ]);
  } catch (error) {
      Alert.alert("ผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#E0F2FE', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>แก้ไขข้อมูลส่วนตัว</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Profile Image Section */}
        <TouchableOpacity style={styles.avatarSection} onPress={pickImage} activeOpacity={0.8}>
          <Image 
            source={photoURL ? { uri: photoURL } : require('../assets/pnvc.png')} 
            style={styles.avatar} 
          />
          <View style={styles.cameraIcon}>
            <MaterialIcons name="camera-alt" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* Input Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ชื่อผู้ใช้งาน</Text>
          <TextInput
            style={styles.input}
            placeholder="กรอกชื่อของคุณ"
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={30}
          />
        </View>

        {/* Email (Read Only) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>อีเมล (ไม่สามารถแก้ไขได้)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user?.email}
            editable={false}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>บันทึกข้อมูล</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0C4A6E' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 30, paddingTop: 20 },
  avatarSection: { position: 'relative', marginBottom: 30 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#FFF', backgroundColor: '#F0F9FF' },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#0284C7',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 3
  },
  inputGroup: { width: '100%', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#0369A1', marginBottom: 8 },
  input: {
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
    color: '#0F172A'
  },
  disabledInput: { backgroundColor: '#F1F5F9', color: '#64748B' },
  saveBtn: {
    backgroundColor: '#0284C7',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});