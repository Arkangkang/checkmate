import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, BellRing, CalendarDays, CheckCircle2, Sparkles } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import mascot from '../assets/horse-mascot.svg'

const features = [
  { icon: <CalendarDays />, title: 'Deadline jadi value', text: 'Sisa hari otomatis dihitung menjadi value prioritas agar kamu tahu mana yang harus dikerjakan dulu.' },
  { icon: <BellRing />, title: 'Notifikasi bertingkat', text: 'CheckMate memberi peringatan saat tugas atau kegiatan masuk prioritas Tinggi, Sangat Tinggi, atau terlewat.' },
  { icon: <BarChart3 />, title: 'Analitik performa', text: 'Pantau rata-rata value, value tertinggi, value terendah, progress selesai, dan tren tugas/kegiatan per bulan.' },
  { icon: <Sparkles />, title: 'Glassy, noisy, smooth', text: 'Desain modern bertema catur dengan animasi transisi agar pengalaman memakai website terasa hidup.' },
]

const steps = [
  ['♙', 'Input data', 'Masukkan tugas atau kegiatan beserta deadline dan variabel prioritas.'],
  ['♞', 'Hitung otomatis', 'Sistem menghitung value menggunakan bobot yang sudah kamu tentukan.'],
  ['♜', 'Urutkan prioritas', 'List akan menampilkan badge Rendah, Sedang, Tinggi, atau Sangat Tinggi.'],
  ['♛', 'Checkmate!', 'Selesaikan tugas sebelum deadline dan pantau performamu di dashboard.'],
]

export default function Onboarding() {
  const navigate = useNavigate()

  function goToAuth() {
    navigate('/auth')
  }

  return (
    <PageTransition className="onboarding-page">
      <header className="landing-nav glass-card">
        <Link className="brand" to="/">
          <img src={mascot} alt="CheckMate mascot" />
          <span>CheckMate</span>
        </Link>
        <button className="primary-button" type="button" onClick={goToAuth}>
  Get Started <ArrowRight size={18} />
</button>
      </header>

      <section className="hero-section">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="hero-kicker">♞ Priority Notification System</span>
          <h1>Teman cek tugas dan kegiatan dengan strategi ala catur.</h1>
          <p>
            CheckMate membantu kamu memilih langkah terbaik: tugas mana yang harus diserang dulu,
            kegiatan mana yang mulai mendesak, dan deadline mana yang sudah dekat.
          </p>
          <div className="hero-actions"><button className="primary-button large" type="button" onClick={goToAuth}>
  Mulai Sekarang <ArrowRight size={19} />
</button>
            
            <a className="ghost-button large" href="#fitur">Lihat Fitur</a>
          </div>
        </motion.div>

        <motion.div className="hero-card glass-card" initial={{ opacity: 0, scale: 0.9, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
          <div className="hero-board">
            <img src={mascot} alt="Mascot kuda CheckMate" />
            <div className="floating-badge badge-red">Sangat Tinggi 92</div>
            <div className="floating-badge badge-yellow">Tinggi 81</div>
            <div className="floating-badge badge-green">Sedang 66</div>
          </div>
        </motion.div>
      </section>

      <section id="fitur" className="section-block">
        <div className="section-heading">
          <span className="eyebrow">Kenapa CheckMate?</span>
          <h2>Bukan cuma to-do list, tapi papan strategi deadline.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <motion.article
              className="feature-card glass-card"
              key={feature.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.07 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section-block split-section">
        <motion.div className="glass-card explain-card" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="eyebrow">Formula prioritas</span>
          <h2>Tugas dihitung dari 5 variabel, kegiatan dari deadline.</h2>
          <p>
            Untuk tugas, value berasal dari jenis tugas, deadline, dampak nilai, konsekuensi telat,
            dan tingkat kesulitan. Untuk kegiatan, value mengikuti sisa hari karena fokusnya adalah kedekatan deadline.
          </p>
          <div className="mini-scale">
            <span className="scale-red">&gt; 85 Sangat Tinggi</span>
            <span className="scale-yellow">&gt; 75 Tinggi</span>
            <span className="scale-green">&gt; 55 Sedang</span>
            <span className="scale-blue">≤ 55 Rendah</span>
          </div>
        </motion.div>

        <div className="steps-stack">
          {steps.map(([piece, title, text], index) => (
            <motion.div className="step-card glass-card" key={title} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <b>{piece}</b>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="cta-section glass-card">
        <div>
          <span className="eyebrow">Ready to move?</span>
          <h2>Atur langkahmu sebelum deadline melakukan checkmate.</h2>
          <p>Masuk, tambahkan tugas, lalu biarkan CheckMate membantu mengurutkan prioritasmu.</p>
        </div>
        <button className="primary-button large" type="button" onClick={goToAuth}>
  Get Started <ArrowRight size={19} />
</button>
      </section>
    </PageTransition>
  )
}
