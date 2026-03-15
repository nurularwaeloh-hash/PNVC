import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Platform,
  TextInput // ✅ นำเข้า TextInput
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDatabase, ref, onValue } from 'firebase/database';
import app from '../firebase';

export default function MemberScreen({ navigation }) {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]); // ✅ State สำหรับข้อมูลที่กรองแล้ว
  const [searchQuery, setSearchQuery] = useState(''); // ✅ State สำหรับคำค้นหา
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const usersRef = ref(db, 'users');

    const unsub = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const memberList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setMembers(memberList);
        setFilteredMembers(memberList); // ตั้งค่าเริ่มต้นให้เหมือนกัน
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ✅ ฟังก์ชันสำหรับจัดการการค้นหา
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter((item) => {
        const itemData = item.displayName ? item.displayName.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredMembers(filtered);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <Image
          source={item.photoURL ? { uri: item.photoURL } : require('../assets/pnvc.png')}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.nameText}>{item.displayName || 'ไม่มีชื่อ'}</Text>
          <Text style={styles.emailText}>{item.email}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#E0F2FE', '#F8FAFC']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สมาชิกทั้งหมด</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* ✅ Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={22} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาชื่อสมาชิก..."
            value={searchQuery}
            onChangeText={handleSearch}
            clearButtonMode="always"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <MaterialIcons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color="#0284C7" />
        </View>
      ) : (
        <FlatList
          data={filteredMembers} // ✅ ใช้ข้อมูลที่กรองแล้วมาแสดง
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <MaterialIcons name="person-search" size={60} color="#CBD5E1" />
               <Text style={styles.emptyText}>ไม่พบรายชื่อที่ค้นหา</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0C4A6E' },
  
  // ✅ Search Bar Styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#0F172A',
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#F1F5F9' },
  info: { flex: 1, marginLeft: 15 },
  nameText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  emailText: { fontSize: 13, color: '#64748B', marginTop: 2 },
  loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 10, color: '#94A3B8', fontSize: 16 }
});