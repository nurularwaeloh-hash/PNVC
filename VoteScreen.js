import React, { useEffect, useState } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDatabase, ref, onValue, push, update, remove } from 'firebase/database';
import app from '../firebase';

const { width } = Dimensions.get('window');

export default function VoteScreen({ navigation }) { // 1. State ต่างๆ // 2. useEffect ดึงข้อมูล  // 3. ฟังก์ชัน handle ต่างๆ (Save, Edit, Delete)
  const [votes, setVotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  // ดึงค่า role จาก Context
  const { role } = useUserAuth();
  // 2. ดึง user ออกมาจาก Context
  const { user } = useUserAuth();

  // 1. เพิ่ม State สำหรับสถานะใน Modal
  const [statusInput, setStatusInput] = useState('waiting'); 
  const [filterTab, setFilterTab] = useState('all'); 

  const db = getDatabase(app);
  const votesRef = ref(db, 'votes');

  useEffect(() => {
    const unsub = onValue(votesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setVotes(list);
    });
    return () => unsub();
  }, []);

  // 4. คำนวณ filteredVotes สำหรับแสดงผลใน List
  const filteredVotes = votes.filter((item) => {
    const iVoted = item.votedUsers && user?.uid && item.votedUsers[user.uid];
    const hasAnyVote = item.votedUsers && Object.keys(item.votedUsers).length > 0;
    // 1. ถ้าอยู่แท็บ "โหวตแล้ว" -> ให้เช็คแค่ว่าเคยโหวตหรือยัง (isVoted: true ใน Firebase)
    if (filterTab === 'voted') {
    return role === 'admin' ? hasAnyVote : iVoted;
    }
    // 2. ถ้าอยู่แท็บ "รอโหวต" -> ต้องมีสถานะเป็น waiting และ "ยังไม่เคยโหวต"
    if (filterTab === 'waiting') {
    return item.status === 'waiting' && !iVoted; // แสดงเฉพาะที่ยังไม่โหวตและสถานะยังเปิด
  }

    // 3. แท็บ "ทั้งหมด" -> แสดงทุกรายการ
    if (filterTab === 'all') {
      return true;
    }

    return true;
  });
  
  const openAdd = () => {
    setEditingItem(null);
    setTitleInput('');
    setDateInput('');
    setDescriptionInput('');
    setStatusInput('waiting'); // Reset เป็นรอโหวต
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setTitleInput(item.title || '');
    setDateInput(item.date || '');
    setDescriptionInput(item.description || '');
    setStatusInput(item.status || 'waiting'); // ดึงค่าเดิมมาแสดง
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!titleInput.trim()) return Alert.alert('ข้อผิดพลาด', 'กรุณาใส่ชื่อรายการ');
    try {
      const payload = { 
        title: titleInput.trim(), 
        date: dateInput.trim(), 
        description: descriptionInput.trim() || '', 
        image: imageInput.trim() || '', 
        status: statusInput, // บันทึกสถานะที่เลือก
        isClosed: statusInput === 'closed',
        isVoted: editingItem ? (editingItem.isVoted || false) : false,
        createdAt: editingItem ? editingItem.createdAt : Date.now(),
        updatedAt: Date.now(),
      };

      if (editingItem) {
        await update(ref(db, `votes/${editingItem.id}`), payload);
      } else {
        await push(votesRef, payload);
      }
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // 6. renderItem สำหรับ Card (ไม่ต้องคำนวณจำนวนในนี้)
  const renderItem = ({ item }) => {
  // ✅ สร้างตัวแปรเช็คว่า "เรา" โหวตหรือยัง
 const hasVoted = item.votedUsers && user?.uid && item.votedUsers[user.uid];

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('VoteDetail', { id: item.id })}
        style={styles.cardTouchable}
      >
        {/* Banner แสดงสถานะโครงการ (แอดมินเป็นคนกำหนด) */}
        <View style={[
            styles.statusBanner, 
            item.status === 'closed' ? styles.bgRed : item.status === 'active' ? styles.bgGreen : styles.bgOrange
        ]}>
          <Text style={styles.statusBannerText}>
              {item.status === 'closed' ? '🚫 ปิดรับโหวตแล้ว' : item.status === 'active' ? '✅ กำลังเปิดให้ลงคะแนน' : '⏳ รอโหวต'}
            </Text>
          </View>

       <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
              <MaterialIcons name="how-to-vote" size={24} color="#0284C7" />
          </View>

        {/* ✅ แสดงป้ายตามสถานะการโหวตของ "เรา" เท่านั้น */}
            <View style={[styles.statusBadge, 
              { backgroundColor: hasVoted ? '#64748B' : '#10B981' }
            ]}>
              <Text style={styles.statusText}>
                {hasVoted ? 'โหวตแล้ว' : 'เปิดโหวต'}
              </Text>
            </View>
          </View>

        {/* อย่าลืมใส่ส่วน Title และ Date ที่หายไปจากโค้ดที่คุณส่งมาด้วยนะครับ */}
          <View style={styles.cardBody}>
            <Text style={styles.listTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.listDate}>{item.date || 'ไม่มีกำหนดวันที่'}</Text>
            </View>
          </View>
        </TouchableOpacity>
      
      {/* --- ส่วนที่ 2: แสดงแถบ แก้ไข/ลบ เฉพาะ Admin --- */}
      {role === 'admin' && (
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.footerAction} onPress={() => openEdit(item)}>
            <MaterialIcons name="edit" size={18} color="#0369A1" />
            <Text style={styles.footerActionText}>แก้ไข</Text>
          </TouchableOpacity>
          
          <View style={styles.footerDivider} />
          
          <TouchableOpacity style={styles.footerAction} onPress={() => handleDelete(item.id)}>
            <MaterialIcons name="delete-outline" size={18} color="#E11D48" />
            <Text style={[styles.footerActionText, { color: '#E11D48' }]}>ลบ</Text>
          </TouchableOpacity>
        </View>
      )}
    </View> // <--- ปิดตัวแปร styles.card ตรงนี้ (นอกเงื่อนไข role)
 );
};

  const handleDelete = (id) => {
    const processDelete = async () => {
      try { await remove(ref(db, `votes/${id}`)); } catch (err) { Alert.alert('Error', err.message); }
    };
    if (Platform.OS === 'web') {
      if (confirm('ต้องการลบรายการนี้หรือไม่?')) processDelete();
    } else {
      Alert.alert('ลบรายการ', 'ข้อมูลจะถูกลบถาวร ต้องการดำเนินการต่อหรือไม่?', [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ลบ', style: 'destructive', onPress: processDelete },
      ]);
    }
  };

  // 5. ✅ คำนวณจำนวนโหวต (วางตรงนี้!)
  const votedCount = votes.filter(item =>{
    if (role === 'admin') {
      // แอดมิน: นับรายการที่มีคนโหวตเข้ามาแล้วอย่างน้อย 1 คน
      return item.votedUsers && Object.keys(item.votedUsers).length > 0;
    } else {
      // ยูสเซอร์: นับเฉพาะที่ตัวเองโหวต
      return item.votedUsers && user?.uid && item.votedUsers[user.uid];
    }
  }).length;

  const waitingCount = votes.filter(item => {
    const iVoted = item.votedUsers && user?.uid && item.votedUsers[user.uid];
    return item.status === 'waiting' && !iVoted;
  }).length;

  // 7. return หน้าจอหลัก
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FFFFFF', '#F0F9FF']} style={styles.headerGradient}>
        <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
              <MaterialIcons name="chevron-left" size={32} color="#0369A1" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>โพลโหวตทั้งหมด</Text>
            {/* --- ใช้เงื่อนไขเลือกแสดงปุ่ม --- */}
            {role === 'admin' ? (
              <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
                <MaterialIcons name="add" size={28} color="#FFF" />
                </TouchableOpacity>
                ) : (
                  /* ฝั่ง User ใส่ View เปล่าเพื่อรักษา Layout */
                  <View style={{ width: 44 }} />
                  )}
                  </View>

          <View style={styles.filterRow}>
            {['all', 'waiting', 'voted'].map((t) => (
              <TouchableOpacity
              key={t}
              style={[styles.filterBtn, filterTab === t && styles.filterBtnActive]}
              onPress={() => setFilterTab(t)}
              >
                <Text style={[styles.filterText, filterTab === t && styles.filterTextActive]}>
                  {/* เงื่อนไขแสดงชื่อพร้อมจำนวนตัวเลข */}
                  {t === 'all' ? 'ทั้งหมด' : 
                  t === 'waiting' ? `รอโหวต (${waitingCount})` : 
                  `โหวตแล้ว (${votedCount})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        data={filteredVotes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>ไม่พบรายการโหวต</Text>
          </View>
        }
      />

      {/* MODAL สำหรับสร้าง/แก้ไข */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeaderTitle}>{editingItem ? 'แก้ไขโหวต' : 'สร้างรายการโหวตใหม่'}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>หัวข้อการโหวต</Text>
              <TextInput style={styles.input} value={titleInput} onChangeText={setTitleInput} placeholder="ระบุหัวข้อ..." />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ช่วงเวลา (เช่น 01-30 มี.ค.)</Text>
              <TextInput style={styles.input} value={dateInput} onChangeText={setDateInput} placeholder="ระบุวันที่..." />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>คำอธิบายเพิ่มเติม</Text>
              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={descriptionInput} onChangeText={setDescriptionInput} multiline placeholder="รายละเอียด..." />
            </View>

            {/* แถบเลือกสถานะที่เพิ่มใหม่ */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>สถานะการโหวต</Text>
              <View style={styles.statusPicker}>
                <TouchableOpacity 
                  style={[styles.statusOption, statusInput === 'waiting' && styles.statusActiveWaiting]} 
                  onPress={() => setStatusInput('waiting')}
                >
                  <Text style={[styles.statusOptionText, statusInput === 'waiting' && styles.textWhite]}>รอโหวต</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.statusOption, statusInput === 'active' && styles.statusActiveOpen]} 
                  onPress={() => setStatusInput('active')}
                >
                  <Text style={[styles.statusOptionText, statusInput === 'active' && styles.textWhite]}>เปิดโหวต</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.statusOption, statusInput === 'closed' && styles.statusActiveClosed]} 
                  onPress={() => setStatusInput('closed')}
                >
                  <Text style={[styles.statusOptionText, statusInput === 'closed' && styles.textWhite]}>สิ้นสุด</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
                <Text style={styles.btnSaveText}>บันทึกข้อมูล</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: { borderBottomWidth: 1, borderColor: '#E2E8F0' },
  header: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  headerBtn: { width: 44, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0C4A6E' },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#0284C7', justifyContent: 'center', alignItems: 'center' },
  
  filterRow: { 
    flexDirection: 'row', 
    paddingVertical: 12, 
    // แก้ไข: จัดปุ่มให้อยู่ตรงกลางหน้าจอ
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 12, // เพิ่มระยะห่างระหว่างปุ่มให้เท่ากัน
    width: '100%', // ให้แถบเมนูเต็มความกว้าง
  },
  filterBtn: { 
    // แก้ไข: ปรับขนาดปุ่มให้สมดุล (สามารถระบุความกว้างขั้นต่ำได้)
    minWidth: 90, 
    paddingVertical: 10, 
    paddingHorizontal: 16,
    borderRadius: 25, // ทำให้โค้งมนสวยงาม
    backgroundColor: '#F1F5F9', // สีพื้นหลังปุ่มที่ไม่ได้เลือก
    alignItems: 'center',
    justifyContent: 'center',
    // เพิ่ม: เงาบางๆ ให้ปุ่มดูเริ่ดขึ้น
    elevation: 2, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterBtnActive: { 
    backgroundColor: '#0284C7', // สีปุ่มที่เลือก
    elevation: 4, // เงาชัดขึ้นเมื่อเลือก
  },
  filterText: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#64748B' 
  },
  filterTextActive: { 
    color: '#FFF' 
  },
  
  listContent: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 16, elevation: 4, overflow: 'hidden' },
  cardTouchable: { padding: 16 },
  statusBanner: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginBottom: 10 },
  statusBannerText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  bgRed: { backgroundColor: '#EF4444' },
  bgOrange: { backgroundColor: '#F59E0B' },
  bgGreen: { backgroundColor: '#10B981' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  listDate: { marginLeft: 6, fontSize: 12, color: '#64748B' },
  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#F1F5F9', padding: 12 },
  footerAction: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerActionText: { marginLeft: 6, fontSize: 14, fontWeight: '700', color: '#0369A1' },
  footerDivider: { width: 1, height: '60%', backgroundColor: '#E2E8F0', alignSelf: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '90%', backgroundColor: '#FFF', borderRadius: 24, padding: 24 },
  modalHeaderTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12 },
  statusPicker: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4 },
  statusOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  statusOptionText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  statusActiveWaiting: { backgroundColor: '#F59E0B' },
  statusActiveOpen: { backgroundColor: '#10B981' },
  statusActiveClosed: { backgroundColor: '#EF4444' },
  textWhite: { color: '#FFF' },
  modalActions: { flexDirection: 'row', marginTop: 20, gap: 12 },
  btnCancel: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  btnCancelText: { color: '#64748B', fontWeight: '700' },
  btnSave: { flex: 2, backgroundColor: '#0284C7', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnSaveText: { color: '#FFF', fontWeight: '800' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 10, color: '#94A3B8' }
});