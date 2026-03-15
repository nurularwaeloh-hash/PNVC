import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ImageBackground,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserAuth } from '../context/UserAuthContext'; // นำเข้า Auth
import { getDatabase, ref, onValue } from 'firebase/database'; // นำเข้า Firebase
import app from '../firebase';
import { getAuth } from "firebase/auth";

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [votesCount, setVotesCount] = useState(0);
  const { logOut, user, role } = useUserAuth();

  // เพิ่ม useEffect อีกตัวหนึ่งเพื่อเฝ้าสังเกตการเปลี่ยนแปลงของ user
useEffect(() => {
  console.log("User profile updated:", user?.displayName);
}, [user]); // ✅ ใส่ user ไว้ใน Dependency Array ตรงนี้

  // --- LOGIC: ดึงข้อมูล Real-time จาก Firebase ---
  useEffect(() => {
    const db = getDatabase(app);
    const votesRef = ref(db, 'votes');
    const unsub = onValue(votesRef, (snap) => {
      const data = snap.val() || {};
      const count = Object.keys(data).reduce((sum, k) => {
        const v = data[k];
        return sum + (v && v.votesCount ? Number(v.votesCount) : 0);
      }, 0);
      setVotesCount(count);
    });
    return () => unsub();
  }, []);

  // --- LOGIC: จัดการการออกจากระบบ ---
  const handleLogout = async () => {
    try {
      await logOut();
      let rootNav = navigation;
      while (rootNav && rootNav.getParent && rootNav.getParent() != null) {
        rootNav = rootNav.getParent();
      }
      if (rootNav && rootNav.reset) {
        rootNav.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        navigation.navigate('Login');
      }
    } catch (err) {
      Alert.alert('Error', 'ไม่สามารถออกจากระบบได้');
    }
  };

  // ✅ 3. ฟังก์ชันอัปเดตรูปโปรไฟล์ (รวมเป็นหนึ่งเดียว)
  const handleUpdateAvatar = () => {
    const auth = getAuth(); // เรียกใช้ auth ภายในฟังก์ชัน
    const newImageUrl = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

    if (auth.currentUser) {
      updateProfile(auth.currentUser, {
        photoURL: newImageUrl 
      }).then(() => {
        Alert.alert("สำเร็จ", "อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว! (หากรูปไม่เปลี่ยนทันที ให้ลอง Re-login ครับ)");
      }).catch((error) => {
        console.error(error);
        Alert.alert("ผิดพลาด", "ไม่สามารถอัปเดตรูปได้");
      });
    }
  };

  const iconMap = {
    Fill: 'edit-note',
    Vote: 'how-to-vote',
    Redeem: 'card-giftcard',
    'My Calendar': 'calendar-today',
    Place: 'map',
    Reservation: 'confirmation-number',
  };

  const services = ['Fill', 'Vote', 'Redeem', 'My Calendar', 'Place', 'Reservation'];

  return (
    <View style={{ flex: 1 }}>
      {/* พื้นหลังไล่เฉดสีฟ้า-ขาว แบบพรีเมียม */}
      <LinearGradient colors={['#E0F2FE', '#FFFFFF', '#F8FAFC']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        
        {/* --- 1. HEADER SECTION (แสดงชื่อและรูปจาก Firebase Auth) --- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* เพิ่ม TouchableOpacity ครอบรูปเพื่อใช้กดเปลี่ยนรูป */}
            <TouchableOpacity 
              style={styles.avatarContainer} 
              onPress={() => navigation.navigate('EditProfile')} // ตรวจสอบว่าใน App.js ตั้งชื่อหน้าว่า 'EditProfile'
            >
            <Image
              source={
                user && user.photoURL 
                ? { 
                   uri: user.photoURL, 
                   // 💡 เพิ่ม headers เพื่อช่วยให้โหลดรูปจาก Firebase ได้เสถียรขึ้น
                   cache: 'reload' 
                  } 
                  : require('../assets/pnvc.png') // รูปสำรองกรณีไม่มีรูป
              }
              style={styles.avatar}
              // 💡 เพิ่มฟังก์ชันตรวจสอบกรณีโหลดรูปไม่สำเร็จ
              onError={(e) => console.log("Image Load Error:", e.nativeEvent.error)}
            />

              <View style={styles.onlineStatus} />
            </TouchableOpacity>
            
            <View style={styles.welcomeTextGroup}>
              <Text style={styles.greeting}>ยินดีต้อนรับ</Text>
              <Text style={styles.userName}>{user?.displayName || 'ชื่อผู้ใช้งาน'}</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialIcons name="search" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialIcons name="notifications-none" size={20} color="#333" />
            </TouchableOpacity>
            {user ? (
              <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
                <MaterialIcons name="logout" size={20} color="#333" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          {/* --- 2. WHAT'S NEW SECTION --- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What's New</Text>
            <TouchableOpacity><Text style={styles.seeAll}>ดูทั้งหมด</Text></TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
            {/* Card 1 */}
            <TouchableOpacity activeOpacity={0.9}>
              <ImageBackground
                source={{ uri: 'https://pnvc.ac.th/wp-content/uploads/2025/12/592746629_1426705259250855_5968776154349011979_n-1024x401.png' }}
                style={styles.cardLarge}
                imageStyle={{ borderRadius: 30 }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(2, 132, 199, 0.8)']}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.glassLabel}>
                      <Text style={styles.cardTagText}>อัปเดตใหม่</Text>
                    </View>
                    <Text style={styles.cardMainText}>รับสมัครนักเรียนนักศึกษาวิทยาลัยอาชีวศึกษาปัตตานีปีการศึกษา 2569</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>

            {/* Card 2 */}
            <TouchableOpacity activeOpacity={0.9}>
              <ImageBackground
                source={{ uri: 'https://pnvc.ac.th/wp-content/uploads/2024/11/466468628_1126237532630964_5518094199994692633_n.jpg' }}
                style={styles.cardLarge}
                imageStyle={{ borderRadius: 30 }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(3, 105, 161, 0.8)']}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.glassLabel}>
                      <Text style={styles.cardTagText}>ใหม่</Text>
                    </View>
                    <Text style={styles.cardMainText}>จบแล้วต่อที่ไหนดี..</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>

            {/* Card 3 */}
            <TouchableOpacity activeOpacity={0.9}>
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=500' }}
                style={styles.cardLarge}
                imageStyle={{ borderRadius: 30 }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(3, 105, 161, 0.8)']}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.glassLabel}>
                      <Text style={styles.cardTagText}>กิจกรรม</Text>
                    </View>
                    <Text style={styles.cardMainText}>ร่วมโหวตกิจกรรมชุมชนประจำปี 2026</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>

          </ScrollView>

          {/* --- 3. SERVICES GRID --- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>บริการของเรา</Text>
          </View>

          <View style={styles.servicesGrid}>
            {services.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.serviceItem}
                activeOpacity={0.6}
                onPress={() => item === 'Vote' && navigation.navigate('Vote')}
              >
                <View style={styles.serviceIconWrapper}>
                  <LinearGradient colors={['#FFFFFF', '#F0F9FF']} style={styles.serviceIconGradient}>
                    <MaterialIcons name={iconMap[item]} size={32} color="#0284C7" />
                  </LinearGradient>
                </View>
                <Text style={styles.serviceText}>{item}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.serviceItem} 
              onPress={() => navigation.navigate('VoteHistory')}
            >
              <View style={styles.serviceIconWrapper}>
                <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.serviceIconGradient}>
                  <MaterialIcons name="history" size={32} color="#FFF" />
                </LinearGradient>
              </View>
              <Text style={styles.serviceText}>ประวัติ</Text>
            </TouchableOpacity>

            {/* --- ปุ่มรายชื่อสมาชิก --- */}
            <TouchableOpacity 
            style={styles.serviceItem} 
            onPress={() => navigation.navigate('Member')} // ✅ คำสั่งนำทางไปหน้า Member
            >
              <View style={styles.serviceIconWrapper}>
                <LinearGradient colors={['#FACC15', '#EAB308']} style={styles.serviceIconGradient}>
                  <MaterialIcons name="groups" size={32} color="#FFF" />
                </LinearGradient>
              </View>
              <Text style={styles.serviceText}>สมาชิก</Text>
             </TouchableOpacity>
          
            {role === 'admin' && (
              <TouchableOpacity 
                style={styles.serviceItem} 
                onPress={() => navigation.navigate('VoteScreen')}
              >
                <View style={styles.serviceIconWrapper}>
                  <LinearGradient colors={['#F43F5E', '#E11D48']} style={styles.serviceIconGradient}>
                    <MaterialIcons name="admin-panel-settings" size={32} color="#FFF" />
                  </LinearGradient>
                </View>
                <Text style={[styles.serviceText, { color: '#E11D48' }]}>จัดการระบบ</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* --- 4. APPOINTMENT SECTION --- */}
          <Text style={styles.sectionTitle}>การนัดหมาย</Text>
          <TouchableOpacity 
            style={styles.appointmentCard} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Reservation')}
          >
            <LinearGradient colors={['#F0F9FF', '#E0F2FE']} style={styles.iconCircle}>
              <MaterialIcons name="event-available" size={28} color="#0284C7" />
            </LinearGradient>
            
            <View style={styles.appointTextContainer}>
              <Text style={styles.appointTitle}>ไม่มีนัดหมายในวันนี้</Text>
              <Text style={styles.appointSubtitle}>แตะเพื่อสร้างนัดหมายใหม่</Text>
            </View>
            <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.addIconSmall}>
              <MaterialIcons name="add" size={22} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* --- 5. VOTE STATISTICS --- */}
          <View style={styles.voteStatCard}>
            <Text style={styles.voteStatTitle}>จำนวนโหวตทั้งหมด</Text>
            <Text style={styles.voteStatCount}>{votesCount.toLocaleString()}</Text>
            <TouchableOpacity 
                style={styles.voteStatBtn} 
                onPress={() => navigation.navigate('Vote')}
            >
              <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.voteBtnGradient}>
                <Text style={styles.voteStatBtnText}>ดูรายการโหวต</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { height: 90, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 54, height: 54, borderRadius: 15, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#BAE6FD' },
  onlineStatus: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 3, borderColor: '#E0F2FE' },
  welcomeTextGroup: { marginLeft: 14, flex: 1 },
  greeting: { fontSize: 13, color: '#0369A1', fontWeight: '500' },
  userName: { fontSize: 18, fontWeight: '800', color: '#0C4A6E' },
  headerRight: { flexDirection: 'row' },
  iconBtn: { 
    width: 46, height: 46, borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.7)', marginLeft: 12, 
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0F2FE',
    elevation: 3, shadowColor: '#0284C7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  content: { paddingHorizontal: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0C4A6E' },
  seeAll: { color: '#0284C7', fontWeight: '700', fontSize: 14 },
  carousel: { marginHorizontal: -24, paddingLeft: 24 },
  cardLarge: { width: width * 0.8, height: 180, marginRight: 16, overflow: 'hidden', elevation: 8, shadowColor: '#0284C7', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
  cardGradient: { flex: 1, padding: 24, justifyContent: 'flex-end' },
  glassLabel: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 8 },
  cardTagText: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  cardMainText: { color: '#FFF', fontSize: 18, fontWeight: '700', lineHeight: 24 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceItem: { width: '30%', alignItems: 'center', marginBottom: 24 },
  serviceIconWrapper: { width: 68, height: 68, borderRadius: 24, overflow: 'hidden', elevation: 5, shadowColor: '#0284C7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 10 },
  serviceIconGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  serviceText: { marginTop: 10, fontSize: 13, fontWeight: '700', color: '#0369A1' },
  appointmentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 28, marginTop: 4, borderWidth: 1, borderColor: '#E0F2FE' },
  iconCircle: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  appointTextContainer: { flex: 1, marginLeft: 16 },
  appointTitle: { fontSize: 16, fontWeight: '700', color: '#0C4A6E' },
  appointSubtitle: { fontSize: 13, color: '#0EA5E9', marginTop: 2 },
  addIconSmall: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  
  // Vote Stat Card
  voteStatCard: { backgroundColor: '#FFF', padding: 24, borderRadius: 28, marginTop: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E0F2FE', elevation: 4 },
  voteStatTitle: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  voteStatCount: { fontSize: 42, fontWeight: '800', color: '#0F172A', marginVertical: 12 },
  voteStatBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  voteBtnGradient: { paddingVertical: 12, alignItems: 'center' },
  voteStatBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});