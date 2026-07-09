const { useState, useEffect } = React;

const DEPARTMENTS = [
  'ภาษาไทย', 'คณิตศาสตร์', 'วิทยาศาสตร์', 'สังคมศึกษาฯ', 
  'สุขศึกษาและพลศึกษา', 'ภาษาต่างประเทศ', 'English Program'
];

function SettingsView() {
  const [academicYear, setAcademicYear] = useState('');
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    google.script.run
      .withSuccessHandler((data) => {
        setAcademicYear(data.academic_year || '');
        setTerm(data.term || '');
        setLoading(false);
      })
      .withFailureHandler((err) => {
        setLoading(false);
        Swal.fire('เกิดข้อผิดพลาด', 'ดึงข้อมูลปีการศึกษาไม่สำเร็จ: ' + err.message, 'error');
      })
      .getSettings();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    google.script.run
      .withSuccessHandler((res) => {
        setLoading(false);
        if(res.success) {
          Swal.fire('สำเร็จ', res.message, 'success').then(() => {
             window.location.reload();
          });
        }
      })
      .withFailureHandler((err) => {
        setLoading(false);
        Swal.fire('เกิดข้อผิดพลาด', 'บันทึกข้อมูลไม่สำเร็จ: ' + err.message, 'error');
      })
      .updateSettings({ academic_year: academicYear, term: term });
  };

  if (loading) return <div className="text-center py-10">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 fade-in w-full">
      <h2 className="text-2xl font-bold font-kanit mb-6 text-gray-800 flex items-center">
        <i className="ph ph-calendar text-blue-600 mr-2 text-3xl"></i>
        กำหนดปีการศึกษาปัจจุบัน
      </h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
        <p className="text-sm text-blue-800">
          <strong>หมายเหตุ:</strong> ข้อมูลนี้จะถูกแสดงในการ์ดต้อนรับของทุกผู้ใช้งาน และการแจ้งจัดสอบ/รับข้อสอบ จะถูกบันทึกภายใต้ปีการศึกษาและภาคเรียนนี้เท่านั้น
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900">ปีการศึกษา (เช่น 2567)</label>
          <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" required value={academicYear} onChange={e=>setAcademicYear(e.target.value)} />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900">ภาคเรียน</label>
          <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" value={term} onChange={e=>setTerm(e.target.value)}>
            <option value="1">ภาคเรียนที่ 1</option>
            <option value="2">ภาคเรียนที่ 2</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center mt-4">
          บันทึกการตั้งค่า
        </button>
      </form>
    </div>
  );
}

