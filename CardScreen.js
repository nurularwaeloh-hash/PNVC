import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, off } from "firebase/database"; // เพิ่ม off เพื่อเคลียร์ listener
import QRCode from "react-native-qrcode-svg";
import * as MediaLibrary from "expo-media-library";
import ViewShot from "react-native-view-shot";
import { auth, db } from "../firebase";

const { width } = Dimensions.get("window");

const DEFAULT_USER = {
  name: "ชื่อ - นามสกุล",
  nameEn: "Student Name",
  studentId: "00000000000",
  citizenId: "x xxxx xxxxx xx x",
  major: "สาขาวิชา",
  status: "กำลังศึกษา",
  photo: "https://via.placeholder.com/150",
  directorName: "นายวิทยา ตันยืนยง",
};

export default function CardScreen() {
  const [userData, setUserData] = useState(DEFAULT_USER);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [saving, setSaving] = useState(false);

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const viewShotRef = useRef(null);

  useEffect(() => {
    let userRef = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        userRef = ref(db, `user/${user.uid}`);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUserData((prev) => ({
              ...prev,
              ...data,
              studentId: String(data.studentId || prev.studentId),
            }));
          }
          setLoading(false);
        }, (error) => {
          console.error("Database Error:", error);
          setLoading(false);
        });

        return () => {
          if (userRef) off(userRef);
        };
      } else {
        setUserData(DEFAULT_USER);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const flipCard = () => {
    const toValue = flipped ? 0 : 180;
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const saveCardAsImage = async () => {
    if (saving) return;
    
    try {
      // ตรวจสอบความพร้อมของ Ref และ ข้อมูล
      if (!viewShotRef.current) {
        throw new Error("ViewShot ref is not ready");
      }

      setSaving(true);
      
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "กรุณาอนุญาตให้เข้าถึงคลังภาพ");
        setSaving(false);
        return;
      }

      // บันทึกภาพ
      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      
      Alert.alert("สำเร็จ", "บันทึกรูปบัตรเรียบร้อยแล้ว ✨");
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", "เกิดข้อผิดพลาดในการบันทึกภาพ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a5276" />
        <Text style={{ marginTop: 10 }}>กำลังดึงข้อมูลจากระบบ...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.navBar}>
        <Ionicons name="chevron-back" size={24} color="white" />
        <View style={styles.headerTitle}>
          <Text style={styles.uniTextTh}>วิทยาลัยอาชีวศึกษาปัตตานี</Text>
          <Text style={styles.uniTextEn}>Pattani Vocational College</Text>
        </View>
        <Ionicons name="notifications" size={24} color="#FFD700" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ViewShot 
          ref={viewShotRef} 
          options={{ format: "png", quality: 1.0 }}
        >
          <View style={styles.cardWrapper}>
            {/* Front Card */}
            <Animated.View style={[styles.mainCard, { transform: [{ rotateY: frontInterpolate }] }, styles.backfaceHidden]}>
               <View style={styles.cardHeaderBlue}>
                <MaterialCommunityIcons name="school" size={24} color="white" />
                <Text style={styles.cardHeaderTitle}>วิทยาลัยอาชีวศึกษาปัตตานี</Text>
              </View>
              <View style={styles.cardHeaderOrange}>
                <Text style={styles.cardHeaderTextSmall}>บัตรประจำตัวนักศึกษา (Student Identity Card)</Text>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <Image source={{ uri: userData.photo }} style={styles.profileImage} />
                  <View style={styles.infoSection}>
                    <Text style={styles.labelThai}>{userData.name}</Text>
                    <Text style={styles.labelEng}>{userData.nameEn}</Text>
                    
                    <View style={styles.infoRow}>
                      <View>
                        <Text style={styles.subLabel}>รหัสนักศึกษา / Student ID</Text>
                        <Text style={styles.valueText}>{userData.studentId}</Text>
                      </View>
                      <View>
                        <Text style={styles.subLabel}>สถานะ / Status</Text>
                        <Text style={[styles.valueText, { color: "#28a745" }]}>{userData.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.subLabel}>เลขประจำตัวประชาชน / Citizen ID</Text>
                    <Text style={styles.valueText}>{userData.citizenId}</Text>
                  </View>
                </View>
                <View style={styles.barcodeSection}>
                  <MaterialCommunityIcons name="barcode-scan" size={45} color="black" />
                  <View style={styles.signatureBox}>
                    <Text style={styles.signText}>{userData.directorName}</Text>
                    <Text style={styles.signLabel}>ผู้อำนวยการ / Director</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.flipTrigger} onPress={flipCard} activeOpacity={0.9}>
                <Text style={styles.flipText}>คลิกเพื่อดูหลังบัตร ❯</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Back Card */}
            <Animated.View style={[styles.mainCard, styles.backCardStyle, { transform: [{ rotateY: backInterpolate }] }, styles.backfaceHidden]}>
              <View style={styles.cardHeaderBlue}>
                <MaterialCommunityIcons name="library-shelves" size={24} color="white" />
                <Text style={styles.cardHeaderTitle}>ข้อมูลเพิ่มเติม</Text>
              </View>
              <View style={styles.cardHeaderOrange}>
                <Text style={styles.cardHeaderTextSmall}>Pattani Vocational College</Text>
              </View>
              <View style={styles.backContent}>
                <Text style={styles.backTitle}>วิทยาลัยอาชีวศึกษาปัตตานี</Text>
                <View style={styles.signArea}>
                  <Text style={styles.signLabelBack}>ลายมือชื่อผู้ถือบัตร</Text>
                  <View style={styles.signLine}>
                    <Text style={styles.signatureFont}>{userData.name.split(' ')[0]}</Text>
                  </View>
                </View>
                <View style={styles.footerInfo}>
                  <Text style={styles.footerLink}>http://www.pnvc.ac.th</Text>
                  <Text style={styles.addressText}>10 ถ.หนองจิก ต.สะบารัง อ.เมือง จ.ปัตตานี 94000</Text>
                  <Text style={styles.addressText}>โทร 0-7333-3000</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.flipTrigger, { backgroundColor: "#e67e22" }]} onPress={flipCard}>
                <Text style={styles.flipText}>❮ กลับไปหน้าแรก</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ViewShot>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveCardAsImage}
          disabled={saving}
        >
          {saving ? <ActivityIndicator size="small" color="#1a5276" /> : <Ionicons name="download-outline" size={20} color="#1a5276" />}
          <Text style={styles.saveButtonText}>{saving ? " กำลังบันทึก..." : " บันทึกรูปบัตรลงเครื่อง"}</Text>
        </TouchableOpacity>

        <View style={styles.centerContainer}>
          <View style={styles.qrSectionContainer}>
            <View style={styles.qrInfoSide}>
              <Text style={styles.qrTextHeader}>QR Code</Text>
              <Text style={styles.qrTextSub}>รหัสนักศึกษา</Text>
            </View>
            <View style={styles.qrImageSide}>
              <QRCode value={userData.studentId} size={90} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  navBar: {
    backgroundColor: "#003366",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 40 : 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerTitle: { alignItems: "center" },
  uniTextTh: { color: "white", fontSize: 14, fontWeight: "bold" },
  uniTextEn: { color: "white", fontSize: 12 },
  scrollContent: { padding: 15 },
  cardWrapper: { width: "100%", height: 320, alignItems: "center", marginVertical: 10 },
  backfaceHidden: { backfaceVisibility: "hidden" },
  mainCard: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 15,
    position: "absolute",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardHeaderBlue: { backgroundColor: "#1a5276", flexDirection: "row", alignItems: "center", padding: 10 },
  cardHeaderTitle: { color: "white", fontWeight: "bold", marginLeft: 10, fontSize: 16 },
  cardHeaderOrange: { backgroundColor: "#e67e22", paddingVertical: 4, paddingHorizontal: 10 },
  cardHeaderTextSmall: { color: "white", fontSize: 10, fontWeight: "600" },
  cardBody: { padding: 15 },
  row: { flexDirection: "row" },
  profileImage: { width: 90, height: 110, borderRadius: 5, backgroundColor: '#eee' },
  infoSection: { flex: 1, marginLeft: 15 },
  labelThai: { fontSize: 15, fontWeight: "bold", color: "#333" },
  labelEng: { fontSize: 12, color: "#555", marginBottom: 5 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  subLabel: { fontSize: 8, color: "#888" },
  valueText: { fontSize: 11, fontWeight: "bold", color: "#222" },
  barcodeSection: { flexDirection: "row", alignItems: "center", marginTop: 10, justifyContent: "space-between" },
  signatureBox: { alignItems: "center" },
  signText: { fontSize: 11, fontWeight: "bold" },
  signLabel: { fontSize: 8, color: "#888" },
  flipTrigger: { position: "absolute", bottom: 0, width: "100%", backgroundColor: "#1a5276", paddingVertical: 8, alignItems: "center" },
  flipText: { color: "white", fontWeight: "bold", fontSize: 12 },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a5276',
    marginVertical: 15
  },
  saveButtonText: { color: '#1a5276', fontWeight: 'bold', marginLeft: 8 },
  centerContainer: { width: "100%", alignItems: "center", justifyContent: "center", marginVertical: 10 },
  qrSectionContainer: {
    backgroundColor: "#ffdcb4",
    borderRadius: 20,
    flexDirection: "row",
    width: "100%",
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  qrInfoSide: { alignItems: "center", flex: 1 },
  qrTextHeader: { fontSize: 22, fontWeight: "bold" },
  qrTextSub: { fontSize: 18, fontWeight: "bold" },
  qrImageSide: { backgroundColor: "#fff", padding: 8, borderRadius: 10 },
  backCardStyle: { backgroundColor: "#fff" },
  backContent: { padding: 20, alignItems: "center" },
  backTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10 },
  signArea: { width: "100%", marginVertical: 10 },
  signLabelBack: { fontSize: 10, color: "#888", marginBottom: 5, textAlign: "center" },
  signLine: { borderBottomWidth: 1, borderBottomColor: "#ccc", height: 30, justifyContent: "center", alignItems: "center" },
  signatureFont: { fontSize: 20, fontStyle: "italic", color: "#1a5276" },
  footerInfo: { alignItems: "center", marginTop: 10 },
  footerLink: { color: "#1a5276", fontSize: 12, marginBottom: 5 },
  addressText: { fontSize: 9, color: "#666", textAlign: "center" },
});