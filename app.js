
(function() {
  const appCode = `const { useState, useEffect, useRef } = React;


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', margin: '20px', borderRadius: '8px', fontFamily: 'monospace' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>React Component Error</h2>
          <p>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ marginTop: '10px', fontSize: '12px', overflowX: 'auto' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Login.jsx ---


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
            title: \`<div class="flex items-center justify-center gap-2 text-blue-800"><i class="ph ph-magnifying-glass text-3xl"></i> ข้อมูลข้อสอบ</div>\`,
            html: \`
              <div class="text-left mt-2 text-gray-700 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                <div class="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span class="text-sm text-gray-500">รหัสติดตาม</span>
                  <span class="font-bold text-blue-700 text-lg">\${ex.tracking_code}</span>
                </div>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div><span class="text-gray-500">รหัสวิชา:</span> <span class="font-semibold text-gray-800">\${ex.subject_code}</span></div>
                  <div><span class="text-gray-500">ระดับชั้น:</span> <span class="font-semibold text-gray-800">\${ex.level}</span></div>
                  <div class="col-span-2"><span class="text-gray-500">ชื่อวิชา:</span> <span class="font-semibold text-gray-800">\${ex.subject_name}</span></div>
                  <div class="col-span-2"><span class="text-gray-500">ประเภทการสอบ:</span> <span class="font-semibold text-gray-800">\${ex.exam_type}</span></div>
                </div>
                
                <div class="mt-5 p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md flex flex-col items-center justify-center text-white">
                  <span class="text-xs text-blue-200 uppercase tracking-wider mb-1">สถานะปัจจุบัน</span>
                  <span class="text-2xl font-bold text-center drop-shadow-md">\${ex.status}</span>
                  <div class="mt-3 bg-white/20 px-3 py-1 rounded-full flex items-center gap-1 text-xs text-blue-50">
                    <i class="ph ph-clock"></i> <span>เวลา: \${new Date(ex.updated_at).toLocaleString('th-TH')}</span>
                  </div>
                </div>
              </div>

            \`,
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
                <i className={\`ph \${showPassword ? 'ph-eye-slash' : 'ph-eye'} text-gray-400 hover:text-gray-600 text-xl\`}></i>
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

// --- Dashboard.jsx ---


function DonutChart({ id, series, labels, title, color, count }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
       chartInstance.current.destroy();
    }

    const options = {
      series: series,
      chart: {
        type: 'donut',
        height: 250,
        fontFamily: 'Kanit, sans-serif'
      },
      labels: labels,
      colors: [color, '#e2e8f0'],
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: { show: false },
              value: {
                show: true,
                fontSize: '24px',
                fontWeight: 600,
                color: '#1e293b',
                formatter: function (val) {
                  return val + "%";
                }
              },
              total: {
                show: true,
                showAlways: true,
                label: '',
                formatter: function (w) {
                  return series[0] + "%";
                }
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: { width: 0 },
      legend: { show: false },
      tooltip: { enabled: true }
    };

    chartInstance.current = new ApexCharts(chartRef.current, options);
    chartInstance.current.render();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [series, labels, color]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
      <h3 className="text-sm font-medium text-gray-500 mb-2 w-full text-center">{title}</h3>
      <div ref={chartRef} className="w-full flex justify-center"></div>
      <div className="mt-2 text-center w-full">
         <span className="text-xl font-bold text-gray-800">{count} วิชา</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, colorClass, bgClass }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
      <div className={\`p-4 rounded-xl \${bgClass} mr-4\`}>
        <i className={\`ph \${icon} text-3xl \${colorClass}\`}></i>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function DashboardView({ user }) {
  const [stats, setStats] = React.useState(null);
  const [settings, setSettings] = React.useState({ academic_year: '-', term: '-' });
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    let dept = "all";
    if (user.role === 'head') {
      dept = user.department;
    }
    
    google.script.run.withSuccessHandler((res) => {
      setSettings(res);
      google.script.run.withSuccessHandler((statsRes) => {
        setStats(statsRes);
        setLoading(false);
      }).getDashboardStats(dept);
    }).getSettings();
  }, [user]);

  if (loading || !stats) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const calcPercent = (val, total) => {
    if (total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  return (
    <div className="fade-in space-y-6">
      
      <div className="bg-gradient-to-r from-blue-900 to-blue-600 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-20 transform translate-x-4 -translate-y-12">
           <i className="ph-fill ph-student text-[12rem]"></i>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold font-kanit mb-2">ยินดีต้อนรับ, {user.name}</h2>
          <p className="text-blue-100 mb-4">ดูภาพรวมความคืบหน้าการจัดสอบของคุณในหน้าต่างเดียว</p>
          <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-4 py-2">
            <span className="font-semibold">ปีการศึกษา:</span> {settings.academic_year} | <span className="font-semibold">ภาคเรียนที่:</span> {settings.term}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="วิชาที่ต้องจัดสอบทั้งหมด" 
          value={stats.total_subjects} 
          icon="ph-books" 
          colorClass="text-blue-600" 
          bgClass="bg-blue-100" 
        />
        <StatCard 
          title="ส่งต้นฉบับ กลางภาค" 
          value={stats.midterm_submitted} 
          icon="ph-file-text" 
          colorClass="text-purple-600" 
          bgClass="bg-purple-100" 
        />
        <StatCard 
          title="ส่งต้นฉบับ ปลายภาค" 
          value={stats.final_submitted} 
          icon="ph-file-doc" 
          colorClass="text-emerald-600" 
          bgClass="bg-emerald-100" 
        />
      </div>

      <h3 className="text-xl font-bold text-gray-800 font-kanit mt-8 mb-4 border-b pb-2 border-gray-200">
        <i className="ph ph-exam text-blue-600 mr-2"></i>ภาพรวมความคืบหน้า (กลางภาค)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DonutChart 
          id="mid_chart1" 
          series={[calcPercent(stats.midterm.copied, stats.total_midterm_subjects), 100 - calcPercent(stats.midterm.copied, stats.total_midterm_subjects)]} 
          labels={['ทำสำเนาเสร็จแล้ว', 'ยังไม่เสร็จ']} 
          title="การทำสำเนา (กลางภาค)" 
          color="#3b82f6" 
          count={stats.midterm.copied}
        />
        <DonutChart 
          id="mid_chart2" 
          series={[calcPercent(stats.midterm.tested, stats.total_midterm_subjects), 100 - calcPercent(stats.midterm.tested, stats.total_midterm_subjects)]} 
          labels={['จัดสอบแล้ว', 'ยังไม่จัดสอบ']} 
          title="การจัดสอบ (กลางภาค)" 
          color="#f59e0b" 
          count={stats.midterm.tested}
        />
        <DonutChart 
          id="mid_chart3" 
          series={[calcPercent(stats.midterm.graded, stats.total_midterm_subjects), 100 - calcPercent(stats.midterm.graded, stats.total_midterm_subjects)]} 
          labels={['ตรวจปรนัยเสร็จแล้ว', 'ยังไม่เสร็จ']} 
          title="การตรวจข้อสอบ (กลางภาค)" 
          color="#10b981" 
          count={stats.midterm.graded}
        />
      </div>

      <h3 className="text-xl font-bold text-gray-800 font-kanit mt-8 mb-4 border-b pb-2 border-gray-200">
        <i className="ph ph-exam text-emerald-600 mr-2"></i>ภาพรวมความคืบหน้า (ปลายภาค)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DonutChart 
          id="fin_chart1" 
          series={[calcPercent(stats.final.copied, stats.total_final_subjects), 100 - calcPercent(stats.final.copied, stats.total_final_subjects)]} 
          labels={['ทำสำเนาเสร็จแล้ว', 'ยังไม่เสร็จ']} 
          title="การทำสำเนา (ปลายภาค)" 
          color="#3b82f6" 
          count={stats.final.copied}
        />
        <DonutChart 
          id="fin_chart2" 
          series={[calcPercent(stats.final.tested, stats.total_final_subjects), 100 - calcPercent(stats.final.tested, stats.total_final_subjects)]} 
          labels={['จัดสอบแล้ว', 'ยังไม่จัดสอบ']} 
          title="การจัดสอบ (ปลายภาค)" 
          color="#f59e0b" 
          count={stats.final.tested}
        />
        <DonutChart 
          id="fin_chart3" 
          series={[calcPercent(stats.final.graded, stats.total_final_subjects), 100 - calcPercent(stats.final.graded, stats.total_final_subjects)]} 
          labels={['ตรวจปรนัยเสร็จแล้ว', 'ยังไม่เสร็จ']} 
          title="การตรวจข้อสอบ (ปลายภาค)" 
          color="#10b981" 
          count={stats.final.graded}
        />
      </div>

    </div>
  );
}

window.DashboardView = DashboardView;

// --- AdminViews.jsx ---


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
      html: \`
        <div class="space-y-4 text-left p-2">
          <div>
            <label class="block text-sm font-medium text-gray-700">รหัสติดตาม</label>
            <input id="swal-tracking" class="swal2-input !m-0 !w-full !mt-1" value="\${exam.tracking_code}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">รหัสวิชา</label>
            <input id="swal-subjectcode" class="swal2-input !m-0 !w-full !mt-1" value="\${exam.subject_code}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">วันที่จัดสอบ</label>
            <input type="date" id="swal-date" class="swal2-input !m-0 !w-full !mt-1" value="\${exam.exam_date}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">ประเภทการสอบ</label>
            <select id="swal-type" class="swal2-select !m-0 !w-full !mt-1 !text-base">
              <option value="กลางภาค" \${exam.exam_type === 'กลางภาค' ? 'selected' : ''}>กลางภาค</option>
              <option value="ปลายภาค" \${exam.exam_type === 'ปลายภาค' ? 'selected' : ''}>ปลายภาค</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">จำนวนข้อปรนัย (0 = ไม่ตรวจด้วยเครื่อง)</label>
            <input type="number" id="swal-obj" class="swal2-input !m-0 !w-full !mt-1" value="\${exam.objective_count}">
          </div>
        </div>
      \`,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      preConfirm: () => {
        return {
          tracking_code: document.getElementById('swal-tracking').value,
          subject_code: document.getElementById('swal-subjectcode').value,
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
      text: \`คุณต้องการลบข้อมูลวิชา \${exam.subject_code} (รหัสติดตาม: \${exam.tracking_code}) ใช่หรือไม่?\`,
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
  const [searchTerm, setSearchTerm] = useState('');
  
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
      text: \`เปลี่ยนสถานะเป็น: \${status}\`,
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
      html: \`
        <div class="text-left space-y-4 mt-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสติดตาม</label>
            <input id="e-tracking" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="\${e.tracking_code}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสวิชา</label>
            <input id="e-code" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="\${e.subject_code}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อวิชา</label>
            <input id="e-name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="\${e.subject_name}">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">จำนวนข้อสอบ (ฉบับ)</label>
              <input id="e-obj" type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="\${e.objective_count || ''}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">วันที่จัดสอบ</label>
              <input id="e-date" type="date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="\${e.exam_date || ''}">
            </div>
          </div>
        </div>
      \`,
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
        <i className={\`ph \${icon} text-blue-600 mr-2 text-3xl\`}></i>
        {title}
      </h2>
      
      <div className="mb-6 max-w-md">
        <label htmlFor="search-exam" className="mb-2 text-sm font-medium text-gray-900 sr-only">ค้นหา</label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <i className="ph ph-magnifying-glass text-gray-400"></i>
          </div>
          <input 
            type="search" 
            id="search-exam" 
            className="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="ค้นหารหัสติดตาม, รหัสวิชา, หรือชื่อวิชา..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? <p>กำลังโหลด...</p> : (
        <div className="space-y-8">
          {Object.entries(
            exams
              .filter(e => {
                if (!searchTerm) return true;
                const lowerSearch = searchTerm.toLowerCase();
                return (e.tracking_code && e.tracking_code.toLowerCase().includes(lowerSearch)) ||
                       (e.subject_code && e.subject_code.toLowerCase().includes(lowerSearch)) ||
                       (e.subject_name && e.subject_name.toLowerCase().includes(lowerSearch));
              })
              .reduce((acc, e) => {
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
      className={\`border-2 border-dashed rounded-xl p-4 text-center transition-colors \${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}\`}
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
    setSearchTerm(\`\${subject.subject_code} \${subject.subject_name} (\${subject.level})\`);
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
              if (selectedSubject && e.target.value !== \`\${selectedSubject.subject_code} \${selectedSubject.subject_name} (\${selectedSubject.level})\`) {
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
            <div className={\`p-6 rounded-2xl border-2 \${midtermExam ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-gray-50 opacity-50'}\`}>
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
            <div className={\`p-6 rounded-2xl border-2 \${finalExam ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50 opacity-50'}\`}>
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

// --- HeadViews.jsx ---


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
      html: \`
        <div class="text-left space-y-4 mt-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสวิชา</label>
            <input id="e-code" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="\${s.subject_code}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อวิชา</label>
            <input id="e-name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="\${s.subject_name}">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ระดับชั้น</label>
              <select id="e-level" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors">
                \${['ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'].map(l => \`<option value="\${l}" \${s.level === l ? 'selected' : ''}>\${l}</option>\`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ห้องเรียน</label>
              <input id="e-rooms" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="\${s.rooms}">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">สอบกลางภาค (นาที)</label>
              <input id="e-mid" type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="\${s.mid_time}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">สอบปลายภาค (นาที)</label>
              <input id="e-final" type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors" value="\${s.final_time}">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">การจัดสอบ</label>
            <select id="e-type" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors">
              <option value="ในตาราง" \${s.schedule_type === 'ในตาราง' ? 'selected' : ''}>ในตาราง</option>
              <option value="นอกตาราง" \${s.schedule_type === 'นอกตาราง' ? 'selected' : ''}>นอกตาราง</option>
            </select>
          </div>
        </div>
      \`,
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
      
      let html = \`
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
            กลุ่มสาระการเรียนรู้ \${user.department} <br>
            ภาคเรียนที่ \${term} ปีการศึกษา \${year}
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
              \${subjects.map(s => \`
                <tr>
                  <td>\${s.subject_code}</td>
                  <td>\${s.subject_name}</td>
                  <td>\${s.level}</td>
                  <td>\${s.rooms}</td>
                  <td>\${s.mid_time > 0 ? s.mid_time + ' นาที' : '-'}</td>
                  <td>\${s.final_time > 0 ? s.final_time + ' นาที' : '-'}</td>
                  <td>\${s.schedule_type}</td>
                </tr>
              \`).join('')}
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
      \`;
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
  const [statusFilter, setStatusFilter] = useState("all");

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
      "กำลังอัดสำเนา",
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
      html: \`
        <div class="text-left mb-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          <p><strong>วิชา:</strong> \${exam.subject_code} \${exam.subject_name}</p>
          <p><strong>รหัสติดตาม:</strong> \${exam.tracking_code}</p>
        </div>
        <p>คุณต้องการอัปเดตสถานะเป็น <strong class="text-blue-600">\${nextStatus}</strong> หรือไม่?</p>
      \`,
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

  const filteredExams = statusFilter === "all" ? exams : exams.filter(e => e.status === statusFilter);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold font-kanit text-gray-800 flex items-center">
          <i className="ph ph-activity text-blue-600 mr-2 text-3xl"></i>
          สถานะล่าสุด
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">กรองสถานะ:</label>
          <select 
            className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">ดูทุกสถานะ</option>
            <option value="รอตรวจสอบ">รอตรวจสอบ</option>
            <option value="ตรวจสอบความถูกต้อง">ตรวจสอบความถูกต้อง</option>
            <option value="กำลังอัดสำเนา">กำลังอัดสำเนา</option>
            <option value="อัดสำเนาเสร็จสิ้น">อัดสำเนาเสร็จสิ้น</option>
            <option value="จัดเก็บข้อสอบ">จัดเก็บข้อสอบ</option>
            <option value="จัดสอบ">จัดสอบ</option>
            <option value="กำลังตรวจข้อสอบ">กำลังตรวจข้อสอบ</option>
            <option value="ตรวจข้อสอบเสร็จสิ้น">ตรวจข้อสอบเสร็จสิ้น</option>
          </select>
        </div>
      </div>
      
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
              {filteredExams.map((e, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.tracking_code}</td>
                  <td className="px-4 py-3">{e.subject_code}</td>
                  <td className="px-4 py-3">{e.subject_name}</td>
                  <td className="px-4 py-3">{e.level}</td>
                  <td className="px-4 py-3">{e.exam_type}</td>
                  <td className="px-4 py-3">{e.department}</td>
                  <td className="px-4 py-3">
                    {user.role === 'admin' ? (
                      <button onClick={() => handleUpdateStatus(e)} className={\`text-xs font-medium px-2.5 py-1 rounded shadow-sm hover:opacity-80 transition cursor-pointer flex items-center gap-1 \${getStatusColor(e.status)}\`}>
                        {e.status} <i className="ph ph-caret-down ml-1"></i>
                      </button>
                    ) : (
                      <span className={\`text-xs font-medium px-2.5 py-0.5 rounded \${getStatusColor(e.status)}\`}>
                        {e.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{new Date(e.updated_at).toLocaleString('th-TH')}</td>
                </tr>
              ))}
              {filteredExams.length === 0 && <tr><td colSpan="8" className="text-center py-4">ไม่มีข้อมูลการติดตาม</td></tr>}
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
      
      let html = \`
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
            รายการข้อสอบค้างส่ง (\${title}) <br>
            \${user.role === 'head' ? \`กลุ่มสาระการเรียนรู้ \${user.department} <br>\` : ''}
            ภาคเรียนที่ \${term} ปีการศึกษา \${year}
          </div>
          <table>
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>รหัสวิชา</th>
                <th>ชื่อวิชา</th>
                <th>ชั้น</th>
                \${user.role !== 'head' ? '<th>กลุ่มสาระฯ</th>' : ''}
              </tr>
            </thead>
            <tbody>
              \${examsData.map((s, i) => \`
                <tr>
                  <td>\${i + 1}</td>
                  <td>\${s.subject_code}</td>
                  <td>\${s.subject_name}</td>
                  <td>\${s.level}</td>
                  \${user.role !== 'head' ? \`<td>\${s.department}</td>\` : ''}
                </tr>
              \`).join('')}
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
      \`;
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
          const currentKey = \`\${settings.academic_year}-\${settings.term}\`;
          // เช็คว่า currentKey มีใน availableTerms ไหม
          const exists = data.some(t => \`\${t.academic_year}-\${t.term}\` === currentKey);
          setSelectedTermKey(exists ? currentKey : \`\${data[0].academic_year}-\${data[0].term}\`);
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
      // แสดงวิชาทั้งหมด
      // เรียงลำดับตามระดับชั้น และรหัสวิชา
      const sorted = data.sort((a,b) => {
        if (a.level !== b.level) {
          return (a.level || '').localeCompare(b.level || '', 'th', {numeric: true});
        }
        return (a.subject_code || '').localeCompare(b.subject_code || '');
      });
      setExams(sorted);
      setLoading(false);
    }).getExams(dept, year, term);
  }, [user, selectedTermKey]);

  const renderPdfIconsOrMessage = (e) => {
    if (e.objective_count == 0 || e.objective_count === "0") {
      return <td colSpan="3" className="px-4 py-3 text-center text-gray-500 italic">ไม่ใช้เครื่องตรวจข้อสอบ</td>;
    }

    const renderIcon = (url, label) => {
      if (!url) return <span className="text-gray-300">-</span>;
      return (
        <a href={url} target="_blank" rel="noreferrer" title={label} className="inline-flex items-center justify-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors">
          <i className="ph ph-file-pdf text-xl"></i>
        </a>
      );
    };

    return (
      <>
        <td className="px-4 py-3 text-center">{renderIcon(e.results?.score_url, 'คะแนนสอบ')}</td>
        <td className="px-4 py-3 text-center">{renderIcon(e.results?.summary_url, 'สรุปวิเคราะห์')}</td>
        <td className="px-4 py-3 text-center">{renderIcon(e.results?.analysis_url, 'วิเคราะห์รายข้อ')}</td>
      </>
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
                <option key={idx} value={\`\${t.academic_year}-\${t.term}\`}>
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

// --- App.jsx ---


function Sidebar({ role, currentPage, setCurrentPage, isOpen, setIsOpen, onLogout, settings }) {
  const menuItems = {
    admin: [
      { id: 'dashboard', icon: 'ph-squares-four', label: 'หน้าหลัก' },
      { id: 'subjects', icon: 'ph-books', label: 'รายวิชาที่จัดสอบ' },
      { id: 'receive', icon: 'ph-download-simple', label: 'รับข้อสอบ' },
      { id: 'prepare', icon: 'ph-copy', label: 'เตรียมตัวสอบ' },
      { id: 'process', icon: 'ph-exam', label: 'การจัดสอบ' },
      { id: 'pending', icon: 'ph-warning-circle', label: 'ข้อสอบค้างส่ง' },
      { id: 'submit_results', icon: 'ph-upload-simple', label: 'ส่งผลการสอบ' },
      { id: 'system_settings', icon: 'ph-gear', label: 'ตั้งค่าระบบ' },
      { id: 'status', icon: 'ph-activity', label: 'สถานะล่าสุด' }
    ],
    head: [
      { id: 'dashboard', icon: 'ph-squares-four', label: 'หน้าหลัก' },
      { id: 'request', icon: 'ph-file-plus', label: 'แจ้งจัดสอบ' },
      { id: 'pending', icon: 'ph-warning-circle', label: 'ข้อสอบค้างส่ง' },
      { id: 'results', icon: 'ph-file-pdf', label: 'ผลการสอบ' },
      { id: 'status', icon: 'ph-activity', label: 'สถานะล่าสุด' }
    ],
    academic: [
      { id: 'dashboard', icon: 'ph-squares-four', label: 'หน้าหลัก' },
      { id: 'subjects', icon: 'ph-books', label: 'รายวิชาที่จัดสอบ' },
      { id: 'pending', icon: 'ph-warning-circle', label: 'ข้อสอบค้างส่ง' },
      { id: 'status', icon: 'ph-activity', label: 'สถานะล่าสุด' }
    ]
  };

  const items = menuItems[role] || [];

  const handleLogoutClick = () => {
    Swal.fire({
      title: 'ออกจากระบบ',
      text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) onLogout();
    });
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 sidebar-overlay lg:hidden z-40 bg-black/50" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      <aside className={\`fixed lg:relative inset-y-0 left-0 z-50 bg-gradient-to-b from-slate-900 to-blue-900 text-white flex flex-col h-full shadow-2xl transition-all duration-300 \${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0 lg:w-0 lg:overflow-hidden whitespace-nowrap'}\`}>
        <div className="p-6 flex items-center justify-center border-b border-gray-800">
          <img src="https://img2.pic.in.th/Logo-PKW3.png" alt="PKW" className="w-12 h-12 object-contain mr-3 drop-shadow" />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold font-kanit tracking-wide leading-tight">Exam Workflow</h1>
            <p className="text-xs text-blue-300">ภาคเรียนที่ {settings.term}/{settings.academic_year}</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
              className={\`w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group \${currentPage === item.id ? 'sidebar-item-active' : 'text-gray-300 hover:bg-white/10 hover:text-white'}\`}
            >
              <i className={\`ph \${item.icon} text-xl mr-3 \${currentPage === item.id ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-300'}\`}></i>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <i className="ph ph-sign-out text-xl mr-2"></i>
            <span className="font-medium text-sm">ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function TopNav({ user, toggleSidebar, settings }) {
  return (
    <header className="bg-white h-20 flex items-center justify-between px-6 shadow-sm border-b border-gray-200 z-30">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar} 
          className="text-gray-500 hover:text-blue-600 focus:outline-none mr-4 p-2 bg-gray-100 rounded-lg transition-colors"
        >
          <i className="ph ph-list text-2xl"></i>
        </button>
        <h2 className="text-xl font-semibold text-gray-800 font-kanit hidden sm:block">ระบบติดตามกระบวนการจัดสอบ โรงเรียนภูเก็ตวิทยาลัย</h2>
        <h2 className="text-base font-semibold text-gray-800 font-kanit sm:hidden">
          Exam Workflow ({settings.term}/{settings.academic_year})
        </h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-500 hidden md:block">
          {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        
        <button 
          onClick={() => window.location.reload()} 
          className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200 shadow-sm"
          title="รีเฟรชข้อมูลล่าสุด"
        >
          <i className="ph ph-arrows-clockwise mr-1.5 text-lg"></i>
          รีเฟรช
        </button>
        
        <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 liquid-glass">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3 shadow-inner text-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
            <p className="text-xs text-gray-500 leading-tight">{user.department}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [appSettings, setAppSettings] = useState({ academic_year: '-', term: '-' });

  // ตรวจสอบว่า Firebase Initialize หรือยัง (ถ้าไม่ จะค้างอยู่หน้า Login)
  useEffect(() => {
    if (typeof db === 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้',
        text: 'โปรดตรวจสอบไฟล์ firebase-config.js ว่าตั้งค่าถูกต้องหรือไม่',
      });
    } else {
      google.script.run.withSuccessHandler((data) => {
        setAppSettings(data);
        window.appSettings = data; // Make it globally accessible for quick reference
      }).getSettings();
    }
  }, []);

  if (!user) {
    return <Login onLogin={(u) => {
      setUser(u);
      setCurrentPage('dashboard');
      setIsSidebarOpen(true);
    }} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardView user={user} />;
      case 'receive': return <ReceiveExamView />;
      case 'prepare': return <UpdateStatusView mode="prepare" />;
      case 'process': return <UpdateStatusView mode="process" />;
      case 'pending': return <PendingExamsView user={user} />;
      case 'system_settings': return <SystemSettingsView />;
      case 'request': return <RequestExamView user={user} />;
      case 'status': return <LatestStatusView user={user} />;
      case 'subjects': return <SubjectsView />;
      case 'submit_results': return <SubmitResultsView />;
      case 'results': return <ExamResultsView user={user} />;
      default: return <DashboardView user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <Sidebar 
        role={user.role} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={() => setUser(null)}
        settings={appSettings}
      />
      
      <div className="flex-1 flex flex-col h-full relative w-full lg:w-auto">
        <TopNav 
          user={user} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          settings={appSettings}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth pb-20">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

window.App = App;

// Start Application immediately
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><App /></ErrorBoundary>);
`;
  const script = document.createElement('script');
  script.type = 'text/babel';
  script.setAttribute('data-presets', 'react,env');
  script.text = appCode;
  document.head.appendChild(script);
  
  // Trigger Babel if already loaded, else wait
  if (window.Babel) {
    window.Babel.transformScriptTags();
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      if (window.Babel) window.Babel.transformScriptTags();
    });
  }
})();
