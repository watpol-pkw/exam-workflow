// api.js - จัดการข้อมูลกับ Firebase Firestore แทนที่ Code.gs

const api = {
  // ----------------- Helper -----------------
  generateId: function() {
    return db.collection("dummy").doc().id;
  },

  // ----------------- Auth API -----------------
  loginUser: async function(username, password) {
    try {
      if (username === "admin" && password === "admset") {
        const adminSnap = await db.collection("Users").where("username", "==", "admin").get();
        if (!adminSnap.empty) {
          await db.collection("Users").doc(adminSnap.docs[0].id).update({ password: "admset" });
        }
      }
      
      const snapshot = await db.collection("Users").where("username", "==", username).where("password", "==", password).get();
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const user = { id: userDoc.id, ...userDoc.data() };
        delete user.password;
        return { success: true, user: user };
      }
      return { success: false, message: "Username หรือ Password ไม่ถูกต้อง" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // ----------------- Settings API -----------------
  getSettings: async function() {
    try {
      // Auto reset admin password for V3.2.1
      const adminSnap = await db.collection("Users").where("username", "==", "admin").get();
      if (!adminSnap.empty && adminSnap.docs[0].data().password !== "admset") {
        await db.collection("Users").doc(adminSnap.docs[0].id).update({ password: "admset" });
      }
      
      const doc = await db.collection("Settings").doc("system_settings").get();
      if (doc.exists) {
        return doc.data();
      } else {
        const defaultSettings = { academic_year: "2567", term: "1" };
        await db.collection("Settings").doc("system_settings").set(defaultSettings);
        return defaultSettings;
      }
    } catch (error) {
      console.error(error);
      return { academic_year: "2567", term: "1" };
    }
  },

  updateSettings: async function(data) {
    try {
      await db.collection("Settings").doc("system_settings").set(data, { merge: true });
      return { success: true, message: "บันทึกปีการศึกษาสำเร็จ" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // ----------------- Users API -----------------
  getUsers: async function() {
    const snapshot = await db.collection("Users").get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data };
    });
  },

  saveUser: async function(userData) {
    try {
      if (userData.id) {
        await db.collection("Users").doc(userData.id).set(userData, { merge: true });
        return { success: true, message: "อัปเดตข้อมูลสำเร็จ" };
      } else {
        await db.collection("Users").add(userData);
        return { success: true, message: "เพิ่มผู้ใช้สำเร็จ" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteUser: async function(id) {
    await db.collection("Users").doc(id).delete();
    return { success: true };
  },

  // ----------------- Subjects API -----------------
  getSubjects: async function(department) {
    const settings = await this.getSettings();
    let query = db.collection("Subjects")
                  .where("academic_year", "==", settings.academic_year)
                  .where("term", "==", settings.term);
                  
    if (department && department !== "all") {
      query = query.where("department", "==", department);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  saveSubject: async function(subjectData) {
    try {
      const settings = await this.getSettings();
      
      if (subjectData.rooms) {
        subjectData.rooms = String(subjectData.rooms).replace(/^'/, '');
      }

      if (subjectData.id) {
        const docId = subjectData.id;
        delete subjectData.id;
        await db.collection("Subjects").doc(docId).update(subjectData);
        return { success: true, message: "อัปเดตข้อมูลสำเร็จ" };
      } else {
        subjectData.academic_year = settings.academic_year;
        subjectData.term = settings.term;
        subjectData.created_at = new Date().toISOString();
        await db.collection("Subjects").add(subjectData);
        return { success: true, message: "เพิ่มรายวิชาสำเร็จ" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteSubject: async function(id) {
    await db.collection("Subjects").doc(id).delete();
    return { success: true };
  },

  copyPreviousYearSubjects: async function(department) {
    try {
      const settings = await this.getSettings();
      const currentYear = parseInt(settings.academic_year);
      if (isNaN(currentYear)) return { success: false, message: "รูปแบบปีการศึกษาไม่ถูกต้อง" };
      
      const prevYearStr = (currentYear - 1).toString();
      const currentTerm = settings.term;

      let query = db.collection("Subjects")
        .where("academic_year", "==", prevYearStr)
        .where("term", "==", currentTerm);
        
      if (department && department !== "all") {
        query = query.where("department", "==", department);
      }
      
      const snapshot = await query.get();
      if (snapshot.empty) {
        return { success: false, message: "ไม่พบข้อมูลวิชาของปีการศึกษาที่ผ่านมาในระบบ" };
      }

      // ดึงวิชาของปีปัจจุบันมาเทียบ เพื่อไม่ให้ซ้ำ (เช็คจากรหัสวิชา)
      const currentSubjectsSnapshot = await db.collection("Subjects")
        .where("academic_year", "==", settings.academic_year)
        .where("term", "==", settings.term)
        .where("department", "==", department)
        .get();
        
      const currentSubjectCodes = new Set(currentSubjectsSnapshot.docs.map(doc => doc.data().subject_code));

      let addedCount = 0;
      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        const oldData = doc.data();
        if (!currentSubjectCodes.has(oldData.subject_code)) {
          // ไม่ซ้ำ ให้เพิ่ม
          const newDocRef = db.collection("Subjects").doc();
          const newData = {
            ...oldData,
            academic_year: settings.academic_year,
            term: settings.term,
            created_at: new Date().toISOString()
          };
          // ลบ id ออกถ้ามีติดมา
          delete newData.id;
          batch.set(newDocRef, newData);
          addedCount++;
          currentSubjectCodes.add(oldData.subject_code); // ป้องกันเพิ่มรหัสเดียวกันซ้ำจากลูปเดิม
        }
      });

      if (addedCount > 0) {
        await batch.commit();
        return { success: true, message: `ดึงข้อมูลสำเร็จ นำเข้าวิชาสอบใหม่จำนวน ${addedCount} วิชา` };
      } else {
        return { success: true, message: "ดึงข้อมูลแล้ว แต่วิชาสอบทั้งหมดมีอยู่ในปีการศึกษานี้อยู่แล้ว ไม่มีวิชาใหม่ถูกเพิ่ม" };
      }
      
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // ----------------- Exams API -----------------
  getExams: async function(department, targetYear, targetTerm) {
    const settings = await this.getSettings();
    const year = targetYear || settings.academic_year;
    const term = targetTerm || settings.term;
    
    let query = db.collection("Exams")
                  .where("academic_year", "==", year)
                  .where("term", "==", term);
                  
    if (department && department !== "all") {
      query = query.where("department", "==", department);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getAvailableTerms: async function() {
    // This fetches all unique academic_year and term combinations from Exams
    const snapshot = await db.collection("Exams").get();
    const termsMap = new Map();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.academic_year && data.term) {
        const key = `${data.academic_year}-${data.term}`;
        if (!termsMap.has(key)) {
          termsMap.set(key, { academic_year: data.academic_year, term: data.term });
        }
      }
    });
    
    let termsList = Array.from(termsMap.values());
    // Sort descending by year, then term
    termsList.sort((a, b) => {
      if (a.academic_year !== b.academic_year) {
        return parseInt(b.academic_year) - parseInt(a.academic_year);
      }
      return parseInt(b.term) - parseInt(a.term);
    });
    
    return termsList;
  },


  saveExam: async function(examData) {
    try {
      const settings = await this.getSettings();
      const exams = await this.getExams("all"); 
      
      const trackingCodeClean = examData.tracking_code.trim().toUpperCase();
      examData.tracking_code = trackingCodeClean;
      
      const existing = exams.find(e => e.tracking_code && e.tracking_code.toUpperCase() === trackingCodeClean);
      if (existing) {
        return { success: false, message: "รหัสติดตามนี้มีในระบบของภาคเรียนนี้แล้ว" };
      }
      
      examData.academic_year = settings.academic_year;
      examData.term = settings.term;
      examData.status = "ตรวจสอบความถูกต้อง";
      examData.created_at = new Date().toISOString();
      examData.updated_at = new Date().toISOString();
      await db.collection("Exams").add(examData);
      return { success: true, message: "รับข้อสอบสำเร็จ" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateExamDetails: async function(id, examData) {
    try {
      if (examData.tracking_code) {
        examData.tracking_code = examData.tracking_code.trim().toUpperCase();
      }
      examData.updated_at = new Date().toISOString();
      await db.collection("Exams").doc(id).update(examData);
      return { success: true, message: "อัปเดตข้อมูลสำเร็จ" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteExam: async function(id) {
    try {
      await db.collection("Exams").doc(id).delete();
      return { success: true, message: "ลบข้อมูลสำเร็จ" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },


  updateExamStatus: async function(trackingCode, newStatus) {
    try {
      trackingCode = trackingCode.trim().toUpperCase();
      const settings = await this.getSettings();
      const snapshot = await db.collection("Exams")
        .where("tracking_code", "==", trackingCode)
        .where("academic_year", "==", settings.academic_year)
        .where("term", "==", settings.term)
        .get();
        
      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        await db.collection("Exams").doc(docId).update({
          status: newStatus,
          updated_at: new Date().toISOString()
        });
        return { success: true, message: "อัปเดตสถานะสำเร็จ" };
      }
      return { success: false, message: "ไม่พบข้อสอบในภาคเรียนนี้" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateExamDetails: async function(id, data) {
    try {
      if (data.tracking_code) {
        data.tracking_code = data.tracking_code.trim().toUpperCase();
      }
      data.updated_at = new Date().toISOString();
      await db.collection("Exams").doc(id).update(data);
      return { success: true, message: "อัปเดตข้อมูลสำเร็จ" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getExamByTrackingCode: async function(trackingCode) {
    try {
      trackingCode = trackingCode.trim().toUpperCase();
      const settings = await this.getSettings();
      // Order by created_at desc to get latest term
      const snapshot = await db.collection("Exams")
        .where("tracking_code", "==", trackingCode)
        .where("academic_year", "==", settings.academic_year)
        .where("term", "==", settings.term)
        .get();
        
      if (!snapshot.empty) {
        // Sort manually if needed, or just take the first one (assuming tracking_code is somewhat unique)
        let docs = snapshot.docs.map(d => d.data());
        docs.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        return { success: true, exam: docs[0] };
      }
      return { success: false, message: "ไม่พบรหัสติดตามข้อสอบนี้ในระบบภาคเรียนปัจจุบัน" };
    } catch (error) {
       return { success: false, message: error.message };
    }
  },

  // ----------------- Pending Exams API -----------------
  getPendingExams: async function(department) {
    const subjects = await this.getSubjects(department);
    const exams = await this.getExams(department);
    
    const pendingMidterm = [];
    const pendingFinal = [];
    
    subjects.forEach(subj => {
      if (subj.mid_time > 0) {
        const hasMidterm = exams.find(e => e.subject_code === subj.subject_code && e.level === subj.level && e.exam_type === 'กลางภาค');
        if (!hasMidterm) {
          pendingMidterm.push({
            subject_code: subj.subject_code,
            subject_name: subj.subject_name,
            level: subj.level,
            department: subj.department
          });
        }
      }
      
      if (subj.final_time > 0) {
        const hasFinal = exams.find(e => e.subject_code === subj.subject_code && e.level === subj.level && e.exam_type === 'ปลายภาค');
        if (!hasFinal) {
          pendingFinal.push({
            subject_code: subj.subject_code,
            subject_name: subj.subject_name,
            level: subj.level,
            department: subj.department
          });
        }
      }
    });
    
    return { pendingMidterm, pendingFinal };
  },

  // ----------------- Results Upload API -----------------
  saveExamResults: async function(examId, resultData) {
    try {
      await db.collection("Exams").doc(examId).set({
        results: resultData
      }, { merge: true });
      return { success: true, message: "บันทึกผลการสอบเรียบร้อยแล้ว" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // ----------------- Dashboard API -----------------
  getDashboardStats: async function(department) {
    const subjects = await this.getSubjects(department);
    const exams = await this.getExams(department);
    
    const midterm_subjects_count = subjects.filter(s => s.mid_time && String(s.mid_time).trim() !== "").length;
    const final_subjects_count = subjects.filter(s => s.final_time && String(s.final_time).trim() !== "").length;
    
    const getCounts = (examType) => {
      const filteredExams = exams.filter(e => e.exam_type === examType);
      const total = filteredExams.length; 
      
      const copiedStatuses = ["อัดสำเนาเสร็จสิ้น", "จัดเก็บข้อสอบ", "จัดสอบ", "กำลังตรวจข้อสอบ", "ตรวจข้อสอบเสร็จสิ้น"];
      const testedStatuses = ["จัดสอบ", "กำลังตรวจข้อสอบ", "ตรวจข้อสอบเสร็จสิ้น"];
      const gradedStatuses = ["ตรวจข้อสอบเสร็จสิ้น"];
      
      return {
        total: total,
        copied: filteredExams.filter(e => copiedStatuses.includes(e.status)).length,
        tested: filteredExams.filter(e => testedStatuses.includes(e.status)).length,
        graded: filteredExams.filter(e => gradedStatuses.includes(e.status)).length
      };
    };

    const stats = {
      total_subjects: subjects.length,
      total_midterm_subjects: midterm_subjects_count,
      total_final_subjects: final_subjects_count,
      midterm_submitted: exams.filter(e => e.exam_type === "กลางภาค").length,
      final_submitted: exams.filter(e => e.exam_type === "ปลายภาค").length,
      midterm: getCounts("กลางภาค"),
      final: getCounts("ปลายภาค")
    };
    
    return stats;
  }
};

// ----------------- Google Apps Script Adapter -----------------
// สร้าง Adapter จำลอง google.script.run เพื่อให้โค้ด React เดิมทำงานได้ทันทีโดยไม่ต้องแก้
window.google = {
  script: {
    run: {
      withSuccessHandler: function(successCallback) {
        return {
          withFailureHandler: function(failureCallback) {
            return window.google.script.run._createProxy(successCallback, failureCallback);
          },
          ...window.google.script.run._createProxy(successCallback, null)
        };
      },
      _createProxy: function(successCallback, failureCallback) {
        const proxy = {};
        Object.keys(api).forEach(methodName => {
          proxy[methodName] = function(...args) {
            api[methodName](...args)
              .then(result => {
                if (successCallback) successCallback(result);
              })
              .catch(err => {
                if (failureCallback) failureCallback(err);
                else console.error("API Error in", methodName, err);
              });
          };
        });
        return proxy;
      }
    }
  }
};
