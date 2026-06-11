import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, MailCheck, ShieldCheck } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import mascot from '../assets/horse-mascot.svg'

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, signOut } = useAuth()
  const verified = searchParams.get('verified') === 'true'
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [lastSignupEmail, setLastSignupEmail] = useState('')
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' })
  const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })

  useEffect(() => {
    async function handleVerified() {
      if (verified) {
        setMode('login')
        setMessage({ type: 'success', text: 'Email berhasil diverifikasi. Silakan login dengan email/username dan password kamu.' })
        if (user) await signOut()
      }
    }
    handleVerified()
  }, [verified, user, signOut])

  const title = useMemo(() => mode === 'login' ? 'Masuk ke CheckMate' : mode === 'signup' ? 'Buat akun baru' : 'Cek email kamu', [mode])

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    const identifier = loginForm.identifier.trim()
    const password = loginForm.password

    const { data: resolvedEmail, error: resolveError } = await supabase.rpc('resolve_login_email', { identifier })

    if (resolveError || !resolvedEmail) {
      setLoading(false)
      setMessage({ type: 'error', text: 'Email atau username belum terdaftar.' })
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email: resolvedEmail, password })
    setLoading(false)

    if (error) {
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        setMessage({ type: 'error', text: 'Email kamu belum diverifikasi. Cek inbox email lalu klik link verifikasi dari Supabase.' })
        return
      }
      setMessage({ type: 'error', text: 'Password kamu salah.' })
      return
    }

    navigate('/app/dashboard', { replace: true })
  }

  async function handleSignup(event) {
    event.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    const username = signupForm.username.trim()
    const email = signupForm.email.trim().toLowerCase()
    const password = signupForm.password

    if (username.length < 3) {
      setLoading(false)
      setMessage({ type: 'error', text: 'Username minimal 3 karakter.' })
      return
    }

    if (password.length < 6) {
      setLoading(false)
      setMessage({ type: 'error', text: 'Password minimal 6 karakter.' })
      return
    }

    if (password !== signupForm.confirmPassword) {
      setLoading(false)
      setMessage({ type: 'error', text: 'Konfirmasi password tidak sama. Cek lagi agar tidak typo.' })
      return
    }

    const { data: available, error: usernameError } = await supabase.rpc('is_username_available', { p_username: username })
    if (usernameError || available === false) {
      setLoading(false)
      setMessage({ type: 'error', text: 'Username sudah dipakai. Coba username lain.' })
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        data: { username },
      },
    })

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message.includes('already') ? 'Email sudah terdaftar.' : error.message })
      return
    }

    setLastSignupEmail(email)
    setMode('verify')
    setMessage({ type: 'success', text: 'Akun berhasil dibuat. Link verifikasi sudah dikirim melalui email Supabase.' })
  }

  async function resendEmail() {
    if (!lastSignupEmail) return
    setLoading(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email: lastSignupEmail })
    setLoading(false)
    setMessage(error ? { type: 'error', text: error.message } : { type: 'success', text: 'Link verifikasi berhasil dikirim ulang.' })
  }

  return (
    <PageTransition className="auth-page">
      <Link className="back-link" to="/"><ArrowLeft size={18} /> Kembali ke onboarding</Link>

      <section className="auth-shell glass-card">
        <div className="auth-art">
          <img src={mascot} alt="CheckMate mascot" />
          <span className="hero-kicker">♞ CheckMate Account</span>
          <h1>Simpan semua strategi deadline kamu dengan aman.</h1>
          <p>Daftar memakai email, verifikasi lewat link default Supabase, lalu login memakai email atau username.</p>
        </div>

        <motion.div className="auth-panel" key={mode} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
          <div className="auth-heading">
            <ShieldCheck size={28} />
            <div>
              <h2>{title}</h2>
              <p>{mode === 'login' ? 'Gunakan email/username dan password.' : mode === 'signup' ? 'Isi data akun dengan benar.' : 'Klik link verifikasi di inbox email kamu.'}</p>
            </div>
          </div>

          {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

          {mode === 'login' && (
            <form className="auth-form" onSubmit={handleLogin}>
              <label>Email atau Username<input value={loginForm.identifier} onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })} placeholder="arkan atau arkan@email.com" required /></label>
              <label>Password
                <div className="password-field">
                  <input type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Masukkan password" required />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </label>
              <button className="primary-button full" disabled={loading}>{loading ? 'Memproses...' : 'Login'}</button>
              <p className="switch-auth">Belum punya akun? <button type="button" onClick={() => { setMode('signup'); setMessage({ type: '', text: '' }) }}>Daftar sekarang</button></p>
            </form>
          )}

          {mode === 'signup' && (
            <form className="auth-form" onSubmit={handleSignup}>
              <label>Username<input value={signupForm.username} onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })} placeholder="contoh: arkan" required /></label>
              <label>Email<input type="email" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} placeholder="contoh@email.com" required /></label>
              <label>Password<input type="password" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} placeholder="Minimal 6 karakter" required /></label>
              <label>Konfirmasi Password<input type="password" value={signupForm.confirmPassword} onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} placeholder="Ulangi password" required /></label>
              <button className="primary-button full" disabled={loading}>{loading ? 'Mendaftarkan...' : 'Daftar'}</button>
              <p className="switch-auth">Sudah punya akun? <button type="button" onClick={() => { setMode('login'); setMessage({ type: '', text: '' }) }}>Login</button></p>
            </form>
          )}

          {mode === 'verify' && (
            <div className="verify-box">
              <MailCheck size={58} />
              <h3>Verifikasi email dulu</h3>
              <p>Kami mengirim link verifikasi default Supabase ke <strong>{lastSignupEmail}</strong>. Setelah klik link, kamu akan kembali ke halaman login.</p>
              <button className="primary-button full" onClick={resendEmail} disabled={loading}>{loading ? 'Mengirim...' : 'Kirim Ulang Link'}</button>
              <button className="ghost-button full" onClick={() => setMode('login')}>Saya sudah verifikasi</button>
            </div>
          )}
        </motion.div>
      </section>
    </PageTransition>
  )
}
