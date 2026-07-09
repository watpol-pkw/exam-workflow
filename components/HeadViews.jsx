const { useState, useEffect } = React;

function RequestExamView({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [subjCode, setSubjCode] = useState('');
  const [subjName, setSubjName] = useState('');
  const [level, setLevel] = useState('ม.1');
  const [rooms, setRooms] = useState('');
  const [midTime, setMidTime] = useState('');
  const [finalTime, setFinalTime] = useState('');
  const [scheduleType, setScheduleType] = useState('ในตาราง');
  const [note, setNote] = useState('');

  const loadSubjects = () => {
    setLoading(true);
    google.script.run.withSuccessHandler((data) => {
      const sorted = data.sort((a, b) => {
        if (a.level !== b.level) {
          return a.level.localeCompare(b.level, 'th', {numeric: true});
        }
        return a.subject_code.localeCompare(b.subject_code);
      });
      setSubjects(sorted);
      setLoading(false);
    }).getSubjects(user.department);
  };

  useEffect(() => { loadSubjects(); }, []);

  const resetForm = () => {
    setSubjCode(''); setSubjName(''); setRooms(''); setMidTime(''); setFinalTime(''); setNote(''); setLevel('ม.1'); setScheduleType('ในตาราง');
  };

  const handleEdit = (s) => {
    Swal.fire({
      title: 'แก้ไขข้อมูลวิชา',
      html: `
        <div class="text-left space-y-4 mt-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสวิชา</label>
            <input id="e-code" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="${s.subject_code}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อวิชา</label>
            <input id="e-name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="${s.subject_name}">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ระดับชั้น</label>
              <select id="e-level" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors">
                ${['ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'].map(l => `<option value="${l}" ${s.level === l ? 'selected' : ''}>${l}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ห้องเรียน</label>
              <input id="e-rooms" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="${s.rooms}">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">สอบกลางภาค (นาที)</label>
              <input id="e-mid" type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="${s.mid_time}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">สอบปลายภาค (นาที)</label>
              <input id="e-final" type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="${s.final_time}">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">การจัดสอบ</label>
            <select id="e-type" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors">
              <option value="ในตาราง" ${s.schedule_type === 'ในตาราง' ? 'selected' : ''}>ในตาราง</option>
              <option value="นอกตาราง" ${s.schedule_type === 'นอกตาราง' ? 'selected' : ''}>นอกตาราง</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึกการแก้ไข',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#2563eb',
      width: '30rem',
      padding: '1.5rem',
      customClass: {
        popup: 'rounded-2xl shadow-xl',
        title: 'text-xl font-bold font-kanit',
        actions: 'mt-6',
        confirmButton: 'px-5 py-2 rounded-lg font-medium',
        cancelButton: 'px-5 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300'
      },
      preConfirm: () => {
        return {
          id: s.id,
          subject_code: document.getElementById('e-code').value,
          subject_name: document.getElementById('e-name').value,
          level: document.getElementById('e-level').value,
          rooms: document.getElementById('e-rooms').value,
          mid_time: document.getElementById('e-mid').value,
          final_time: document.getElementById('e-final').value,
          schedule_type: document.getElementById('e-type').value,
          department: user.department,
          created_by: user.name
        };
      }
    }).then(res => {
      if (res.isConfirmed) {
        google.script.run.withSuccessHandler((r) => {
          if(r.success) {
            Swal.fire('สำเร็จ', r.message, 'success');
            loadSubjects();
          }
        }).saveSubject(res.value);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subjectData = {
      subject_code: subjCode,
      subject_name: subjName,
      level: level,
      rooms: rooms,
      mid_time: midTime,
      final_time: finalTime,
      schedule_type: scheduleType,
      department: user.department,
      note: note,
      created_by: user.name
    };

    google.script.run.withSuccessHandler((res) => {
      if(res.success) {
        Swal.fire('สำเร็จ', res.message, 'success');
        resetForm();
        loadSubjects();
      }
    }).saveSubject(subjectData);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        google.script.run.withSuccessHandler(() => {
          Swal.fire('ลบแล้ว!', 'ข้อมูลถูกลบเรียบร้อย', 'success');
          loadSubjects();
        }).deleteSubject(id);
      }
    });
  };

  const handlePrintPDF = () => {
    if (subjects.length === 0) {
      Swal.fire('แจ้งเตือน', 'ยังไม่มีรายวิชาที่แจ้งความประสงค์', 'warning');
      return;
    }
    
    // ดึงค่าเทอมและปีการศึกษาจาก Settings
    google.script.run.withSuccessHandler((settings) => {
      const term = settings.term || '-';
      const year = settings.academic_year || '-';
      
      const printWindow = window.open('', '_blank');
      
      let html = `
        <html>
        <head>
          <title>พิมพ์แบบสำรวจเวลาในการสอบ</title>
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
          <style>
            * {
              font-family: 'Sarabun', sans-serif;
              font-size: 10pt !important;
            }
            body {
              margin: 0;
              padding: 20px;
              color: #000;
            }
            .header {
              text-align: center;
              font-weight: bold;
              margin-bottom: 20px;
              line-height: 1.5;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f0f0f0;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            thead {
              display: table-header-group;
            }
            td:nth-child(2) {
              text-align: left;
            }
            .signature {
              width: 350px;
              margin-left: auto;
              text-align: center;
              line-height: 1.5;
            }
            @media print {
              body { padding: 0; }
              @page { size: A4 portrait; margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            แบบสำรวจเวลาในการสอบ <br>
            กลุ่มสาระการเรียนรู้ ${user.department} <br>
            ภาคเรียนที่ ${term} ปีการศึกษา ${year}
          </div>
          <table>
            <thead>
              <tr>
                <th>รหัสวิชา</th>
                <th>ชื่อวิชา</th>
                <th>ชั้น</th>
                <th>ห้อง</th>
                <th>กลางภาค</th>
                <th>ปลายภาค</th>
                <th>รูปแบบการสอบ</th>
              </tr>
            </thead>
            <tbody>
              ${subjects.map(s => `
                <tr>
                  <td>${s.subject_code}</td>
                  <td>${s.subject_name}</td>
                  <td>${s.level}</td>
                  <td>${s.rooms}</td>
                  <td>${s.mid_time > 0 ? s.mid_time + ' นาที' : '-'}</td>
                  <td>${s.final_time > 0 ? s.final_time + ' นาที' : '-'}</td>
                  <td>${s.schedule_type}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="signature">
            ลงชื่อ......................................................... <br>
            (.................................................................) <br>
            หัวหน้ากลุ่มสาระการเรียนรู้
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
    }).getSettings();
  };

  const handleCopyPreviousYear = () => {
    Swal.fire({
      title: 'ยืนยันการดึงข้อมูล?',
      text: "ระบบจะดึงรายวิชาจัดสอบของภาคเรียนเดียวกันจากปีการศึกษาที่ผ่านมา เข้ามาในปีการศึกษาปัจจุบัน (ข้อมูลเดิมในปีนี้จะไม่ถูกลบ)",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันดึงข้อมูล',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'กำลังดึงข้อมูล...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        google.script.run.withSuccessHandler((res) => {
          if (res.success) {
            if (res.message.includes("ไม่พบข้อมูล") || res.message.includes("ไม่มีวิชาใหม่")) {
              Swal.fire('แจ้งเตือน', res.message, 'warning');
            } else {
              Swal.fire('สำเร็จ', res.message, 'success');
              loadSubjects();
            }
          } else {
            Swal.fire('ข้อผิดพลาด', res.message, 'error');
          }
        }).copyPreviousYearSubjects(user.department);
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold font-kanit text-gray-800 flex items-center mb-4 md:mb-0">
          <i className="ph ph-file-plus text-blue-600 mr-2 text-3xl"></i>
          แจ้งความประสงค์จัดสอบ
        </h2>
        <div className="flex gap-2">
          <button onClick={handleCopyPreviousYear} className="flex items-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <i className="ph ph-copy mr-2 text-lg"></i>
            ดึงข้อมูลวิชาสอบ (ปีก่อน)
          </button>
          <button onClick={handlePrintPDF} className="flex items-center text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <i className="ph ph-printer mr-2 text-lg"></i>
            ดาวน์โหลดเอกสาร (PDF)
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-xl border bg-gray-50 border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">รหัสวิชา</label>
            <input type="text" required className="bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" value={subjCode} onChange={e=>setSubjCode(e.target.value)} />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">ชื่อวิชา</label>
            <input type="text" required className="bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" value={subjName} onChange={e=>setSubjName(e.target.value)} />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">ระดับชั้น</label>
            <select className="bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" value={level} onChange={e=>setLevel(e.target.value)}>
              {['ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">ห้องเรียน (เช่น 1-3,6-17 หรือ พหุปัญญา)</label>
            <input type="text" required className="bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" value={rooms} onChange={e=>setRooms(e.target.value)} />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">เวลาสอบกลางภาค (นาที)</label>
            <input type="number" required className="bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" value={midTime} onChange={e=>setMidTime(e.target.value)} placeholder="ไม่มีสอบให้ใส่ 0" />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">เวลาสอบปลายภาค (นาที)</label>
            <input type="number" required className="bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" value={finalTime} onChange={e=>setFinalTime(e.target.value)} placeholder="ไม่มีสอบให้ใส่ 0" />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">การจัดสอบ</label>
            <select className="bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" value={scheduleType} onChange={e=>setScheduleType(e.target.value)}>
              <option value="ในตาราง">ในตาราง</option>
              <option value="นอกตาราง">นอกตาราง</option>
            </select>
          </div>
          <div className="col-span-1 md:col-span-2">
             <p className="text-sm text-red-600 mt-2 font-medium">หมายเหตุ หากข้อสอบออกโดยคุณครูชาวต่างชาติ ไม่ต้องระบุห้องเรียน EP</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">
            บันทึกข้อมูล
          </button>
        </div>
      </form>

      <h3 className="font-bold mb-4">รายการวิชาที่แจ้งความประสงค์</h3>
      {loading ? <p>กำลังโหลด...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">รหัสวิชา</th>
                <th className="px-4 py-3">ชื่อวิชา</th>
                <th className="px-4 py-3">ชั้น</th>
                <th className="px-4 py-3">ห้อง</th>
                <th className="px-4 py-3">กลางภาค</th>
                <th className="px-4 py-3">ปลายภาค</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{s.subject_code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.subject_name}</td>
                  <td className="px-4 py-3">{s.level}</td>
                  <td className="px-4 py-3">{s.rooms}</td>
                  <td className="px-4 py-3">{s.mid_time > 0 ? s.mid_time + ' นาที' : '-'}</td>
                  <td className="px-4 py-3">{s.final_time > 0 ? s.final_time + ' นาที' : '-'}</td>
                  <td className="px-4 py-3">{s.schedule_type}</td>
                  <td className="px-4 py-3 flex justify-center gap-3">
                    <button onClick={() => handleEdit(s)} className="text-blue-500 hover:text-blue-700">
                      <i className="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
                      <i className="ph ph-trash text-lg"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && <tr><td colSpan="8" className="text-center py-4">ไม่มีข้อมูล</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LatestStatusView({ user }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let dept = "all";
    if (user.role === 'head') dept = user.department;
    
    google.script.run.withSuccessHandler((data) => {
      const sorted = data.sort((a,b) => (a.tracking_code || '').localeCompare(b.tracking_code || '', 'th', {numeric: true}));
      setExams(sorted);
      setLoading(false);
    }).getExams(dept);
  }, [user]);

  const handleUpdateStatus = (exam) => {
    if (user.role !== 'admin') return;
    
    const statuses = [
      "ตรวจสอบความถูกต้อง",
      "กำลังจัดพิมพ์",
      "อัดสำเนาเสร็จสิ้น",
      "จัดเก็บข้อสอบ",
      "จัดสอบ",
      "กำลังตรวจข้อสอบ",
      "ตรวจข้อสอบเสร็จสิ้น"
    ];

    const currentIndex = statuses.indexOf(exam.status);
    if (currentIndex >= statuses.length - 1) {
      Swal.fire('แจ้งเตือน', 'ข้อสอบนี้อยู่ในสถานะสิ้นสุดแล้ว', 'info');
      return;
    }
    const nextStatus = statuses[currentIndex + 1];

    Swal.fire({
      title: 'ยืนยันการอัปเดตสถานะ?',
      html: `
        <div class="text-left mb-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          <p><strong>วิชา:</strong> ${exam.subject_code} ${exam.subject_name}</p>
          <p><strong>รหัสติดตาม:</strong> ${exam.tracking_code}</p>
        </div>
        <p>คุณต้องการอัปเดตสถานะเป็น <strong class="text-blue-600">${nextStatus}</strong> หรือไม่?</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'อัปเดต',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading()});
        
        google.script.run.withSuccessHandler((res) => {
          if(res.success) {
            Swal.fire('สำเร็จ', res.message, 'success');
            // reload
            let dept = user.role === 'head' ? user.department : "all";
            google.script.run.withSuccessHandler((data) => {
              const sorted = data.sort((a,b) => (a.tracking_code || '').localeCompare(b.tracking_code || '', 'th', {numeric: true}));
              setExams(sorted);
            }).getExams(dept);
          } else {
            Swal.fire('ข้อผิดพลาด', res.message, 'error');
          }
        }).updateExamStatus(exam.tracking_code, nextStatus);
      }
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      "รอตรวจสอบ": "bg-gray-100 text-gray-800",
      "ตรวจสอบความถูกต้อง": "bg-yellow-100 text-yellow-800",
      "กำลังอัดสำเนา": "bg-blue-100 text-blue-800",
      "อัดสำเนาเสร็จสิ้น": "bg-indigo-100 text-indigo-800",
      "จัดเก็บข้อสอบ": "bg-purple-100 text-purple-800",
      "ดำเนินจัดสอบ": "bg-orange-100 text-orange-800",
      "กำลังตรวจข้อสอบ": "bg-teal-100 text-teal-800",
      "ตรวจข้อสอบเสร็จสิ้น": "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 fade-in">
      <h2 className="text-2xl font-bold font-kanit mb-6 text-gray-800 flex items-center">
        <i className="ph ph-activity text-blue-600 mr-2 text-3xl"></i>
        สถานะล่าสุด
      </h2>
      
      {loading ? <p>กำลังโหลด...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">รหัสติดตาม</th>
                <th className="px-4 py-3">รหัสวิชา</th>
                <th className="px-4 py-3">วิชา</th>
                <th className="px-4 py-3">ระดับชั้น</th>
                <th className="px-4 py-3">ประเภทสอบ</th>
                <th className="px-4 py-3">กลุ่มสาระฯ</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3">อัปเดตเมื่อ</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.tracking_code}</td>
                  <td className="px-4 py-3">{e.subject_code}</td>
                  <td className="px-4 py-3">{e.subject_name}</td>
                  <td className="px-4 py-3">{e.level}</td>
                  <td className="px-4 py-3">{e.exam_type}</td>
                  <td className="px-4 py-3">{e.department}</td>
                  <td className="px-4 py-3">
                    {user.role === 'admin' ? (
                      <button onClick={() => handleUpdateStatus(e)} className={`text-xs font-medium px-2.5 py-1 rounded shadow-sm hover:opacity-80 transition cursor-pointer flex items-center gap-1 ${getStatusColor(e.status)}`}>
                        {e.status} <i className="ph ph-caret-down ml-1"></i>
                      </button>
                    ) : (
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusColor(e.status)}`}>
                        {e.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{new Date(e.updated_at).toLocaleString('th-TH')}</td>
                </tr>
              ))}
              {exams.length === 0 && <tr><td colSpan="8" className="text-center py-4">ไม่มีข้อมูลการติดตาม</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PendingExamsView({ user }) {
  const [pendingMidterm, setPendingMidterm] = useState([]);
  const [pendingFinal, setPendingFinal] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let dept = "all";
    if (user.role === 'head') dept = user.department;
    
    google.script.run.withSuccessHandler((data) => {
      const DEPARTMENTS_ORDER = [
        'ภาษาไทย', 'คณิตศาสตร์', 'วิทยาศาสตร์', 'สังคมศึกษาฯ', 
        'สุขศึกษาและพลศึกษา', 'ภาษาต่างประเทศ', 'English Program'
      ];
      
      const sortFn = (a, b) => {
        let indexA = DEPARTMENTS_ORDER.indexOf(a.department);
        let indexB = DEPARTMENTS_ORDER.indexOf(b.department);
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        if (indexA !== indexB) return indexA - indexB;
        if (a.level !== b.level) return a.level.localeCompare(b.level, 'th', {numeric: true});
        return a.subject_code.localeCompare(b.subject_code);
      };
      
      setPendingMidterm(data.pendingMidterm.sort(sortFn));
      setPendingFinal(data.pendingFinal.sort(sortFn));
      setLoading(false);
    }).getPendingExams(dept);
  }, [user]);

  if (loading) return <div className="text-center py-10">กำลังโหลดข้อมูล...</div>;

  const handlePrintPDF = (title, examsData) => {
    if (examsData.length === 0) {
      Swal.fire('แจ้งเตือน', 'ไม่มีรายการค้างส่ง', 'warning');
      return;
    }
    
    google.script.run.withSuccessHandler((settings) => {
      const term = settings.term || '-';
      const year = settings.academic_year || '-';
      
      const printWindow = window.open('', '_blank');
      
      let html = `
        <html>
        <head>
          <title>พิมพ์รายการข้อสอบค้างส่ง</title>
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
          <style>
            * {
              font-family: 'Sarabun', sans-serif;
              font-size: 10pt !important;
            }
            body { margin: 0; padding: 20px; color: #000; }
            .header { text-align: center; font-weight: bold; margin-bottom: 20px; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background-color: #f0f0f0; -webkit-print-color-adjust: exact; color-adjust: exact; }
            thead { display: table-header-group; }
            td:nth-child(3) { text-align: left; }
            @media print {
              body { padding: 0; }
              @page { size: A4 portrait; margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            รายการข้อสอบค้างส่ง (${title}) <br>
            ${user.role === 'head' ? `กลุ่มสาระการเรียนรู้ ${user.department} <br>` : ''}
            ภาคเรียนที่ ${term} ปีการศึกษา ${year}
          </div>
          <table>
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>รหัสวิชา</th>
                <th>ชื่อวิชา</th>
                <th>ชั้น</th>
                ${user.role !== 'head' ? '<th>กลุ่มสาระฯ</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${examsData.map((s, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${s.subject_code}</td>
                  <td>${s.subject_name}</td>
                  <td>${s.level}</td>
                  ${user.role !== 'head' ? `<td>${s.department}</td>` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
    }).getSettings();
  };

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-2xl font-bold font-kanit mb-4 text-gray-800 flex items-center">
        <i className="ph ph-warning-circle text-orange-500 mr-2 text-3xl"></i>
        รายการข้อสอบค้างส่ง
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="text-lg font-bold font-kanit text-orange-700 flex items-center">
              <i className="ph ph-file-dashed mr-2"></i> ค้างส่ง กลางภาค ({pendingMidterm.length})
            </h3>
            <button onClick={() => handlePrintPDF('กลางภาค', pendingMidterm)} className="text-xs flex items-center text-orange-600 hover:text-white border border-orange-600 hover:bg-orange-600 px-2 py-1 rounded transition-colors">
              <i className="ph ph-printer mr-1"></i> PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2">รหัสวิชา</th>
                  <th className="px-3 py-2">ชื่อวิชา</th>
                  <th className="px-3 py-2">ชั้น</th>
                  {user.role !== 'head' && <th className="px-3 py-2">กลุ่มสาระฯ</th>}
                </tr>
              </thead>
              <tbody>
                {pendingMidterm.map((s, i) => (
                  <tr key={i} className="border-b hover:bg-orange-50">
                    <td className="px-3 py-2">{s.subject_code}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{s.subject_name}</td>
                    <td className="px-3 py-2">{s.level}</td>
                    {user.role !== 'head' && <td className="px-3 py-2">{s.department}</td>}
                  </tr>
                ))}
                {pendingMidterm.length === 0 && <tr><td colSpan={user.role !== 'head' ? 4 : 3} className="text-center py-4 text-green-600">ไม่มีข้อสอบค้างส่งกลางภาค</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="text-lg font-bold font-kanit text-orange-700 flex items-center">
              <i className="ph ph-file-dashed mr-2"></i> ค้างส่ง ปลายภาค ({pendingFinal.length})
            </h3>
            <button onClick={() => handlePrintPDF('ปลายภาค', pendingFinal)} className="text-xs flex items-center text-orange-600 hover:text-white border border-orange-600 hover:bg-orange-600 px-2 py-1 rounded transition-colors">
              <i className="ph ph-printer mr-1"></i> PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2">รหัสวิชา</th>
                  <th className="px-3 py-2">ชื่อวิชา</th>
                  <th className="px-3 py-2">ชั้น</th>
                  {user.role !== 'head' && <th className="px-3 py-2">กลุ่มสาระฯ</th>}
                </tr>
              </thead>
              <tbody>
                {pendingFinal.map((s, i) => (
                  <tr key={i} className="border-b hover:bg-orange-50">
                    <td className="px-3 py-2">{s.subject_code}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{s.subject_name}</td>
                    <td className="px-3 py-2">{s.level}</td>
                    {user.role !== 'head' && <td className="px-3 py-2">{s.department}</td>}
                  </tr>
                ))}
                {pendingFinal.length === 0 && <tr><td colSpan={user.role !== 'head' ? 4 : 3} className="text-center py-4 text-green-600">ไม่มีข้อสอบค้างส่งปลายภาค</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamResultsView({ user }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [selectedTermKey, setSelectedTermKey] = useState(''); // Format: "year-term"

  useEffect(() => {
    // โหลดรายการภาคเรียนทั้งหมด
    google.script.run.withSuccessHandler(data => {
      setAvailableTerms(data);
      // ตั้งค่าเริ่มต้นถ้าไม่มีการเลือกไว้
      if (data.length > 0 && !selectedTermKey) {
        google.script.run.withSuccessHandler(settings => {
          const currentKey = `${settings.academic_year}-${settings.term}`;
          // เช็คว่า currentKey มีใน availableTerms ไหม
          const exists = data.some(t => `${t.academic_year}-${t.term}` === currentKey);
          setSelectedTermKey(exists ? currentKey : `${data[0].academic_year}-${data[0].term}`);
        }).getSettings();
      }
    }).getAvailableTerms();
  }, []);

  useEffect(() => {
    if (!selectedTermKey) return;
    
    setLoading(true);
    let dept = "all";
    if (user.role === 'head') dept = user.department;
    
    const [year, term] = selectedTermKey.split('-');
    
    google.script.run.withSuccessHandler((data) => {
      // กรองเฉพาะวิชาที่มีผลการสอบ (มี properties results)
      const examsWithResults = data.filter(e => e.results && (e.results.score_url || e.results.summary_url || e.results.analysis_url));
      
      // เรียงลำดับตามระดับชั้น และรหัสวิชา
      const sorted = examsWithResults.sort((a,b) => {
        if (a.level !== b.level) {
          return (a.level || '').localeCompare(b.level || '', 'th', {numeric: true});
        }
        return (a.subject_code || '').localeCompare(b.subject_code || '');
      });
      setExams(sorted);
      setLoading(false);
    }).getExams(dept, year, term);
  }, [user, selectedTermKey]);

  const renderPdfIcon = (url, label) => {
    if (!url) return <span className="text-gray-300">-</span>;
    return (
      <a href={url} target="_blank" rel="noreferrer" title={label} className="inline-flex items-center justify-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors">
        <i className="ph ph-file-pdf text-xl"></i>
      </a>
    );
  };

  const midtermExams = exams.filter(e => e.exam_type === 'กลางภาค');
  const finalExams = exams.filter(e => e.exam_type === 'ปลายภาค');

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h2 className="text-2xl font-bold font-kanit text-gray-800 flex items-center">
          <i className="ph ph-file-pdf text-red-500 mr-2 text-3xl"></i>
          ผลการสอบและการวิเคราะห์ข้อสอบ
        </h2>
        
        {availableTerms.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">ดูข้อมูลย้อนหลัง:</label>
            <select 
              className="bg-white border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 shadow-sm"
              value={selectedTermKey}
              onChange={e => setSelectedTermKey(e.target.value)}
            >
              <option value="" disabled>เลือกปีการศึกษา/ภาคเรียน</option>
              {availableTerms.map((t, idx) => (
                <option key={idx} value={`${t.academic_year}-${t.term}`}>
                  ภาคเรียน {t.term}/{t.academic_year}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? <p>กำลังโหลดข้อมูล...</p> : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* ตารางกลางภาค */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold font-kanit mb-4 text-blue-800 border-b pb-2">สอบกลางภาค ({midtermExams.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-blue-50">
                  <tr>
                    <th className="px-3 py-2">ระดับชั้น</th>
                    <th className="px-3 py-2">รหัสวิชา</th>
                    <th className="px-3 py-2">ชื่อวิชา</th>
                    <th className="px-3 py-2 text-center" title="คะแนนสอบ">คะแนน</th>
                    <th className="px-3 py-2 text-center" title="สรุปวิเคราะห์ข้อสอบ">สรุปฯ</th>
                    <th className="px-3 py-2 text-center" title="วิเคราะห์ข้อสอบรายข้อ">รายข้อ</th>
                  </tr>
                </thead>
                <tbody>
                  {midtermExams.map((e, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{e.level}</td>
                      <td className="px-3 py-2">{e.subject_code}</td>
                      <td className="px-3 py-2">{e.subject_name}</td>
                      <td className="px-3 py-2 text-center">{renderPdfIcon(e.results?.score_url, "คะแนนสอบ")}</td>
                      <td className="px-3 py-2 text-center">{renderPdfIcon(e.results?.summary_url, "สรุปวิเคราะห์ข้อสอบ")}</td>
                      <td className="px-3 py-2 text-center">{renderPdfIcon(e.results?.analysis_url, "วิเคราะห์ข้อสอบรายข้อ")}</td>
                    </tr>
                  ))}
                  {midtermExams.length === 0 && <tr><td colSpan="6" className="text-center py-4">ยังไม่มีผลการสอบกลางภาค</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* ตารางปลายภาค */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold font-kanit mb-4 text-green-800 border-b pb-2">สอบปลายภาค ({finalExams.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-green-50">
                  <tr>
                    <th className="px-3 py-2">ระดับชั้น</th>
                    <th className="px-3 py-2">รหัสวิชา</th>
                    <th className="px-3 py-2">ชื่อวิชา</th>
                    <th className="px-3 py-2 text-center" title="คะแนนสอบ">คะแนน</th>
                    <th className="px-3 py-2 text-center" title="สรุปวิเคราะห์ข้อสอบ">สรุปฯ</th>
                    <th className="px-3 py-2 text-center" title="วิเคราะห์ข้อสอบรายข้อ">รายข้อ</th>
                  </tr>
                </thead>
                <tbody>
                  {finalExams.map((e, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{e.level}</td>
                      <td className="px-3 py-2">{e.subject_code}</td>
                      <td className="px-3 py-2">{e.subject_name}</td>
                      <td className="px-3 py-2 text-center">{renderPdfIcon(e.results?.score_url, "คะแนนสอบ")}</td>
                      <td className="px-3 py-2 text-center">{renderPdfIcon(e.results?.summary_url, "สรุปวิเคราะห์ข้อสอบ")}</td>
                      <td className="px-3 py-2 text-center">{renderPdfIcon(e.results?.analysis_url, "วิเคราะห์ข้อสอบรายข้อ")}</td>
                    </tr>
                  ))}
                  {finalExams.length === 0 && <tr><td colSpan="6" className="text-center py-4">ยังไม่มีผลการสอบปลายภาค</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.RequestExamView = RequestExamView;
window.LatestStatusView = LatestStatusView;
window.PendingExamsView = PendingExamsView;
window.ExamResultsView = ExamResultsView;
