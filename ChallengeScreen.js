import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, 
  SafeAreaView, Alert, Dimensions, Animated, StatusBar, ScrollView, Modal, TextInput
} from 'react-native';
import { RotateCcw, Trophy, Clock, Eye, Flame, Award, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

// --- เพิ่มส่วนเชื่อมต่อ Firebase ---
import { getDatabase, ref, push, set, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import app from '../firebase'; 

const { width } = Dimensions.get('window');
const FRUIT_POOL = ['🍎', '🍌', '🍉', '🍇', '🍓', '🍍', '🥥', '🥝', '🍒', '🥭', '🍐', '🍊', '🍋', '🍈', '🍏', '🫐', '🥑', '🌽'];

const LEVEL_CONFIG = {
  1: { grid: 4, pairs: 8, time: 60, color: '#3B82F6' },
  2: { grid: 4, pairs: 12, time: 90, color: '#F59E0B' },
  3: { grid: 6, pairs: 18, time: 150, color: '#EF4444' },
};

export default function FruitMatchGame() {
  // Game States
  const [currentLevel, setCurrentLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  
  // States สำหรับ Leaderboard และ User
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [username, setUsername] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [tempScore, setTempScore] = useState(0);

  // Item States
  const [isRevealed, setIsRevealed] = useState(false);
  const [itemUsed, setItemUsed] = useState(false);

  // Animations
  const comboScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    initGame();
    checkExistingUser(); // เช็คชื่อผู้ใช้เมื่อเปิดแอป
    listenToFirebaseLeaderboard(); // ดึง Leaderboard จาก Firebase
  }, [currentLevel]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      Alert.alert("Time's Up!", "ลองใหม่อีกครั้งนะ", [{ text: "Retry", onPress: () => initGame() }]);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  // --- ระบบดึงข้อมูลผู้ใช้ และ Leaderboard จาก Firebase ---
  
  const checkExistingUser = async () => {
    const savedName = await AsyncStorage.getItem('@username');
    if (savedName) setUsername(savedName);
  };

  const listenToFirebaseLeaderboard = () => {
    const db = getDatabase(app);
    // ดึง 10 อันดับสูงสุด เรียงตามคะแนน
    const scoresRef = query(ref(db, 'leaderboard'), orderByChild('score'), limitToLast(10));
    
    onValue(scoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.values(data).sort((a, b) => b.score - a.score);
        setLeaderboard(formattedData);
      }
    });
  };

  const saveFinalScoreToFirebase = async (nameToSave, scoreToSave) => {
    try {
      const db = getDatabase(app);
      const leaderboardRef = ref(db, 'leaderboard');
      const newScoreRef = push(leaderboardRef);
      
      await set(newScoreRef, {
        username: nameToSave,
        score: scoreToSave,
        level: currentLevel,
        date: new Date().toLocaleString('th-TH'),
        timestamp: Date.now()
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Firebase Error:", error);
      Alert.alert("Error", "ไม่สามารถบันทึกคะแนนลง Cloud ได้");
    }
  };

  // --- Logic เกมเดิม ---

  const initGame = (level = currentLevel) => {
    const config = LEVEL_CONFIG[level];
    const deck = [...FRUIT_POOL.slice(0, config.pairs), ...FRUIT_POOL.slice(0, config.pairs)]
      .sort(() => Math.random() - 0.5)
      .map((fruit, index) => ({ id: index, content: fruit }));
    
    setCards(deck);
    setMatchedCards([]);
    setSelectedCards([]);
    setMoves(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(config.time);
    setIsActive(true);
    setItemUsed(false);
    setIsRevealed(false);
    
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  const handleCardPress = (card) => {
    if (!isActive || selectedCards.length === 2 || selectedCards.find(c => c.id === card.id) || matchedCards.includes(card.id)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      if (newSelected[0].content === newSelected[1].content) {
        setMatchedCards(prev => [...prev, newSelected[0].id, newSelected[1].id]);
        setSelectedCards([]);
        setCombo(c => c + 1);
        if (combo + 1 > maxCombo) setMaxCombo(combo + 1);
        
        Animated.sequence([
          Animated.spring(comboScale, { toValue: 1.5, useNativeDriver: true }),
          Animated.spring(comboScale, { toValue: 0, useNativeDriver: true })
        ]).start();

        if (matchedCards.length + 2 === cards.length) {
          setIsActive(false);
          setTimeout(finishLevel, 500);
        }
      } else {
        setCombo(0);
        setTimeout(() => setSelectedCards([]), 800);
      }
    }
  };

  const finishLevel = () => {
    const score = (currentLevel * 1000) + (timeLeft * 20) + (maxCombo * 100) - (moves * 5);
    const finalScore = Math.max(score, 0);
    setTempScore(finalScore);

    if (!username) {
      setShowNameInput(true);
    } else {
      saveFinalScoreToFirebase(username, finalScore);
      showVictoryAlert(finalScore);
    }
  };

  const showVictoryAlert = (score) => {
    Alert.alert(
      "Victory!", 
      `Level ${currentLevel} Complete\nScore: ${score}\nMax Combo: ${maxCombo}`,
      currentLevel < 3 
        ? [{ text: "Next Level", onPress: () => setCurrentLevel(currentLevel + 1) }]
        : [{ text: "Play Again", onPress: () => setCurrentLevel(1) }]
    );
  };

  const useRevealItem = () => {
    if (itemUsed) return;
    setItemUsed(true);
    setIsRevealed(true);
    setTimeout(() => setIsRevealed(false), 2000);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  // --- UI Rendering ---

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.levelText}>Level {currentLevel}</Text>
          <View style={styles.statRow}>
            <Clock size={16} color="#94A3B8" />
            <Text style={styles.statText}>{timeLeft}s</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setShowLeaderboard(true)} style={styles.iconBtn}>
          <Trophy color="#F59E0B" size={24} />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <RotateCcw size={18} color="#6366F1" />
          <Text style={styles.statLabel}>Moves: {moves}</Text>
        </View>
        <View style={styles.statItem}>
          <Flame size={18} color="#EF4444" />
          <Text style={styles.statLabel}>Combo: {combo}</Text>
        </View>
      </View>

      {/* Game Board */}
      <Animated.View style={[styles.board, { opacity: fadeAnim }]}>
        <View style={styles.grid}>
          {cards.map((card) => {
            const isFlipped = selectedCards.find(c => c.id === card.id) || matchedCards.includes(card.id) || isRevealed;
            return (
              <TouchableOpacity
                key={card.id}
                onPress={() => handleCardPress(card)}
                style={[
                  styles.card,
                  { width: width / (LEVEL_CONFIG[currentLevel].grid) - 20, height: width / (LEVEL_CONFIG[currentLevel].grid) - 20 },
                  isFlipped && styles.cardFlipped,
                  matchedCards.includes(card.id) && { opacity: 0.6 }
                ]}
              >
                <Text style={{ fontSize: currentLevel === 3 ? 24 : 32 }}>
                  {isFlipped ? card.content : ''}
                </Text>
                {!isFlipped && <View style={styles.cardLogo} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* Combo Pop Animation */}
      <Animated.View style={[styles.comboPop, { transform: [{ scale: comboScale }], backgroundColor: LEVEL_CONFIG[currentLevel].color }]}>
        <Text style={styles.comboPopText}>{combo} COMBO!</Text>
      </Animated.View>

      {/* Footer / Items */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.itemBtn, itemUsed && styles.disabled]} 
          onPress={useRevealItem}
          disabled={itemUsed}
        >
          <Eye color={itemUsed ? "#64748B" : "white"} size={20} />
          <Text style={styles.itemText}>{itemUsed ? "Used" : "Reveal (2s)"}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal: กรอกชื่อผู้เล่น */}
      <Modal visible={showNameInput} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: 'white', marginBottom: 15 }]}>บันทึกคะแนน: {tempScore}</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="ใส่ชื่อของคุณ..."
              placeholderTextColor="#64748B"
              value={username}
              onChangeText={setUsername}
              maxLength={15}
            />
            <TouchableOpacity 
              style={[styles.itemBtn, { backgroundColor: '#10B981', marginTop: 10, justifyContent: 'center' }]}
              onPress={async () => {
                if (username.trim().length < 2) {
                  Alert.alert("ชื่อสั้นเกินไป", "กรุณาใส่ชื่ออย่างน้อย 2 ตัวอักษร");
                  return;
                }
                await AsyncStorage.setItem('@username', username);
                setShowNameInput(false);
                saveFinalScoreToFirebase(username, tempScore);
                showVictoryAlert(tempScore);
              }}
            >
              <Text style={styles.itemText}>บันทึกและลุยต่อ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Leaderboard */}
      <Modal visible={showLeaderboard} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Trophy color="#F59E0B" size={24} />
              <Text style={styles.modalTitle}>Global Rankings</Text>
              <TouchableOpacity onPress={() => setShowLeaderboard(false)}>
                <X color="#94A3B8" size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {leaderboard.length > 0 ? (
                leaderboard.map((item, index) => (
                  <View key={index} style={styles.leaderboardItem}>
                    <View style={styles.rankCircle}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.lbName}>{item.username || 'Anonymous'}</Text>
                      <Text style={styles.lbDate}>{item.date}</Text>
                    </View>
                    <Text style={styles.lbScore}>{item.score.toLocaleString()}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 20 }}>No scores yet!</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  levelText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  statText: { color: '#94A3B8', fontSize: 16 },
  iconBtn: { padding: 10, backgroundColor: '#1E293B', borderRadius: 12 },
  statsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1E293B', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  statLabel: { color: 'white', fontWeight: '600' },
  board: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  card: { margin: 3, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 4, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  cardFlipped: { backgroundColor: '#F8FAFC', borderColor: '#FFF' },
  cardLogo: { width: '30%', height: '30%', backgroundColor: '#334155', borderRadius: 50 },
  comboPop: { position: 'absolute', top: '45%', alignSelf: 'center', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 30, zIndex: 10 },
  comboPopText: { color: 'white', fontWeight: '900', fontSize: 18 },
  footer: { marginTop: 'auto', paddingBottom: 30, alignItems: 'center' },
  itemBtn: { flexDirection: 'row', backgroundColor: '#6366F1', padding: 15, borderRadius: 20, alignItems: 'center', gap: 10, minWidth: 150, justifyContent: 'center' },
  itemText: { color: 'white', fontWeight: 'bold' },
  disabled: { backgroundColor: '#334155' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 25, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  nameInput: { backgroundColor: '#334155', color: 'white', padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 10 },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  rankCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  rankText: { color: '#94A3B8', fontWeight: 'bold' },
  lbName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  lbDate: { color: '#64748B', fontSize: 12 },
  lbScore: { color: '#F59E0B', fontWeight: '900', fontSize: 18 }
});