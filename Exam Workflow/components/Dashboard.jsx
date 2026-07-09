const { useEffect, useRef } = React;

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
      <div className={`p-4 rounded-xl ${bgClass} mr-4`}>
        <i className={`ph ${icon} text-3xl ${colorClass}`}></i>
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
