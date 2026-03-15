import React from 'react';
import {
  SafeAreaView,
  View,
 Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function CameraScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.8}
            onPress={() => navigation?.goBack?.()}
          >
            <MaterialIcons name="arrow-back-ios-new" size={20} color="#1E293B" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Camera</Text>

          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <MaterialIcons name="settings" size={22} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Camera Preview Mockup */}
        <View style={styles.previewCard}>
          <View style={styles.previewTopRow}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live Preview</Text>
            </View>

            <TouchableOpacity style={styles.smallActionButton} activeOpacity={0.8}>
              <MaterialIcons name="flash-off" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.previewCenter}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            <Text style={styles.previewTitle}>พร้อมสำหรับการสแกน / ถ่ายภาพ</Text>
            <Text style={styles.previewSubtitle}>
              จัดวัตถุให้อยู่ภายในกรอบเพื่อให้ระบบอ่านข้อมูลได้ชัดเจน
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.85}>
            <View style={[styles.actionIconWrap, { backgroundColor: '#DBEAFE' }]}>
              <MaterialIcons name="photo-library" size={24} color="#2563EB" />
            </View>
            <Text style={styles.actionTitle}>แกลเลอรี</Text>
            <Text style={styles.actionDesc}>เลือกรูปจากเครื่อง</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.85}>
            <View style={[styles.actionIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <MaterialIcons name="qr-code-scanner" size={24} color="#16A34A" />
            </View>
            <Text style={styles.actionTitle}>สแกน</Text>
            <Text style={styles.actionDesc}>อ่าน QR / เอกสาร</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="tips-and-updates" size={22} color="#F59E0B" />
            <Text style={styles.infoTitle}>คำแนะนำ</Text>
          </View>

          <Text style={styles.infoText}>• วางเอกสารให้อยู่ในที่มีแสงเพียงพอ</Text>
          <Text style={styles.infoText}>• ถือกล้องให้นิ่งเพื่อให้ภาพคมชัด</Text>
          <Text style={styles.infoText}>• พยายามให้ข้อมูลอยู่ในกรอบสแกน</Text>
        </View>

        {/* Bottom Camera Control */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomSideButton} activeOpacity={0.8}>
            <MaterialIcons name="image" size={26} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} activeOpacity={0.85}>
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomSideButton} activeOpacity={0.8}>
            <MaterialIcons name="flip-camera-android" size={26} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const PRIMARY = '#2563EB';
const BG = '#F8FAFC';
const CARD = '#FFFFFF';
const TEXT = '#0F172A';
const SUBTEXT = '#64748B';
const BORDER = '#E2E8F0';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 18,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: CARD,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT,
  },

  previewCard: {
    backgroundColor: '#0F172A',
    borderRadius: 28,
    padding: 18,
    minHeight: 320,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  previewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  smallActionButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  previewCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 18,
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderRadius: 24,
    position: 'relative',
    marginBottom: 24,
  },
  corner: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderColor: '#60A5FA',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 18,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 18,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 18,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 18,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  previewSubtitle: {
    color: '#CBD5E1',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
  },
  actionCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    color: SUBTEXT,
    lineHeight: 18,
  },

  infoCard: {
    marginTop: 18,
    backgroundColor: '#FFF7ED',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '800',
    color: '#9A3412',
  },
  infoText: {
    fontSize: 14,
    color: '#7C2D12',
    lineHeight: 22,
    marginBottom: 2,
  },

  bottomBar: {
    marginTop: 'auto',
    paddingTop: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomSideButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: CARD,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  captureButton: {
    width: 86,
    height: 86,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
});