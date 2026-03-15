import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert, TouchableOpacity,
  Platform, StatusBar, ScrollView, KeyboardAvoidingView, Image, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserAuth } from '../context/UserAuthContext';

const { width } = Dimensions.get('window');

function Register() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [major, setMajor] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // เรียกใช้งาน signUp จาก Context
  const { signUp } = useUserAuth();
  const navigation = useNavigation();

  const handleRegister = async () => {
    // 1. ตรวจสอบว่ากรอกข้อมูลครบถ้วนหรือไม่
    if (!name || !studentId || !major || !email || !password) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    try {
      setLoading(true);
      
      // 2. เรียกใช้ signUp โดยส่งข้อมูลเป็น Object (ต้องตรงกับที่แก้ใน UserAuthContext)
      // การ trim() เพื่อลบช่องว่างที่อาจติดมาจากการพิมพ์
      await signUp(email.trim().toLowerCase(), password, {
        name: name.trim(),
        studentId: studentId.trim(),
        major: major.trim(),
        school: 'วิทยาลัยอาชีวศึกษาปัตตานี',
      });

      // 3. แสดงข้อความสำเร็จและเปลี่ยนหน้า
      Alert.alert('สำเร็จ', 'ลงทะเบียนและบันทึกข้อมูลเรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => navigation.navigate('Login') },
      ]);

    } catch (err) {
      // 4. จัดการ Error ต่างๆ เช่น อีเมลซ้ำ หรือ รหัสผ่านไม่ปลอดภัย
      let errorMessage = "ไม่สามารถลงทะเบียนได้ในขณะนี้";
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "อีเมลนี้ถูกใช้งานไปแล้ว กรุณาใช้อีเมลอื่น";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "รูปแบบอีเมลไม่ถูกต้อง";
      }
      
      Alert.alert('ผิดพลาด', errorMessage);
      console.log(err.code); // ดู code error ใน console เพื่อตรวจสอบเพิ่มเติม
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a3a8a', '#3b82f6', '#f8f9fa']} style={styles.backgroundGradient}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* ส่วนหัว/โลโก้ */}
            <View style={styles.headerContainer}>
              <View style={styles.logoCircle}>
                <Image source={require('../assets/pnvc.png')} style={styles.logoImage} />
              </View>
              <Text style={styles.universityNameTh}>วิทยาลัยอาชีวศึกษาปัตตานี</Text>
              <Text style={styles.universityNameEn}>Pattani Vocational College</Text>
            </View>
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>สมัครสมาชิก</Text>
              <Text style={styles.cardSubtitle}>สร้างบัญชีใหม่เพื่อเข้าสู่ระบบ</Text>

              <View style={styles.inputContainer}>
                {/* ช่องกรอก ชื่อ-นามสกุล */}
                <View style={styles.inputRow}>
                  <View style={styles.iconCircle}><Ionicons name="person-outline" size={18} color="#0052A2" /></View>
                  <View style={styles.inputFieldWrap}>
                    <Text style={styles.inputLabel}>ชื่อ - นามสกุล</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="สมชาย รักเรียน" 
                      value={name} 
                      onChangeText={setName} 
                    />
                  </View>
                </View>

                <View style={styles.lineDivider} />

                {/* ช่องกรอก รหัสนักศึกษา */}
                <View style={styles.inputRow}>
                  <View style={styles.iconCircle}><Ionicons name="card-outline" size={18} color="#0052A2" /></View>
                  <View style={styles.inputFieldWrap}>
                    <Text style={styles.inputLabel}>รหัสนักศึกษา</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="64XXXXXXXX" 
                      keyboardType="number-pad" 
                      value={studentId} 
                      onChangeText={setStudentId} 
                    />
                  </View>
                </View>

                <View style={styles.lineDivider} />

                {/* ช่องกรอก สาขาวิชา */}
                <View style={styles.inputRow}>
                  <View style={styles.iconCircle}><Ionicons name="school-outline" size={18} color="#0052A2" /></View>
                  <View style={styles.inputFieldWrap}>
                    <Text style={styles.inputLabel}>สาขาวิชา</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="เทคโนโลยีสารสนเทศ" 
                      value={major} 
                      onChangeText={setMajor} 
                    />
                  </View>
                </View>

                <View style={styles.lineDivider} />

                {/* ช่องกรอก อีเมล */}
                <View style={styles.inputRow}>
                  <View style={styles.iconCircle}><Ionicons name="mail-outline" size={18} color="#0052A2" /></View>
                  <View style={styles.inputFieldWrap}>
                    <Text style={styles.inputLabel}>อีเมลสถาบัน</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="student@example.ac.th" 
                      value={email} 
                      onChangeText={setEmail} 
                      autoCapitalize="none" 
                      keyboardType="email-address" 
                    />
                  </View>
                </View>

                <View style={styles.lineDivider} />

                {/* ช่องกรอก รหัสผ่าน */}
                <View style={styles.inputRow}>
                  <View style={styles.iconCircle}><Ionicons name="lock-closed-outline" size={18} color="#0052A2" /></View>
                  <View style={styles.inputFieldWrap}>
                    <Text style={styles.inputLabel}>รหัสผ่าน</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="••••••••" 
                      secureTextEntry={!showPassword} 
                      value={password} 
                      onChangeText={setPassword} 
                    />
                  </View>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#A0AEC0" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ปุ่มสมัครสมาชิก */}
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleRegister} 
                disabled={loading}
              >
                <LinearGradient colors={['#0047AB', '#002D62']} style={styles.buttonGradient}>
                  <Text style={styles.loginButtonText}>
                    {loading ? 'กำลังประมวลผล...' : 'สมัครสมาชิก'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.socialDividerRow}>
                <View style={styles.smallLine} />
                <Text style={styles.socialDividerText}>หรือเชื่อมต่อด้วย</Text>
                <View style={styles.smallLine} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialCircle}><FontAwesome name="facebook" size={24} color="#1877F2" /></TouchableOpacity>
                <TouchableOpacity style={styles.socialCircle}><FontAwesome name="google" size={24} color="#EA4335" /></TouchableOpacity>
                <TouchableOpacity style={styles.socialCircle}><FontAwesome name="apple" size={26} color="#111111" /></TouchableOpacity>
              </View>

              <View style={styles.registerSection}>
                <Text style={styles.noAccountText}>มีบัญชีอยู่แล้ว?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.registerBtnAction}>
                  <Text style={styles.registerBtnText}>เข้าสู่ระบบ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  backgroundGradient: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  headerContainer: { alignItems: 'center', marginTop: 50, marginBottom: 20 },
  logoCircle: { 
    width: 110, height: 110, borderRadius: 55, backgroundColor: '#FFF', 
    justifyContent: 'center', alignItems: 'center', elevation: 8,
    borderWidth: 2, borderColor: '#D4AF37'
  },
  logoImage: { width: '80%', height: '80%', resizeMode: 'contain' },
  universityNameTh: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  universityNameEn: { color: '#FFF', fontSize: 12, opacity: 0.9 },
  card: { flex: 1, paddingHorizontal: 25, alignItems: 'center' },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginTop: 20 },
  cardSubtitle: { fontSize: 14, color: '#FFF', opacity: 0.8, marginBottom: 20 },
  inputContainer: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 5, elevation: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F5FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  inputFieldWrap: { flex: 1 },
  inputLabel: { fontSize: 11, color: '#718096', fontWeight: 'bold' },
  input: { fontSize: 15, color: '#2D3748', paddingVertical: 2 },
  lineDivider: { height: 1, backgroundColor: '#F0F4F8' },
  loginButton: { width: '100%', height: 55, borderRadius: 15, marginTop: 25, overflow: 'hidden', elevation: 5 },
  buttonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  socialDividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  smallLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  socialDividerText: { marginHorizontal: 15, color: '#FFF', fontSize: 12 },
  socialRow: { flexDirection: 'row', gap: 15 },
  socialCircle: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  registerSection: { marginTop: 30, alignItems: 'center' },
  noAccountText: { color: '#FFF', marginBottom: 10 },
  registerBtnAction: { backgroundColor: '#FFF', paddingHorizontal: 40, paddingVertical: 10, borderRadius: 20 },
  registerBtnText: { color: '#0052A2', fontWeight: 'bold' }
});

export default Register;