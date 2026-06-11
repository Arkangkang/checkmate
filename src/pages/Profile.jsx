import { useEffect, useState } from 'react'
import { Camera, Moon, Save, Trash2 } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import mascot from '../assets/horse-mascot.svg'

export default function Profile() {
  const { profile, updateProfile } = useAuth()
  const { darkMode, setDarkMode, guiScale, setGuiScale } = useTheme()

  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setAvatar(profile.avatar_data_url || '')
    }
  }, [profile])

  function handleFile(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 800 * 1024) {
      setFeedback('Ukuran foto maksimal 800KB agar database tetap ringan.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    setFeedback('')

    const { error } = await updateProfile({
      username: username.trim(),
      avatar_data_url: avatar || null,
      gui_scale: guiScale,
      dark_mode: darkMode,
    })

    setSaving(false)
    setFeedback(error ? error.message : 'Profile berhasil disimpan.')
  }

  return (
    <PageTransition>
      <div className="page-header">
        <div>
          <span className="eyebrow">♚ Profile</span>
          <h1>Atur identitas dan tampilan</h1>
          <p>Ganti foto, username, mode gelap/terang, dan ukuran GUI.</p>
        </div>
      </div>

      <section className="profile-grid">
        <div className="glass-card profile-card">
          <div className="avatar-large">
            <img src={avatar || mascot} alt="Avatar profile" />
          </div>

          <h2>{profile?.username}</h2>
          <p>{profile?.email}</p>

          <div className="profile-actions">
            <label className="soft-button">
              <Camera size={17} /> Ganti Foto
              <input type="file" accept="image/*" hidden onChange={handleFile} />
            </label>

            <button className="danger-button" onClick={() => setAvatar('')}>
              <Trash2 size={17} /> Hapus Foto
            </button>
          </div>
        </div>

        <div className="glass-card settings-card">
          {feedback && (
            <div className={`alert ${feedback.includes('berhasil') ? 'success' : 'error'}`}>
              {feedback}
            </div>
          )}

          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username baru"
            />
          </label>

          <div className="setting-row">
            <div>
              <strong>
                <Moon size={18} /> Dark Mode
              </strong>
              <span>Aktifkan tampilan gelap agar nyaman dipakai malam hari.</span>
            </div>

            <button
              type="button"
              className={`toggle ${darkMode ? 'on' : ''}`}
              onClick={() => setDarkMode((prev) => !prev)}
            >
              <span />
            </button>
          </div>

          <div className="setting-row vertical-setting">
            <div>
              <strong>Ukuran GUI</strong>
              <span>Pilih 1 kecil, 2 sedang, 3 besar.</span>
            </div>

            <div className="scale-buttons">
              {[1, 2, 3].map((scale) => (
                <button
                  type="button"
                  key={scale}
                  className={guiScale === scale ? 'active' : ''}
                  onClick={() => setGuiScale(scale)}
                >
                  {scale}
                </button>
              ))}
            </div>
          </div>

          <button
            className="primary-button full"
            onClick={handleSave}
            disabled={saving || username.trim().length < 3}
          >
            <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan Profile'}
          </button>
        </div>
      </section>
    </PageTransition>
  )
}