function SubjectsView() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const DEPARTMENTS_ORDER = [
    'ภาษาไทย', 'คณิตศาสตร์', 'วิทยาศาสตร์', 'สังคมศึกษาฯ', 
    'สุขศึกษาและพลศึกษา', 'ภาษาต่างประเทศ', 'English Program'
  ];

  useEffect(() => {
    google.script.run
      .withSuccessHandler((data) => {
        const sortedData = data.sort((a, b) => {
          let indexA = DEPARTMENTS_ORDER.indexOf(a.department);
          let indexB = DEPARTMENTS_ORDER.indexOf(b.department);
          if (indexA === -1) indexA = 999;
          if (indexB === -1) indexB = 999;
          if (indexA !== indexB) return indexA - indexB;
          if (a.level !== b.level) return a.level.localeCompare(b.level);
          return a.subject_code.localeCompare(b.subject_code);
        });

        setSubjects(sortedData);
        setLoading(false);
      })
      .withFailureHandler((err) => {
        setLoading(false);
        Swal.fire('เกิดข้อผิดพลาด', 'ดึงข้อมูลรายวิชาไม่สำเร็จ: ' + err.message, 'error');
      })
      .getSubjects('all');
  }, []);

  const handleDownloadExcel = () => {
    if (subjects.length === 0) {
      Swal.fire('แจ้งเตือน', 'ไม่มีข้อมูลให้ดาวน์โหลด', 'warning');
      return;
    }
    const dataToExport = subjects.map(s => ({
      'กลุ่มสาระฯ': s.department,
      'รหัสวิชา': s.subject_code,
      'ชื่อวิชา': s.subject_name,
      'ชั้น': s.level,
      'ห้อง': s.rooms,
      'สอบกลางภาค': s.mid_time > 0 ? s.mid_time + ' นาที' : '-',
      'สอบปลายภาค': s.final_time > 0 ? s.final_time + ' นาที' : '-',
      'ประเภท': s.schedule_type
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "รายวิชาที่จัดสอบ");
    XLSX.writeFile(workbook, "รายวิชาที่จัดสอบ.xlsx");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-kanit text-gray-800 flex items-center">
          <i className="ph ph-books text-blue-600 mr-2 text-3xl"></i>
          รายวิชาที่จัดสอบ
        </h2>
        <button onClick={handleDownloadExcel} className="flex items-center text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <i className="ph ph-file-xls mr-2 text-lg"></i>
          Download Excel
        </button>
      </div>
      
      {loading ? <p>กำลังโหลดข้อมูลกรุณารอสักครู่...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">กลุ่มสาระฯ</th>
                <th className="px-4 py-3">รหัสวิชา</th>
                <th className="px-4 py-3">ชื่อวิชา</th>
                <th className="px-4 py-3">ชั้น</th>
                <th className="px-4 py-3">ห้อง</th>
                <th className="px-4 py-3">สอบกลางภาค</th>
                <th className="px-4 py-3">สอบปลายภาค</th>
                <th className="px-4 py-3">ประเภท</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => (
                <tr key={i} className="border-b hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-blue-700">{s.department}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.subject_code}</td>
                  <td className="px-4 py-3">{s.subject_name}</td>
                  <td className="px-4 py-3">{s.level}</td>
                  <td className="px-4 py-3">{s.rooms}</td>
                  <td className="px-4 py-3">{s.mid_time > 0 ? s.mid_time + ' นาที' : '-'}</td>
                  <td className="px-4 py-3">{s.final_time > 0 ? s.final_time + ' นาที' : '-'}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{s.schedule_type}</span>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && <tr><td colSpan="8" className="text-center py-4">ไม่มีข้อมูลในภาคเรียนนี้</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReceiveExamView() {
  const [allSubjects, setAllSubjects] = useState([]);
  const [receivedExams, setReceivedExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    tracking_code: '',
    subject_code: '',
    subject_name: '',
    level: '',
    exam_type: 'กลางภาค',
    objective_count: '',
    department: '',
    exam_date: ''
  });

  const fetchReceivedExams = () => {
    google.script.run.withSuccessHandler(data => {
      // Sort by tracking code
      data.sort((a, b) => a.tracking_code.localeCompare(b.tracking_code));
      setReceivedExams(data);
    }).getExams("all");
  };

  useEffect(() => {
    google.script.run.withSuccessHandler((data) => {
      setAllSubjects(data);
    }).getSubjects("all");
    fetchReceivedExams();
  }, []);

  const filteredSubjects = allSubjects.filter(s => 
    s.subject_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectSubject = (subject) => {
    setSearchTerm(subject.subject_code);
    setFormData({
      ...formData,
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      level: subject.level,
      department: subject.department
    });
    setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject_code || !formData.subject_name) {
      Swal.fire('แจ้งเตือน', 'กรุณาค้นหาและเลือกวิชาจากรายการก่อนครับ', 'warning');
      return;
    }
    google.script.run.withSuccessHandler((res) => {
      if(res.success) {
        Swal.fire('สำเร็จ', res.message, 'success');
        setSearchTerm('');
        setFormData({ tracking_code: '', subject_code: '', subject_name: '', level: '', exam_type: 'กลางภาค', objective_count: '', department: '', exam_date: '' });
        fetchReceivedExams();
      } else {
        Swal.fire('ข้อผิดพลาด', res.message, 'error');
      }
    }).saveExam(formData);
  };

  const handleEdit = (exam) => {
    Swal.fire({
      title: 'แก้ไขข้อมูลรับข้อสอบ',
      html: `
        <div class="space-y-4 text-left p-2">
          <div>
            <label class="block text-sm font-medium text-gray-700">รหัสติดตาม</label>
            <input id="swal-tracking" class="swal2-input !m-0 !w-full !mt-1" value="${exam.tracking_code}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">วันที่จัดสอบ</label>
            <input type="date" id="swal-date" class="swal2-input !m-0 !w-full !mt-1" value="${exam.exam_date}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">ประเภทการสอบ</label>
            <select id="swal-type" class="swal2-select !m-0 !w-full !mt-1 !text-base">
              <option value="กลางภาค" ${exam.exam_type === 'กลางภาค' ? 'selected' : ''}>กลางภาค</option>
              <option value="ปลายภาค" ${exam.exam_type === 'ปลายภาค' ? 'selected' : ''}>ปลายภาค</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">จำนวนข้อปรนัย (0 = ไม่ตรวจด้วยเครื่อง)</label>
            <input type="number" id="swal-obj" class="swal2-input !m-0 !w-full !mt-1" value="${exam.objective_count}">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      preConfirm: () => {
        return {
          tracking_code: document.getElementById('swal-tracking').value,
          exam_date: document.getElementById('swal-date').value,
          exam_type: document.getElementById('swal-type').value,
          objective_count: document.getElementById('swal-obj').value
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        google.script.run.withSuccessHandler(res => {
          if(res.success) {
            Swal.fire('สำเร็จ', res.message, 'success');
            fetchReceivedExams();
          } else {
            Swal.fire('ข้อผิดพลาด', res.message, 'error');
          }
        }).updateExamDetails(exam.id, result.value);
      }
    });
  };

  const handleDelete = (exam) => {
    Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบข้อมูลวิชา ${exam.subject_code} (รหัสติดตาม: ${exam.tracking_code}) ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        google.script.run.withSuccessHandler(res => {
          if(res.success) {
            Swal.fire('ลบสำเร็จ', res.message, 'success');
            fetchReceivedExams();
          } else {
            Swal.fire('ข้อผิดพลาด', res.message, 'error');
          }
        }).deleteExam(exam.id);
      }
    });
  };

  const handleExportExcel = () => {
    if(receivedExams.length === 0) {
      Swal.fire('แจ้งเตือน', 'ไม่มีข้อมูลให้ส่งออก', 'warning');
      return;
    }
    const wsData = receivedExams.map((e, index) => ({
      'ลำดับ': index + 1,
      'รหัสติดตาม': e.tracking_code,
      'รหัสวิชา': e.subject_code,
      'ชื่อวิชา': e.subject_name,
      'ระดับชั้น': e.level,
      'กลุ่มสาระฯ': e.department,
      'ประเภท': e.exam_type,
      'วันที่จัดสอบ': e.exam_date,
      'จำนวนข้อ(ปรนัย)': e.objective_count,
      'สถานะ': e.status,
      'วันที่บันทึก': new Date(e.created_at).toLocaleString('th-TH')
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ReceivedExams");
    XLSX.writeFile(wb, "received_exams.xlsx");
  };

  return (
    <div className="space-y-6 fade-in w-full">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold font-kanit mb-6 text-gray-800 flex items-center">
          <i className="ph ph-download-simple text-blue-600 mr-2 text-3xl"></i>
          รับข้อสอบจากครูผู้สอน
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-900">ค้นหารหัสวิชา / ชื่อวิชา (เลือกจากระบบ)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="ph ph-magnifying-glass text-gray-400 text-lg"></i>
              </div>
              <input 
                type="text" 
                className="bg-blue-50 border border-blue-300 text-blue-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5" 
                placeholder="พิมพ์ค้นหา เช่น ว30..."
                value={searchTerm} 
                onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
            </div>
            {showDropdown && searchTerm && (
              <div className="absolute z-10 w-full bg-white rounded-md shadow-lg border border-gray-200 mt-1 max-h-60 overflow-y-auto">
                {filteredSubjects.length > 0 ? (
                  <ul className="text-sm text-gray-700">
                    {filteredSubjects.map(subject => (
                      <li key={subject.id} 
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleSelectSubject(subject)}>
                        <div className="font-bold text-blue-700">{subject.subject_code}</div>
                        <div className="text-gray-500">{subject.subject_name} ({subject.level}) - {subject.department}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">ไม่พบรายวิชานี้ (อาจยังไม่ได้แจ้งความประสงค์)</div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-500">รหัสวิชา (ล็อค)</label>
              <input type="text" readOnly className="bg-gray-100 border border-gray-300 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" 
                value={formData.subject_code} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-500">ชื่อวิชา (ล็อค)</label>
              <input type="text" readOnly className="bg-gray-100 border border-gray-300 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" 
                value={formData.subject_name} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-500">ระดับชั้น (ล็อค)</label>
              <input type="text" readOnly className="bg-gray-100 border border-gray-300 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" 
                value={formData.level} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-500">กลุ่มสาระฯ (ล็อค)</label>
              <input type="text" readOnly className="bg-gray-100 border border-gray-300 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" 
                value={formData.department} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">รหัสติดตาม (Tracking Code)</label>
              <input type="text" required className="bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" 
                placeholder="เช่น A001"
                value={formData.tracking_code} onChange={e=>setFormData({...formData, tracking_code: e.target.value})} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">วันที่จัดสอบ</label>
              <input type="date" required className="bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" 
                value={formData.exam_date} onChange={e=>setFormData({...formData, exam_date: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">ประเภทการสอบ</label>
              <select className="bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" 
                value={formData.exam_type} onChange={e=>setFormData({...formData, exam_type: e.target.value})}>
                <option value="กลางภาค">กลางภาค</option>
                <option value="ปลายภาค">ปลายภาค</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">จำนวนข้อสอบตรวจด้วยเครื่องตรวจ</label>
              <input type="number" required className="bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" 
                value={formData.objective_count} onChange={e=>setFormData({...formData, objective_count: e.target.value})} />
            </div>
          </div>
          
          <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full px-5 py-3 text-center mt-6 transition shadow-md">
            บันทึกรับข้อสอบเข้าระบบ
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold font-kanit text-gray-800 flex items-center">
            <i className="ph ph-list-bullets text-blue-600 mr-2 text-xl"></i>
            รายการข้อสอบที่รับแล้วในภาคเรียนนี้ ({receivedExams.length})
          </h3>
          <button onClick={handleExportExcel} className="text-sm flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm">
            <i className="ph ph-file-xls mr-1.5 text-lg"></i> Download Excel
          </button>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 whitespace-nowrap">
              <tr>
                <th className="px-4 py-3">รหัสติดตาม</th>
                <th className="px-4 py-3">รหัสวิชา</th>
                <th className="px-4 py-3">ชื่อวิชา</th>
                <th className="px-4 py-3">ชั้น</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3">วันที่จัดสอบ</th>
                <th className="px-4 py-3 text-center">ปรนัย (ข้อ)</th>
                <th className="px-4 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {receivedExams.length > 0 ? receivedExams.map((exam, i) => (
                <tr key={exam.id || i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-blue-600">{exam.tracking_code}</td>
                  <td className="px-4 py-3">{exam.subject_code}</td>
                  <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{exam.subject_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{exam.level}</td>
                  <td className="px-4 py-3">{exam.exam_type}</td>
                  <td className="px-4 py-3">{exam.exam_date}</td>
                  <td className="px-4 py-3 text-center">
                    {exam.objective_count == 0 
                      ? <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">ไม่ใช้เครื่องตรวจ</span> 
                      : exam.objective_count}
                  </td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button onClick={() => handleEdit(exam)} title="แก้ไขข้อมูล" className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition">
                      <i className="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button onClick={() => handleDelete(exam)} title="ลบข้อมูล" className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded transition">
                      <i className="ph ph-trash text-lg"></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    ยังไม่มีรายการข้อสอบในภาคเรียนนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UpdateStatusView({ mode }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const title = mode === 'prepare' ? "เตรียมความพร้อมก่อนจัดสอบ" : "ขั้นตอนการจัดสอบ";
  const icon = mode === 'prepare' ? "ph-copy" : "ph-exam";
  const validStatuses = mode === 'prepare' 
    ? ["ตรวจสอบความถูกต้อง", "กำลังอัดสำเนา", "อัดสำเนาเสร็จสิ้น"]
    : ["จัดเก็บข้อสอบ", "จัดสอบ", "กำลังตรวจข้อสอบ"];
    
  const getNextStatus = (currentStatus) => {
    if (currentStatus === "ตรวจสอบความถูกต้อง") return "กำลังอัดสำเนา";
    if (currentStatus === "กำลังอัดสำเนา") return "อัดสำเนาเสร็จสิ้น";
    if (currentStatus === "อัดสำเนาเสร็จสิ้น") return "จัดเก็บข้อสอบ";
    if (currentStatus === "จัดเก็บข้อสอบ") return "จัดสอบ";
    if (currentStatus === "จัดสอบ") return "กำลังตรวจข้อสอบ";
    if (currentStatus === "กำลังตรวจข้อสอบ") return "ตรวจข้อสอบเสร็จสิ้น";
    return null;
  };

  const loadExams = () => {
    setLoading(true);
    google.script.run.withSuccessHandler((data) => {
      setExams(data.filter(e => validStatuses.includes(e.status)));
      setLoading(false);
    }).getExams('all');
  };

  useEffect(() => { loadExams(); }, [mode]);

  const updateStatus = (code, status) => {
    Swal.fire({
      title: 'อัปเดตสถานะ?',
      text: `เปลี่ยนสถานะเป็น: ${status}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'อัปเดต',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        google.script.run.withSuccessHandler((res) => {
          if(res.success) {
            Swal.fire('สำเร็จ', res.message, 'success');
            loadExams();
          }
        }).updateExamStatus(code, status);
      }
    });
  };

  const handleEditExam = (e) => {
    Swal.fire({
      title: 'แก้ไขข้อมูลการจัดสอบ',
      html: `
        <div class="text-left space-y-4 mt-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสติดตาม</label>
            <input id="e-tracking" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="${e.tracking_code}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสวิชา</label>
            <input id="e-code" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="${e.subject_code}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อวิชา</label>
            <input id="e-name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="${e.subject_name}">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">จำนวนข้อสอบ (ฉบับ)</label>
              <input id="e-obj" type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="${e.objective_count || ''}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">วันที่จัดสอบ</label>
              <input id="e-date" type="date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="${e.exam_date || ''}">
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#2563eb',
      width: '28rem',
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
          id: e.id,
          tracking_code: document.getElementById('e-tracking').value,
          subject_code: document.getElementById('e-code').value,
          subject_name: document.getElementById('e-name').value,
          objective_count: document.getElementById('e-obj').value,
          exam_date: document.getElementById('e-date').value
        };
      }
    }).then(res => {
      if (res.isConfirmed) {
        google.script.run.withSuccessHandler((r) => {
          if(r.success) {
            Swal.fire('สำเร็จ', r.message, 'success');
            loadExams();
          } else {
             Swal.fire('ข้อผิดพลาด', r.message, 'error');
          }
        }).updateExamDetails(res.value.id, res.value);
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 fade-in">
      <h2 className="text-2xl font-bold font-kanit mb-6 text-gray-800 flex items-center">
        <i className={`ph ${icon} text-blue-600 mr-2 text-3xl`}></i>
        {title}
      </h2>
      
      {loading ? <p>กำลังโหลด...</p> : (
        <div className="space-y-8">
          {Object.entries(
            exams.reduce((acc, e) => {
              const date = e.exam_date || 'ไม่ระบุวันที่';
              if (!acc[date]) acc[date] = [];
              acc[date].push(e);
              return acc;
            }, {})
          ).sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).map(([date, dateExams]) => (
            <div key={date}>
              <h3 className="text-xl font-bold text-blue-800 mb-4 border-b pb-2">
                <i className="ph ph-calendar-blank mr-2"></i>
                {date === 'ไม่ระบุวันที่' ? date : new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">รหัสติดตาม</th>
                      <th className="px-4 py-3">รหัส/ชื่อวิชา</th>
                      <th className="px-4 py-3">ชั้น</th>
                      <th className="px-4 py-3">ประเภท</th>
                      <th className="px-4 py-3">สถานะปัจจุบัน</th>
                      <th className="px-4 py-3 text-right">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateExams.sort((a,b) => (a.tracking_code || '').localeCompare(b.tracking_code || '', 'th', {numeric: true})).map((e, i) => {
                      const nextStatus = getNextStatus(e.status);
                      return (
                      <tr key={i} className="border-b hover:bg-blue-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap"><i className="ph ph-barcode mr-1 text-gray-400"></i> {e.tracking_code}</td>
                        <td className="px-4 py-3"><span className="font-bold text-blue-700">{e.subject_code}</span><br/><span className="text-gray-600">{e.subject_name}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">{e.level}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap">{e.exam_type} <span className="text-xs text-gray-400">({e.department})</span></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="bg-white text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-300 shadow-sm">{e.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {nextStatus && (
                            <button onClick={() => updateStatus(e.tracking_code, nextStatus)} className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-xs px-3 py-1.5 transition-colors shadow-sm inline-flex items-center mr-2">
                              อัปเดตเป็น: {nextStatus} <i className="ph-bold ph-arrow-right ml-1.5"></i>
                            </button>
                          )}
                          <button onClick={() => handleEditExam(e)} className="text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-xs px-2.5 py-1.5 transition-colors shadow-sm inline-flex items-center">
                            <i className="ph ph-pencil-simple mr-1"></i> แก้ไข
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {exams.length === 0 && <div className="text-center py-8 text-gray-500 w-full">ไม่มีรายการในหมวดหมู่นี้</div>}
        </div>
      )}
    </div>
  );
}

function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ id: '', username: '', password: '', role: 'head', name: '', department: DEPARTMENTS[0] });

  const loadUsers = () => {
    setLoading(true);
    google.script.run.withSuccessHandler((data) => {
      setUsers(data);
      setLoading(false);
    }).getUsers();
  };

  useEffect(() => { loadUsers(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    google.script.run.withSuccessHandler((res) => {
      Swal.fire('สำเร็จ', res.message, 'success');
      setFormData({ id: '', username: '', password: '', role: 'head', name: '', department: DEPARTMENTS[0] });
      loadUsers();
    }).saveUser(formData);
  };

  const handleEdit = (u) => {
    setFormData({ ...u, password: '' });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบข้อมูล'
    }).then((result) => {
      if (result.isConfirmed) {
        google.script.run.withSuccessHandler(() => {
          Swal.fire('ลบแล้ว!', '', 'success');
          loadUsers();
        }).deleteUser(id);
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 fade-in">
      <h2 className="text-2xl font-bold font-kanit mb-6 text-gray-800 flex items-center">
        <i className="ph ph-users text-blue-600 mr-2 text-3xl"></i>
        จัดการผู้ใช้งาน
      </h2>
      
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="font-bold mb-4">{formData.id ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" required placeholder="Username" className="p-2 border rounded" value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} />
          <input type={formData.id ? "password" : "text"} placeholder={formData.id ? "รหัสผ่านใหม่ (เว้นว่างเพื่อใช้รหัสเดิม)" : "รหัสผ่าน"} className="p-2 border rounded" required={!formData.id} value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} />
          <input type="text" required placeholder="ชื่อ-นามสกุล / ชื่อผู้ใช้" className="p-2 border rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
          <select className="p-2 border rounded" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})}>
            <option value="admin">Admin (งานวัดผล)</option>
            <option value="academic">Academic (งานวิชาการ)</option>
            <option value="head">Head (หัวหน้ากลุ่มสาระฯ)</option>
          </select>
          <select className="p-2 border rounded" value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})}>
            <option value="งานวัดผล">งานวัดผล</option>
            <option value="งานวิชาการ">งานวิชาการ</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{formData.id ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}</button>
          {formData.id && <button type="button" onClick={() => setFormData({ id: '', username: '', password: '', role: 'head', name: '', department: DEPARTMENTS[0] })} className="bg-gray-400 text-white px-4 py-2 rounded">ยกเลิก</button>}
        </div>
      </form>

      {loading ? <p>กำลังโหลด...</p> : (
        <table className="w-full text-sm text-left text-gray-500 border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Username</th>
              <th className="p-2">ชื่อ</th>
              <th className="p-2">Role</th>
              <th className="p-2">แผนก/กลุ่มสาระ</th>
              <th className="p-2 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.department}</td>
                <td className="p-2 flex justify-center gap-2">
                  <button onClick={() => handleEdit(u)} className="text-blue-600"><i className="ph ph-pencil-simple"></i></button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-600"><i className="ph ph-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const FileUploadZone = ({ id, label, currentUrl, onFileSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
      onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
    >
      <p className="text-sm font-medium mb-2 text-gray-700">{label}</p>
      {currentUrl && !file && <a href={currentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 block mb-3 hover:underline"><i className="ph ph-check-circle text-green-500 mr-1"></i>อัปโหลดแล้ว (คลิกดูไฟล์)</a>}
      {file && <p className="text-xs text-green-600 mb-3 font-medium truncate px-2" title={file.name}><i className="ph ph-file-pdf mr-1"></i>{file.name}</p>}
      
      <label htmlFor={id} className="cursor-pointer bg-white border border-gray-300 text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors shadow-sm inline-block font-medium text-gray-700">
        เลือกไฟล์ หรือลากวาง
      </label>
      <input id={id} type="file" accept=".pdf" className="hidden" onChange={handleChange} />
    </div>
  );
};

function SubmitResultsView() {
  const [allExams, setAllExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const [midtermExam, setMidtermExam] = useState(null);
  const [finalExam, setFinalExam] = useState(null);
  
  const [midtermFiles, setMidtermFiles] = useState({});
  const [finalFiles, setFinalFiles] = useState({});
  
  const [uploading, setUploading] = useState(false);
  
  const GAS_UPLOAD_URL = "https://script.google.com/macros/s/AKfycbw-apNGRz-tNGfycrzns1ito9pqiNnBVvy0hJ-j4-rBvLmMIzQL6puhvnpXmoFfIeI-/exec"; 

  useEffect(() => {
    google.script.run.withSuccessHandler((data) => {
      setAllExams(data);
    }).getExams("all");
  }, []);

  // กรองเฉพาะชื่อวิชาที่ไม่ซ้ำ
  const uniqueSubjects = [];
  const map = new Map();
  for (const exam of allExams) {
    const key = exam.subject_code + '-' + exam.level;
    if (!map.has(key)) {
      map.set(key, true);
      uniqueSubjects.push(exam);
    }
  }

  const filteredSubjects = uniqueSubjects.filter(s => 
    (s.subject_code && s.subject_code.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (s.subject_name && s.subject_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectSubject = (subject) => {
    setSearchTerm(`${subject.subject_code} ${subject.subject_name} (${subject.level})`);
    setSelectedSubject(subject);
    setShowDropdown(false);
    
    // ค้นหาวิชา กลางภาค และ ปลายภาค ของวิชานี้
    const m = allExams.find(e => e.subject_code === subject.subject_code && e.level === subject.level && e.exam_type === 'กลางภาค');
    const f = allExams.find(e => e.subject_code === subject.subject_code && e.level === subject.level && e.exam_type === 'ปลายภาค');
    
    setMidtermExam(m);
    setFinalExam(f);
    setMidtermFiles({});
    setFinalFiles({});
  };

  const uploadFile = (exam, file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result.split(',')[1];
        const formData = new URLSearchParams();
        formData.append('filename', exam.tracking_code + "_" + file.name);
        formData.append('mimeType', file.type);
        formData.append('base64', base64Data);
        // เพิ่มข้อมูลสำหรับสร้างโฟลเดอร์ย่อย
        formData.append('academic_year', exam.academic_year || '');
        formData.append('term', exam.term || '');
        formData.append('exam_type', exam.exam_type || '');
        formData.append('department', exam.department || '');

        try {
          const response = await fetch(GAS_UPLOAD_URL, {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (result.success) {
            resolve(result.url);
          } else {
            reject(new Error(result.error || "Upload failed"));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasMidtermFiles = Object.keys(midtermFiles).length > 0;
    const hasFinalFiles = Object.keys(finalFiles).length > 0;
    
    if (!hasMidtermFiles && !hasFinalFiles) {
      Swal.fire('แจ้งเตือน', 'กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์', 'warning');
      return;
    }

    setUploading(true);
    let successCount = 0;
    
    try {
      // อัปโหลดฝั่งกลางภาค
      if (midtermExam && hasMidtermFiles) {
        let resultsData = midtermExam.results || {};
        if (midtermFiles.score) resultsData.score_url = await uploadFile(midtermExam, midtermFiles.score);
        if (midtermFiles.summary) resultsData.summary_url = await uploadFile(midtermExam, midtermFiles.summary);
        if (midtermFiles.analysis) resultsData.analysis_url = await uploadFile(midtermExam, midtermFiles.analysis);
        
        await new Promise((resolve) => {
          google.script.run.withSuccessHandler(() => {
            successCount++; resolve();
          }).saveExamResults(midtermExam.id, resultsData);
        });
      }
      
      // อัปโหลดฝั่งปลายภาค
      if (finalExam && hasFinalFiles) {
        let resultsData = finalExam.results || {};
        if (finalFiles.score) resultsData.score_url = await uploadFile(finalExam, finalFiles.score);
        if (finalFiles.summary) resultsData.summary_url = await uploadFile(finalExam, finalFiles.summary);
        if (finalFiles.analysis) resultsData.analysis_url = await uploadFile(finalExam, finalFiles.analysis);
        
        await new Promise((resolve) => {
          google.script.run.withSuccessHandler(() => {
            successCount++; resolve();
          }).saveExamResults(finalExam.id, resultsData);
        });
      }
      
      setUploading(false);
      Swal.fire('สำเร็จ', 'อัปโหลดและบันทึกผลการสอบเรียบร้อยแล้ว', 'success');
      
      // Refresh by fetching again
      google.script.run.withSuccessHandler((data) => {
        setAllExams(data);
        handleSelectSubject(selectedSubject); // trigger re-render of current view
      }).getExams("all");
      
    } catch (error) {
      setUploading(false);
      Swal.fire('อัปโหลดล้มเหลว', error.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์', 'error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 fade-in">
      <h2 className="text-2xl font-bold font-kanit mb-6 text-gray-800 flex items-center">
        <i className="ph ph-upload-simple text-blue-600 mr-2 text-3xl"></i>
        ส่งผลการสอบ (Upload PDF)
      </h2>
      
      <div className="relative max-w-lg mb-8">
        <label className="block mb-2 text-sm font-medium text-gray-900">ค้นหาวิชา</label>
        <div className="flex relative">
          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-l-md border-gray-300">
            <i className="ph ph-magnifying-glass"></i>
          </span>
          <input 
            type="text" 
            className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5" 
            placeholder="ค้นหาด้วยรหัสวิชา หรือชื่อวิชา..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
              if (selectedSubject && e.target.value !== `${selectedSubject.subject_code} ${selectedSubject.subject_name} (${selectedSubject.level})`) {
                setSelectedSubject(null);
                setMidtermExam(null);
                setFinalExam(null);
              }
            }}
            onFocus={() => setShowDropdown(true)}
          />
        </div>
        
        {showDropdown && searchTerm && !selectedSubject && (
          <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((s, i) => (
                <div 
                  key={i} 
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 flex flex-col"
                  onClick={() => handleSelectSubject(s)}
                >
                  <span className="font-bold text-blue-700">{s.subject_code} {s.subject_name}</span>
                  <span className="text-xs text-gray-500">ระดับชั้น: {s.level} | กลุ่มสาระฯ: {s.department}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">ไม่พบวิชาที่ค้นหา</div>
            )}
          </div>
        )}
      </div>

      {selectedSubject && (midtermExam || finalExam) && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* การ์ดสอบกลางภาค */}
            <div className={`p-6 rounded-2xl border-2 ${midtermExam ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
              <h3 className="text-xl font-bold font-kanit mb-4 text-blue-800 flex items-center">
                <i className="ph ph-file-dashed mr-2"></i>สอบกลางภาค
              </h3>
              {!midtermExam ? (
                <p className="text-gray-500 text-sm italic text-center py-10">วิชานี้ไม่มีการสอบกลางภาคในระบบ</p>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4 bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                    <p><span className="font-medium">รหัสติดตาม:</span> {midtermExam.tracking_code}</p>
                    <p><span className="font-medium">สถานะข้อสอบ:</span> <span className="text-blue-600">{midtermExam.status}</span></p>
                  </div>
                  
                  <FileUploadZone 
                    id="mid_score" label="1. ไฟล์คะแนนสอบ" 
                    currentUrl={midtermExam.results?.score_url} 
                    onFileSelected={(f) => setMidtermFiles(prev => ({...prev, score: f}))} 
                  />
                  <FileUploadZone 
                    id="mid_summary" label="2. ไฟล์สรุปวิเคราะห์ข้อสอบ" 
                    currentUrl={midtermExam.results?.summary_url} 
                    onFileSelected={(f) => setMidtermFiles(prev => ({...prev, summary: f}))} 
                  />
                  <FileUploadZone 
                    id="mid_analysis" label="3. ไฟล์วิเคราะห์ข้อสอบรายข้อ" 
                    currentUrl={midtermExam.results?.analysis_url} 
                    onFileSelected={(f) => setMidtermFiles(prev => ({...prev, analysis: f}))} 
                  />
                </div>
              )}
            </div>

            {/* การ์ดสอบปลายภาค */}
            <div className={`p-6 rounded-2xl border-2 ${finalExam ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
              <h3 className="text-xl font-bold font-kanit mb-4 text-green-800 flex items-center">
                <i className="ph ph-file-dashed mr-2"></i>สอบปลายภาค
              </h3>
              {!finalExam ? (
                <p className="text-gray-500 text-sm italic text-center py-10">วิชานี้ไม่มีการสอบปลายภาคในระบบ</p>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4 bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                    <p><span className="font-medium">รหัสติดตาม:</span> {finalExam.tracking_code}</p>
                    <p><span className="font-medium">สถานะข้อสอบ:</span> <span className="text-green-600">{finalExam.status}</span></p>
                  </div>
                  
                  <FileUploadZone 
                    id="final_score" label="1. ไฟล์คะแนนสอบ" 
                    currentUrl={finalExam.results?.score_url} 
                    onFileSelected={(f) => setFinalFiles(prev => ({...prev, score: f}))} 
                  />
                  <FileUploadZone 
                    id="final_summary" label="2. ไฟล์สรุปวิเคราะห์ข้อสอบ" 
                    currentUrl={finalExam.results?.summary_url} 
                    onFileSelected={(f) => setFinalFiles(prev => ({...prev, summary: f}))} 
                  />
                  <FileUploadZone 
                    id="final_analysis" label="3. ไฟล์วิเคราะห์ข้อสอบรายข้อ" 
                    currentUrl={finalExam.results?.analysis_url} 
                    onFileSelected={(f) => setFinalFiles(prev => ({...prev, analysis: f}))} 
                  />
                </div>
              )}
            </div>

          </div>
          
          <div className="flex justify-center border-t border-gray-200 pt-6">
            <button type="submit" disabled={uploading || (Object.keys(midtermFiles).length === 0 && Object.keys(finalFiles).length === 0)} className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-xl text-lg px-8 py-3.5 text-center disabled:opacity-50 flex justify-center items-center shadow-md transition-all hover:shadow-lg">
              {uploading ? (
                <><i className="ph ph-spinner animate-spin mr-2 text-2xl"></i> กำลังอัปโหลดข้อมูล...</>
              ) : (
                <><i className="ph ph-upload-simple mr-2 text-2xl"></i> บันทึกผลการสอบทั้งหมด</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

window.SettingsView = SettingsView;
window.SubjectsView = SubjectsView;
window.ReceiveExamView = ReceiveExamView;
window.UpdateStatusView = UpdateStatusView;
window.UserManagementView = UserManagementView;
window.SubmitResultsView = SubmitResultsView;

function SystemSettingsView() {
  return (
    <div className="space-y-6">
      <SettingsView />
      <UserManagementView />
    </div>
  );
}
window.SystemSettingsView = SystemSettingsView;
