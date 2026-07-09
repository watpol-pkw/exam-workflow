const { useState, useEffect } = React;

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
      
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 bg-gradient-to-b from-slate-900 to-blue-900 text-white flex flex-col h-full shadow-2xl transition-all duration-300 ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0 lg:w-0 lg:overflow-hidden whitespace-nowrap'}`}>
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
              className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group ${currentPage === item.id ? 'sidebar-item-active' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
            >
              <i className={`ph ${item.icon} text-xl mr-3 ${currentPage === item.id ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-300'}`}></i>
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
