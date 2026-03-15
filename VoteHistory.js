import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useUserAuth } from '../context/UserAuthContext';

// ฟังก์ชันจัดรูปแบบวันที่ให้สวยงาม
function formatDateTime(timestamp) {
  if (!timestamp) return '-';
  try {
    return new Date(timestamp).toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' น.';
  } catch (error) {
    return '-';
  }
}

export default function VoteHistoryScreen({ navigation }) {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, role } = useUserAuth(); // ดึง User มาจาก Context โดยตรง

  useEffect(() => {
    let unsubVotes = null;

    if (!user) {
      setHistoryList([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // ✅ ดึงข้อมูลจากก้อน 'votes' หลัก
      const votesRef = ref(db, 'votes');

      unsubVotes = onValue(votesRef, (snapshot) => {
        const data = snapshot.val() || {};
        
        // ✅ กรองเฉพาะรายการที่ 'votedUsers' มี ID ของเราอยู่จริง
        const allVotes = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          const filteredList = allVotes.filter((item) => {
            if (role === 'admin') {
              // Admin: เห็นทุกรายการที่มีคนโหวตแล้วอย่างน้อย 1 คน
          return item.votedUsers && Object.keys(item.votedUsers).length > 0;
        } else {
          // User: เห็นเฉพาะรายการที่ตัวเองโหวต
          return item.votedUsers && user?.uid && item.votedUsers[user.uid];
        }
      });

        // เรียงลำดับตามเวลาล่าสุด (ใช้ updatedAt หรือ createdAt)
        filteredList.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        
        setHistoryList(filteredList);
        setLoading(false);
    }, (error) => {
        console.log('Firebase Error:', error);
        setLoading(false);
      });
    } catch (err) {
      console.log('Setup Error:', err);
      setLoading(false);
    }

    // ✅ Cleanup ฟังก์ชันเพื่อป้องกัน Memory Leak
    return () => {
      if (unsubVotes) unsubVotes();
    };
 }, [user, role]); // ใส่ role ใน dependency ด้วยเพื่อให้ทำงานถูกต้องเมื่อเปลี่ยนสิทธิ์

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardAccent} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="how-to-vote" size={20} color="#0284C7" />
          </View>
          <Text style={styles.title} numberOfLines={1}>{item.title || 'ไม่มีชื่อรายการ'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="checkbox-outline" size={14} color="#64748B" />
            <Text style={styles.infoText}>เลือก: <Text style={styles.boldText}>
              {item.votedChoice === 'join' ? 'เข้าร่วม' : 'ไม่เข้าร่วม'}
            </Text></Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>โหวตแล้ว</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <Ionicons name="time-outline" size={14} color="#94A3B8" />
          <Text style={styles.dateText}>{formatDateTime(item.updatedAt || item.createdAt)}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>กำลังดึงประวัติการโหวต...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#F0F9FF', '#E0F2FE', '#DBEAFE']} style={styles.fullBg}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ประวัติการโหวต</Text>
            <View style={{ width: 40 }} />
          </View>

          <FlatList
            data={historyList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <View style={styles.emptyIconCircle}>
                  <MaterialIcons
                    name={user ? 'history-toggle-off' : 'lock-person'}
                    size={48}
                    color="#CBD5E1"
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {user ? 'ไม่พบประวัติการโหวต' : 'ต้องเข้าสู่ระบบ'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {user
                    ? 'รายการที่คุณเคยโหวตจะปรากฏที่นี่\nเริ่มสร้างความเปลี่ยนแปลงด้วยการโหวตกัน!'
                    : 'กรุณาเข้าสู่ระบบเพื่อตรวจสอบ\nประวัติการโหวตส่วนตัวของคุณ'}
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

// ... ส่วน styles คงเดิม (ข้ามเพื่อความกระชับ) ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullBg: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    elevation: 4,
    shadowColor: '#0284C7',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardAccent: {
    width: 6,
    backgroundColor: '#0284C7',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  statusPill: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  emptyBox: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});