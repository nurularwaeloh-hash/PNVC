import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';

// ✅ รวม Import ของ Database ไว้ที่เดียว และลบตัวที่ซ้ำออก
import { getDatabase, ref, set, get } from 'firebase/database'; 
// นำเข้า auth, db, และ app จากไฟล์ firebase.js
import { auth, db, app } from '../firebase'; 

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null); 

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function signUp(email, password, userData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            await set(ref(db, `users/${newUser.uid}`), {
                uid: newUser.uid,
                name: userData.name || '',
                studentId: userData.studentId || '',
                major: userData.major || '',
                email: email.toLowerCase(),
                school: 'วิทยาลัยอาชีวศึกษาปัตตานี',
                points: 0,
                createdAt: new Date().toISOString(),
                role: 'student' // ค่าเริ่มต้นเป็นนักศึกษา
            });

            return userCredential;
        } catch (error) {
            throw error;
        }
    }

    function logOut() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentuser) => {
            setUser(currentuser);
            if (currentuser) {
                // 🔍 ดึง Role จาก Database มาเก็บไว้ใน State
                try {
                    const dbRef = ref(db, `users/${currentuser.uid}/role`);
                    const snapshot = await get(dbRef);
                    if (snapshot.exists()) {
                        setRole(snapshot.val());
                    } else {
                        setRole('student'); // ถ้าไม่มีข้อมูลให้เป็น student ไว้ก่อน
                    }
                } catch (err) {
                    console.log("Error fetching role:", err);
                }
            } else {
                setRole(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <userAuthContext.Provider value={{ user, role, login, signUp, logOut }}>
            {!loading && children}
        </userAuthContext.Provider>
    );
}

export function useUserAuth() {
    return useContext(userAuthContext);
}