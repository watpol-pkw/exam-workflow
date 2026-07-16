const { useState, useEffect } = React;

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(window.appSettings || { academic_year: '-', term: '-' });

  useEffect(() => {
    if (!window.appSettings) {
      google.script.run.withSuccessHandler((data) => {
        setSettings(data);
        window.appSettings = data;
      }).getSettings();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    google.script.run.withSuccessHandler((res) => {
      setLoading(false);
      if (res.success) {
        onLogin(res.user);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบล้มเหลว',
          text: res.message,
          confirmButtonColor: '#2563eb'
        });
      }
    }).loginUser(username, password);
  };

  const handleTrackStatus = () => {
    Swal.fire({
      title: 'ติดตามสถานะข้อสอบ',
      text: 'กรุณากรอกรหัสติดตามข้อสอบของคุณ',
      input: 'text',
      inputPlaceholder: 'เช่น A001',
      showCancelButton: true,
      confirmButtonText: 'ค้นหา',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#2563eb',
      showLoaderOnConfirm: true,
      preConfirm: (code) => {
        if (!code) {
          Swal.showValidationMessage('กรุณากรอกรหัสติดตาม');
          return false;
        }
        return new Promise((resolve) => {
          google.script.run.withSuccessHandler(resolve).getExamByTrackingCode(code);
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        const res = result.value;
        if (res.success) {
          const ex = res.exam;
          
          // Remove PDF section

          Swal.fire({
            title: `<div class="flex items-center justify-center gap-2 text-blue-800"><i class="ph ph-magnifying-glass text-3xl"></i> ข้อมูลข้อสอบ</div>`,
            html: `
              <div class="text-left mt-2 text-gray-700 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                <div class="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span class="text-sm text-gray-500">รหัสติดตาม</span>
                  <span class="font-bold text-blue-700 text-lg">${ex.tracking_code}</span>
                </div>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div><span class="text-gray-500">รหัสวิชา:</span> <span class="font-semibold text-gray-800">${ex.subject_code}</span></div>
                  <div><span class="text-gray-500">ระดับชั้น:</span> <span class="font-semibold text-gray-800">${ex.level}</span></div>
                  <div class="col-span-2"><span class="text-gray-500">ชื่อวิชา:</span> <span class="font-semibold text-gray-800">${ex.subject_name}</span></div>
                  <div class="col-span-2"><span class="text-gray-500">ประเภทการสอบ:</span> <span class="font-semibold text-gray-800">${ex.exam_type}</span></div>
                </div>
                
                <div class="mt-5 p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md flex flex-col items-center justify-center text-white">
                  <span class="text-xs text-blue-200 uppercase tracking-wider mb-1">สถานะปัจจุบัน</span>
                  <span class="text-2xl font-bold text-center drop-shadow-md">${ex.status}</span>
                  <div class="mt-3 bg-white/20 px-3 py-1 rounded-full flex items-center gap-1 text-xs text-blue-50">
                    <i class="ph ph-clock"></i> <span>เวลา: ${new Date(ex.updated_at).toLocaleString('th-TH')}</span>
                  </div>
                </div>
              </div>

            `,
            width: '32em',
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'ปิด'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'ไม่พบข้อมูล',
            text: res.message,
            confirmButtonColor: '#2563eb'
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-pkw-dark flex items-center justify-center p-4 fade-in">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        <div className="hidden md:flex md:w-1/2 p-10 bg-pkw-dark text-white flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-900 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <i className="ph ph-files text-6xl mb-6 text-white opacity-90"></i>
              <h1 className="text-4xl font-bold font-kanit mb-2">ระบบติดตาม<br/>กระบวนการจัดสอบ</h1>
              <h2 className="text-2xl font-light text-blue-200 mb-3">Exam Workflow Tracking System</h2>
              
              <div className="mb-8">
                <span className="text-sm text-white font-medium bg-blue-800/80 px-4 py-1.5 rounded-full border border-blue-500/50 shadow-sm inline-flex items-center">
                  <i className="ph ph-calendar-blank mr-2"></i>
                  ภาคเรียนที่ {settings.term}/{settings.academic_year}
                </span>
              </div>
              
              <div className="h-1 w-16 bg-blue-500 rounded mb-8"></div>
              
              <p className="text-base text-gray-300 mb-2">งานวัดผลและประเมินผล กลุ่มบริหารวิชาการ</p>
              <p className="text-base text-gray-300 mb-10">โรงเรียนภูเก็ตวิทยาลัย | PKW</p>
              
              <ul className="space-y-4">
                <li className="flex items-start liquid-glass p-4 rounded-xl">
                  <div className="bg-white p-2.5 rounded-lg mr-4 mt-0.5 shadow-sm">
                    <i className="ph ph-calendar-plus text-2xl text-blue-600"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">แจ้งความประสงค์การจัดสอบ</span>
                    <span className="text-sm text-blue-100 mt-1">ทั้งการสอบกลางภาค สอบปลายภาค และการสอบนอกตาราง</span>
                  </div>
                </li>
                <li className="flex items-start liquid-glass p-4 rounded-xl">
                  <div className="bg-white p-2.5 rounded-lg mr-4 mt-0.5 shadow-sm">
                    <i className="ph ph-magnifying-glass text-2xl text-blue-600"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">ติดตามทุกขั้นตอน</span>
                    <span className="text-sm text-blue-100 mt-1">รู้ได้ทันทีว่าการจัดสอบดำเนินการถึงขั้นตอนใด</span>
                  </div>
                </li>
                <li className="flex items-start liquid-glass p-4 rounded-xl">
                  <div className="bg-white p-2.5 rounded-lg mr-4 mt-0.5 shadow-sm">
                    <i className="ph ph-chart-pie-slice text-2xl text-blue-600"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">รายงานผล</span>
                    <span className="text-sm text-blue-100 mt-1">ผู้บริหารนิเทศติดตามได้ง่าย</span>
                  </div>
                </li>
                <li className="flex items-start liquid-glass p-4 rounded-xl">
                  <div className="bg-white p-2.5 rounded-lg mr-4 mt-0.5 shadow-sm">
                    <i className="ph ph-devices text-2xl text-blue-600"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">ใช้ได้ทุกอุปกรณ์</span>
                    <span className="text-sm text-blue-100 mt-1">ได้ทั้งคอมพิวเตอร์และโทรศัพท์มือถือ</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 p-10 bg-white flex flex-col justify-center relative bg-gradient-to-br from-blue-50 to-white">
          
          {/* Mobile Header Block (Hidden on Desktop) */}
          <div className="md:hidden bg-gradient-to-br from-blue-700 to-blue-500 rounded-t-3xl -mx-10 -mt-10 mb-8 p-8 relative overflow-hidden text-center shadow-lg">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="flex justify-center items-center mb-4">
                <img src="https://img2.pic.in.th/Logo-PKW3.png" alt="PKW Logo" className="w-16 h-16 object-contain drop-shadow-md bg-white rounded-2xl p-1.5" />
              </div>
              <h1 className="text-xl font-bold font-kanit text-white mb-1 leading-tight drop-shadow-sm">ระบบติดตามกระบวนการจัดสอบ</h1>
              <h2 className="text-sm font-light text-blue-100 mb-4 drop-shadow-sm">โรงเรียนภูเก็ตวิทยาลัย</h2>
              <div className="inline-flex items-center justify-center border border-white/40 rounded-full px-5 py-1.5 bg-white/20 backdrop-blur-sm text-xs font-semibold text-white tracking-wider shadow-sm gap-1.5">
                <i className="ph ph-calendar-blank"></i>
                ภาคเรียนที่ {settings.term}/{settings.academic_year}
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <img src="https://img2.pic.in.th/Logo-PKW3.png" alt="PKW Logo" className="hidden md:block w-28 h-28 object-contain mx-auto mb-6 drop-shadow-md" />
            <h2 className="text-3xl font-bold text-gray-800 font-kanit">ยินดีต้อนรับ</h2>
            <p className="text-gray-500 text-base mt-2">เข้าสู่ระบบเพื่อดำเนินการ</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6 max-w-sm mx-auto w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <i className="ph ph-user text-gray-400 text-xl"></i>
              </div>
              <input 
                type="text" 
                className="bg-white border border-gray-300 text-gray-900 text-base rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 p-3.5 shadow-sm" 
                placeholder="Username" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required 
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <i className="ph ph-key text-gray-400 text-xl"></i>
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                className="bg-white border border-gray-300 text-gray-900 text-base rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-12 p-3.5 shadow-sm" 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 flex items-center pr-4"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`ph ${showPassword ? 'ph-eye-slash' : 'ph-eye'} text-gray-400 hover:text-gray-600 text-xl`}></i>
              </button>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-lg px-5 py-3.5 text-center flex justify-center items-center transition-all shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {loading ? (
                <svg className="animate-spin h-6 w-6 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <i className="ph-bold ph-check-circle mr-2 text-xl"></i>
              )}
              เข้าสู่ระบบ
            </button>
            
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">หรือ</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            <button 
              type="button" 
              onClick={handleTrackStatus}
              className="w-full text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 focus:ring-4 focus:outline-none focus:ring-blue-100 font-medium rounded-xl text-lg px-5 py-3.5 text-center flex justify-center items-center transition-all shadow-sm"
            >
              <i className="ph ph-magnifying-glass mr-2 text-xl"></i>
              ติดตามสถานะข้อสอบ
            </button>
          </form>
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-sm mx-auto md:max-w-none w-full">
             <div className="bg-white/40 backdrop-blur-md p-3 rounded-xl text-center border border-white/50 shadow-sm flex flex-col items-center justify-center">
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 shadow-inner">
                  <i className="ph ph-books text-blue-600 text-xl"></i>
               </div>
               <p className="text-xs font-medium text-gray-600">ม.ต้น - ม.ปลาย</p>
             </div>
             <div className="bg-white/40 backdrop-blur-md p-3 rounded-xl text-center border border-white/50 shadow-sm flex flex-col items-center justify-center">
               <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2 shadow-inner">
                  <i className="ph ph-exam text-purple-600 text-xl"></i>
               </div>
               <p className="text-xs font-medium text-gray-600">กลาง/ปลายภาค</p>
             </div>
             <div className="bg-white/40 backdrop-blur-md p-3 rounded-xl text-center border border-white/50 shadow-sm flex flex-col items-center justify-center">
               <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2 shadow-inner">
                  <i className="ph ph-clock-countdown text-orange-600 text-xl"></i>
               </div>
               <p className="text-xs font-medium text-gray-600">อัปเดต Real-time</p>
             </div>
             <div className="bg-white/40 backdrop-blur-md p-3 rounded-xl text-center border border-white/50 shadow-sm flex flex-col items-center justify-center">
               <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2 shadow-inner">
                  <i className="ph ph-shield-check text-emerald-600 text-xl"></i>
               </div>
               <p className="text-xs font-medium text-gray-600">ปลอดภัยสูง</p>
             </div>
          </div>
          
          <div className="mt-auto pt-10 text-center">
            <p className="text-xs text-gray-400">© ระบบติดตามกระบวนการจัดสอบ (Exam Workflow Tracking System)</p>
            <p className="text-xs text-gray-400">V3.6.0 (Firebase) งานวัดผลและประเมินผล โรงเรียนภูเก็ตวิทยาลัย</p>
          </div>
        </div>
        
      </div>
    </div>
  );
}

window.Login = Login;
