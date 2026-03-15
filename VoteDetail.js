import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
   View,
    Text,
    StyleSheet, 
    Image, 
    ScrollView,
  TouchableOpacity, 
  Platform, 
  StatusBar, 
  Modal, 
  Dimensions,
  ActivityIndicator, 
  Alert
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ แก้ Error รูปที่ 14: รวม Import ไว้ที่เดียว ไม่ประกาศซ้ำ
// ✅ แก้ Error รูปที่ 15: เพิ่ม runTransaction เข้าไปให้ระบบรู้จัก
import { getDatabase, ref, onValue, update, increment, runTransaction } from 'firebase/database';

import app from '../firebase';
import { useUserAuth } from '../context/UserAuthContext';

const { width } = Dimensions.get('window');

export default function VoteDetail({ navigation, route }) {
  const [choice, setChoice] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPoints, setModalPoints] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const modalTimeoutRef = useRef(null);

  // ✅ แก้ Error รูปที่ 13: ดึง user มาใช้เพื่อให้ handleVote รู้จัก user.uid
  const { user } = useUserAuth(); 
  const itemId = route?.params?.id;

  const isClosed = item?.isClosed === true; 
  const isActive = !isClosed;

  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!itemId) {
      setLoading(false);
      return;
    }
    const db = getDatabase(app);
    const itemRef = ref(db, `votes/${itemId}`);
    const unsub = onValue(itemRef, (snap) => {
      const data = snap.val();
      setItem(data || null);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsub();
  }, [itemId]);

  const handleVote = async () => {
    // ตรวจสอบเงื่อนไขก่อนโหวต
    if (!choice || !itemId || submitting || !user?.uid) {
      if(!user?.uid) Alert.alert("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อนร่วมโหวตนะครับ");
      return;
    }

    setSubmitting(true);
    try {
      const db = getDatabase(app);
      // 1. อัปเดตจำนวนโหวต
      const countRef = ref(db, `votes/${itemId}/votesCount`);
      await runTransaction(countRef, (current) => (current || 0) + 1);

      // 2. อัปเดตข้อมูลการโหวต (รวมการเช็คแบบเก่าและแบบรายบุคคลเข้าด้วยกัน)
      // ✅ อัปเดตสถานะรายบุคคลเพื่อให้หน้าประวัติขึ้นข้อมูล
      const updates = {};
      updates[`votes/${itemId}/votedUsers/${user.uid}`] = true;
      updates[`votes/${itemId}/votedChoice`] = choice;
      updates[`votes/${itemId}/updatedAt`] = Date.now();
      
      // 4. ✅ บันทึกลงใน 'user_history' (สำหรับหน้าประวัติโดยเฉพาะ)
      // การเก็บ title และ choice ไว้ที่นี่จะช่วยให้ประวัติไม่หายแม้โพลหลักจะถูกลบ
      updates[`user_history/${user.uid}/${itemId}`] = {
        title: item?.title || 'ไม่มีชื่อรายการ',
        choice: choice === 'join' ? 'เข้าร่วม' : 'ไม่เข้าร่วม',
        timestamp: Date.now(),
        voteId: itemId,
        image: item?.image || '' // เก็บรูปไว้แสดงในหน้าประวัติด้วย
      };

      // ยิงข้อมูลขึ้น Firebase พร้อมกันในทีเดียว
      await update(ref(db), updates);
    

      // 3. แสดง Modal และสุ่มแต้ม (ส่วนที่เหลือคงเดิม)
      const points = Math.floor(Math.random() * 5) + 1;
      setModalPoints(points);
      setModalVisible(true);

     modalTimeoutRef.current = setTimeout(() => {
        handleCloseModal();
      }, 2500);

    } catch (err) {
      console.error(err);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกการโหวตได้ โปรดลองอีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    setModalVisible(false);
    navigation.navigate('Vote');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0369A1" />
        <Text style={{ marginTop: 12, color: '#64748B' }}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <MaterialIcons name="chevron-left" size={32} color="#0369A1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>รายละเอียดการโหวต</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Vote')}>
            <MaterialIcons name="add-circle-outline" size={28} color="#0369A1" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: item?.image || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlBVI1budCZ-Aq2y-VvBboDocTHAilLCe9mQ&s' }}
          style={styles.bannerImage}
          resizeMode="cover"
        />

        <View style={styles.infoSection}>
          
          {/* --- [ส่วนที่เพิ่มใหม่] สถานะ Banner --- */}
          <View style={[styles.statusBanner, isClosed ? styles.bgRed : !isActive ? styles.bgOrange : styles.bgGreen]}>
            <Text style={styles.statusBannerText}>
              {isClosed ? '🚫 ปิดรับโหวตแล้ว' : !isActive ? '⏳ รอโหวต' : '✅ กำลังเปิดให้ลงคะแนน'}
            </Text>
          </View>

          <Text style={styles.titleText}>{item?.title || 'โครงการโหวต'}</Text>
          
          <View style={styles.dateBadge}>
            <MaterialIcons name="event" size={16} color="#64748B" />
            <Text style={styles.dateText}>{item?.date || 'ไม่มีระบุวันที่'}</Text>
          </View>
          
          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>รายละเอียดโครงการ</Text>
          <Text style={styles.descriptionText}>{item?.description}</Text>

          {/* ปิดการเลือกหากโหวตไม่ได้ */}
          {isActive && !isClosed && (
            <>
              <Text style={[styles.sectionHeading, { marginTop: 24 }]}>คุณต้องการเข้าร่วมการโหวตนี้หรือไม่?</Text>
              <View style={styles.optionsGroup}>
                <TouchableOpacity 
                  style={[styles.optionItem, choice === 'join' && styles.optionItemSelected]} 
                  onPress={() => setChoice('join')}
                >
                  <Ionicons name={choice === 'join' ? "radio-button-on" : "radio-button-off"} size={22} color={choice === 'join' ? "#0369A1" : "#94A3B8"} />
                  <Text style={[styles.optionLabel, choice === 'join' && styles.optionLabelActive]}>เข้าร่วม</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.optionItem, choice === 'not' && styles.optionItemSelected]} 
                  onPress={() => setChoice('not')}
                >
                  <Ionicons name={choice === 'not' ? "radio-button-on" : "radio-button-off"} size={22} color={choice === 'not' ? "#0369A1" : "#94A3B8"} />
                  <Text style={[styles.optionLabel, choice === 'not' && styles.optionLabelActive]}>ไม่เข้าร่วม</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer ปุ่มกดยืนยัน */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          onPress={handleVote} 
          disabled={!choice || submitting || !isActive || isClosed}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={choice && isActive && !isClosed ? ['#0EA5E9', '#0369A1'] : ['#E2E8F0', '#CBD5E1']}
            style={styles.mainVoteBtn}
          >
            <Text style={[styles.mainVoteBtnText, (!choice || !isActive) && { color: '#94A3B8' }]}>
              {isClosed ? 'ปิดรับโหวตแล้ว' : 'ยืนยันการโหวต'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modal Success (คงเดิม) */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.successCard}>
            <View style={styles.iconCircle}><MaterialIcons name="check" size={40} color="#FFF" /></View>
            <Text style={styles.successTitle}>Congrats!</Text>
            <Text style={styles.successSubtitle}>บันทึกการโหวตเรียบร้อยแล้ว</Text>
            <View style={styles.pointTag}><Text style={styles.pointTagText}>ได้รับ +{modalPoints} แต้ม</Text></View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSafe: { backgroundColor: '#FFF' },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerBtn: { width: 44, alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#1E293B' },
  scrollContent: { paddingBottom: 120 },
  bannerImage: { width: width, height: 240 },
  infoSection: { padding: 20, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24 },
  
  // --- [เพิ่มใหม่] Styles สำหรับ Banner ---
  statusBanner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  bgRed: { backgroundColor: '#EF4444' },
  bgOrange: { backgroundColor: '#F59E0B' },
  bgGreen: { backgroundColor: '#10B981' },

  titleText: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateText: { fontSize: 13, color: '#64748B', marginLeft: 6 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 10 },
  descriptionText: { fontSize: 15, color: '#475569', lineHeight: 24 },
  optionsGroup: { marginTop: 8 },
  optionItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  optionItemSelected: { borderColor: '#0EA5E9', backgroundColor: '#F0F9FF' },
  optionLabel: { marginLeft: 12, fontSize: 16, color: '#64748B' },
  optionLabelActive: { color: '#0369A1', fontWeight: '700' },
  footerContainer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  mainVoteBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  mainVoteBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
  successCard: { width: width * 0.8, backgroundColor: '#FFF', borderRadius: 24, padding: 30, alignItems: 'center' },
  iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '800' },
  successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8 },
  pointTag: { backgroundColor: '#F59E0B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 16 },
  pointTagText: { color: '#FFF', fontWeight: '700' },
});