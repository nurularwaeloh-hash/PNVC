import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  Platform, StatusBar, ActivityIndicator, Image 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, Eye, ChevronRight } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useUserAuth } from '../context/UserAuthContext';
// import { useNavigation } from '@react-navigation/native';

function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUserAuth();
  const [showPassword, setShowPassword] = useState(false); // เพิ่ม state สำหรับซ่อน/แสดงรหัสผ่าน
  // const navigation = useNavigation(); // <--- เอาบรรทัดนี้ออก

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      navigation.navigate('Main');
    } catch (err) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* ส่วนหัว: Background Gradient และ Logo */}
      <LinearGradient colors={['#1e3c72', '#2a5298', '#7cb9e8']} style={styles.headerBackground}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
             <Image 
              source={require('../assets/pnvc.png')} // แก้ไข Path ให้ถูกต้องแล้ว
              style={styles.logoImage} 
            />
          </View>
          <Text style={styles.uniNameTh}>วิทยาลัยอาชีวศึกษาปัตตานี</Text>
          <Text style={styles.uniNameEn}>Pattani Vocational College</Text>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <Text style={styles.mainTitle}>เข้าสู่ระบบของคุณ</Text>

        {/* การ์ดกรอกข้อมูล (Input Group) */}
        <View style={styles.inputCard}>
          <View style={styles.inputWrapper}>
            <User color="#2a5298" size={24} style={styles.inputIcon} />
            <View style={styles.inputTextContainer}>
              <Text style={styles.inputLabel}>ชื่อผู้ใช้ หรือ อีเมล</Text>
              <TextInput
                style={styles.input}
                placeholder="somchai.ra@example.edu"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <ChevronRight color="#CCC" size={20} />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputWrapper}>
            <Lock color="#2a5298" size={24} style={styles.inputIcon} />
            <View style={styles.inputTextContainer}>
              <Text style={styles.inputLabel}>รหัสผ่าน</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <TouchableOpacity><Eye color="#CCC" size={20} /></TouchableOpacity>
          </View>
        </View>

        {error ? <Text style={styles.errorMiniText}>{error}</Text> : null}

        {/* ปุ่มล็อกอินหลัก */}
        <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
          <LinearGradient colors={['#2a5298', '#1e3c72']} style={styles.loginButton}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>ล็อกอิน</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.forgotBtn}>
          <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
        </TouchableOpacity>

        {/* ส่วน Social Login */}
        <View style={styles.socialHeader}>
          <View style={styles.line} /><Text style={styles.socialHeaderText}>หรือเข้าสู่ระบบด้วย</Text>
          <View style={styles.line} />
        </View>

        {/* ✅ 2. แก้ไขชื่อสไตล์จาก socialButton เป็น socialCircle ให้ตรงกับ Stylesheet */}
       <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialCircle} activeOpacity={0.85}>
            <FontAwesome name="facebook" size={24} color="#1877F2" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialCircle} activeOpacity={0.85}>
            <FontAwesome name="google" size={24} color="#EA4335" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialCircle} activeOpacity={0.85}>
            <FontAwesome name="apple" size={26} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* ส่วนท้าย: สมัครสมาชิก */}
        <View style={styles.footer}>
          <Text style={styles.noAccountText}>ยังไม่มีบัญชี?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerBtn}>
            <Text style={styles.registerText}>สมัครสมาชิก</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  headerBackground: { height: '38%', justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 50, borderBottomRightRadius: 50 },
  logoContainer: { alignItems: 'center', marginTop: 30 },
  logoCircle: { 
    width: 130,           // 👈 ปรับความกว้าง (หน่วยเป็น pixel)
    height: 130,          // 👈 ปรับความสูง (ต้องเท่ากับ width เพื่อให้เป็นวงกลม)
    borderRadius: 65,     // 👈 ต้องเป็นครึ่งหนึ่งของ width/height เสมอ
    backgroundColor: '#FFF', 
    marginBottom: 15, 
    elevation: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden',   // 👈 บังคับให้รูปที่อยู่ข้างในถูกตัดขอบตามวงกลม hidden
    borderWidth: 2,
    borderColor: '#eee'
  },
  logoImage: { 
    width: '100%',        // 👈 ให้รูปขยายเต็มพื้นที่วงกลม
    height: '100%', 
    resizeMode: 'cover'  // 👈 'cover' คือขยายให้เต็มขอบ (ถ้ารูปต้นฉบับเป็นวงกลมจะพอดีเป๊ะ)
                         // 👈 ถ้าเปลี่ยนเป็น 'contain' รูปจะเล็กลงและเห็นขอบขาวรอบๆ
  },
  uniNameTh: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  uniNameEn: { color: '#FFF', fontSize: 16, opacity: 0.9 },
  
  contentContainer: { flex: 1, paddingHorizontal: 30, marginTop: -40 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e3c72', textAlign: 'center', marginBottom: 20 },
  
  inputCard: { backgroundColor: '#FFF', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  inputIcon: { marginRight: 15 },
  inputTextContainer: { flex: 1 },
  inputLabel: { fontSize: 12, color: '#2a5298', fontWeight: '600' },
  input: { fontSize: 16, color: '#333', paddingVertical: 4 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 10 },

  loginButton: { borderRadius: 30, paddingVertical: 15, alignItems: 'center', marginTop: 25, elevation: 5, shadowColor: '#2a5298', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  
  forgotBtn: { alignSelf: 'center', marginTop: 15 },
  forgotText: { color: '#2a5298', fontWeight: '600' },

  socialHeader: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#DDD' },
  socialHeaderText: { marginHorizontal: 10, color: '#888', fontSize: 14 },

  socialContainer: { flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 20 },
  socialCircle: { 
    width: 55, 
    height: 55, 
    borderRadius: 27.5, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 5 },

  footer: { marginTop: 'auto', marginBottom: 20, alignItems: 'center' },
  noAccountText: { color: '#666', marginBottom: 5 },
  registerBtn: { backgroundColor: '#FFF', paddingHorizontal: 40, paddingVertical: 10, borderRadius: 25, elevation: 2 },
  registerText: { color: '#2a5298', fontWeight: 'bold', fontSize: 16 },
  errorMiniText: { color: '#d32f2f', textAlign: 'center', marginTop: 10, fontSize: 13 },
});

export default Login;