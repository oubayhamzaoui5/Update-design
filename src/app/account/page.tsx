'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, MapPin, Save, Plus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'

type Address = {
  id: string
  address: string
  address2?: string
  city: string
  state?: string
  country?: string
  postalCode?: string
  notes?: string
}

const DISPLAY = "var(--font-display), 'Cormorant Garamond', Georgia, serif"
const BODY    = "'DM Sans', 'Outfit', system-ui, sans-serif"
const GOLD    = '#C4A23E'
const DARK    = '#1C1A14'
const CREAM   = '#FDFAF5'
const SLATE   = '#1A2028'

// Compatibility aliases — map old Chia tokens to Update Design brand
const FONT     = BODY
const GRADIENT = `linear-gradient(135deg, ${SLATE} 0%, #222B33 100%)`

const COUNTRIES = [
  { code: "US", name: "United States" }, { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" }, { code: "AU", name: "Australia" },
  { code: "FR", name: "France" }, { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" }, { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" }, { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" }, { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" }, { code: "DK", name: "Denmark" },
  { code: "PT", name: "Portugal" }, { code: "IE", name: "Ireland" },
  { code: "AT", name: "Austria" }, { code: "PL", name: "Poland" },
  { code: "GR", name: "Greece" }, { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" }, { code: "SG", name: "Singapore" },
  { code: "IN", name: "India" }, { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" }, { code: "QA", name: "Qatar" },
  { code: "MA", name: "Morocco" }, { code: "TN", name: "Tunisia" },
  { code: "DZ", name: "Algeria" }, { code: "EG", name: "Egypt" },
  { code: "ZA", name: "South Africa" }, { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" }, { code: "NZ", name: "New Zealand" },
] as const

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
] as const

const inputStyle: React.CSSProperties = {
  fontFamily: BODY,
  fontWeight: 400,
  fontSize: '13px',
  border: `1px solid rgba(196,162,62,0.2)`,
  borderRadius: 0,
  background: CREAM,
  color: DARK,
  padding: '10px 14px',
  outline: 'none',
  width: '100%',
  letterSpacing: '0.02em',
  transition: 'border-color 0.15s ease',
}
const inputCls = "focus:border-[rgba(196,162,62,0.55)]"
const labelCls = "mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.2em]"

function SectionHeader({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
      style={{
        background: SLATE,
        borderLeft: `3px solid ${GOLD}`,
        borderBottom: `1px solid rgba(196,162,62,0.15)`,
      }}
    >
      <div className="flex items-center gap-3">
        <span style={{ color: GOLD }}>{icon}</span>
        <h2
          className="text-[9px] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: BODY, color: GOLD }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

function FeedbackMsg({ msg }: { msg: { type: 'ok' | 'err'; text: string } | null }) {
  if (!msg) return null
  const isOk = msg.type === 'ok'
  return (
    <div
      className="px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em]"
      style={{
        fontFamily: BODY,
        border: `1px solid ${isOk ? 'rgba(46,125,50,0.3)' : 'rgba(198,40,40,0.3)'}`,
        background: isOk ? 'rgba(46,125,50,0.05)' : 'rgba(198,40,40,0.05)',
        color: isOk ? '#2E7D32' : '#C62828',
      }}
    >
      {msg.text}
    </div>
  )
}

function SaveBtn({ saving, label, loadingLabel }: { saving: boolean; label: string; loadingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex items-center gap-2 cursor-pointer px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      style={{ fontFamily: BODY, background: GOLD, color: DARK, border: 'none' }}
    >
      <Save size={13} />
      {saving ? loadingLabel : label}
    </button>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonBlock({ h = 'h-10', w = 'w-full' }: { h?: string; w?: string }) {
  return (
    <div
      className={`${h} ${w} animate-pulse`}
      style={{ background: 'rgba(196,162,62,0.08)' }}
    />
  )
}

function SkeletonSection({ rows = 2, hasGrid = false }: { rows?: number; hasGrid?: boolean }) {
  return (
    <div
      style={{
        border: `1px solid rgba(196,162,62,0.15)`,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {/* header bar */}
      <div
        className="h-11 animate-pulse"
        style={{ background: `rgba(26,32,40,0.6)`, borderBottom: `1px solid rgba(196,162,62,0.15)` }}
      />
      <div className="space-y-4 p-5">
        {hasGrid ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><SkeletonBlock h="h-3" w="w-20" /><SkeletonBlock /></div>
            <div className="space-y-2"><SkeletonBlock h="h-3" w="w-20" /><SkeletonBlock /></div>
          </div>
        ) : (
          Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock h="h-3" w="w-24" />
              <SkeletonBlock />
            </div>
          ))
        )}
        <SkeletonBlock h="h-10" w="w-36" />
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const [surname, setSurname] = useState('')
  const [name, setName] = useState('')
  const [infoSaving, setInfoSaving] = useState(false)
  const [infoMsg, setInfoMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [email, setEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailMsg, setEmailMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [addresses, setAddresses] = useState<Address[]>([])
  const [newAddr, setNewAddr] = useState({ address: '', address2: '', city: '', state: '', country: '', postalCode: '', notes: '' })
  const [addrSaving, setAddrSaving] = useState(false)
  const [addrMsg, setAddrMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [showAddrForm, setShowAddrForm] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' })
        if (!res.ok) { router.push('/?auth=login&next=/account'); return }
        const data = await res.json()
        const u = data?.user
        if (!u?.id) { router.push('/?auth=login&next=/account'); return }
        if (!cancelled) { setSurname(u.surname || ''); setName(u.name || ''); setEmail(u.email || '') }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    const loadAddresses = async () => {
      try {
        const res = await fetch('/api/shop/addresses', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setAddresses(Array.isArray(data?.items) ? data.items : [])
      } catch { /* ignore */ }
    }
    void load()
    void loadAddresses()
    return () => { cancelled = true }
  }, [router])

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault(); setInfoSaving(true); setInfoMsg(null)
    try {
      const res = await fetch('/api/auth/update-info', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ surname: surname.trim(), name: name.trim() }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Update failed.')
      setInfoMsg({ type: 'ok', text: 'Profile updated successfully.' })
    } catch (err: any) { setInfoMsg({ type: 'err', text: err?.message || 'Could not update profile.' }) }
    finally { setInfoSaving(false) }
  }

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault(); setEmailSaving(true); setEmailMsg(null)
    try {
      const res = await fetch('/api/auth/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Update failed.')
      setEmailMsg({ type: 'ok', text: 'Email updated successfully.' })
      if (data.user?.email) setEmail(data.user.email)
    } catch (err: any) { setEmailMsg({ type: 'err', text: err?.message || 'Could not update email.' }) }
    finally { setEmailSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPwSaving(true); setPwMsg(null)
    try {
      const res = await fetch('/api/auth/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldPassword, newPassword, confirmPassword }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Update failed.')
      setPwMsg({ type: 'ok', text: 'Password changed successfully.' })
      setOldPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err: any) { setPwMsg({ type: 'err', text: err?.message || 'Could not change password.' }) }
    finally { setPwSaving(false) }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault(); setAddrSaving(true); setAddrMsg(null)
    try {
      const res = await fetch('/api/shop/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newAddr) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Could not add address.')
      setAddresses(prev => [data.item, ...prev])
      setNewAddr({ address: '', address2: '', city: '', state: '', country: '', postalCode: '', notes: '' })
      setShowAddrForm(false)
      setAddrMsg({ type: 'ok', text: 'Address added.' })
    } catch (err: any) { setAddrMsg({ type: 'err', text: err?.message || 'Could not add address.' }) }
    finally { setAddrSaving(false) }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return
    try {
      const res = await fetch(`/api/shop/addresses?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) return
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch { /* ignore */ }
  }

  const pageStyle: React.CSSProperties = {
    fontFamily: BODY,
    background: CREAM,
  }

  const sectionStyle: React.CSSProperties = {
    border: `1px solid rgba(196,162,62,0.15)`,
    overflow: 'hidden',
    background: '#fff',
  }

  const sectionBodyStyle: React.CSSProperties = {
    background: '#fff',
  }

  // ── Skeleton state ──
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={pageStyle}>
        <Navbar reserveSpace />
        <main className="flex-1 mx-auto w-full max-w-2xl px-4 pt-16 md:pt-20 pb-20">
          {/* breadcrumb skeleton */}
          <div className="mb-8 flex items-center gap-2">
            <SkeletonBlock h="h-3" w="w-12" />
            <SkeletonBlock h="h-3" w="w-3" />
            <SkeletonBlock h="h-3" w="w-20" />
          </div>
          {/* header skeleton */}
          <div className="mb-8 space-y-3">
            <SkeletonBlock h="h-10" w="w-56" />
            <SkeletonBlock h="h-3" w="w-72" />
          </div>
          <div className="space-y-8">
            <SkeletonSection hasGrid />
            <SkeletonSection rows={1} />
            <SkeletonSection hasGrid />
            <SkeletonSection rows={1} />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={pageStyle}>
      <Navbar reserveSpace />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 pt-16 md:pt-20 pb-20">

        {/* Breadcrumb */}
        <nav
          className="mb-8 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.15em]"
          style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.4)' }}
        >
          <Link href="/" className="transition-colors hover:text-[#C4A23E]">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span style={{ color: GOLD }}>Mon Compte</span>
        </nav>

        {/* Page header */}
        <header className="mb-10">
          <h1
            className="leading-none"
            style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 6vw, 3.4rem)', fontWeight: 400, color: DARK, letterSpacing: '-0.01em' }}
          >
            Mon Compte
          </h1>
          <div className="mt-4 flex items-center gap-4">
            <p
              className="text-[10px] font-medium uppercase tracking-[0.18em]"
              style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.4)' }}
            >
              Manage your profile and saved addresses.
            </p>
            <Link
              href="/orders"
              className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-75"
              style={{ fontFamily: BODY, color: DARK, background: 'transparent', border: `1px solid rgba(196,162,62,0.3)` }}
            >
              <ShoppingBag size={11} />
              My Orders
            </Link>
          </div>
        </header>

        <div className="space-y-6">

          {/* Personal Info */}
          <section style={sectionStyle}>
            <SectionHeader icon={<User size={15} />} title="Personal Information" />
            <div className="space-y-4 p-5" style={sectionBodyStyle}>
              <form onSubmit={handleSaveInfo} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>First Name</label>
                    <input className={inputCls} style={inputStyle} value={surname} onChange={e => setSurname(e.target.value)} placeholder="John" />
                  </div>
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>Last Name</label>
                    <input className={inputCls} style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Smith" />
                  </div>
                </div>
                <FeedbackMsg msg={infoMsg} />
                <SaveBtn saving={infoSaving} label="Save Changes" loadingLabel="Saving..." />
              </form>
            </div>
          </section>

          {/* Email */}
          <section style={sectionStyle}>
            <SectionHeader icon={<Mail size={15} />} title="Email Address" />
            <div className="space-y-4 p-5" style={sectionBodyStyle}>
              <form onSubmit={handleSaveEmail} className="space-y-4">
                <div>
                  <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>Email</label>
                  <input type="email" className={inputCls} style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" />
                </div>
                <FeedbackMsg msg={emailMsg} />
                <SaveBtn saving={emailSaving} label="Update Email" loadingLabel="Updating..." />
              </form>
            </div>
          </section>

          {/* Password */}
          <section style={sectionStyle}>
            <SectionHeader icon={<Lock size={15} />} title="Change Password" />
            <div className="space-y-4 p-5" style={sectionBodyStyle}>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>Current Password</label>
                  <input type="password" className={inputCls} style={inputStyle} value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>New Password</label>
                    <input type="password" className={inputCls} style={inputStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" minLength={8} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>Confirm Password</label>
                    <input type="password" className={inputCls} style={inputStyle} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" minLength={8} />
                  </div>
                </div>
                <FeedbackMsg msg={pwMsg} />
                <SaveBtn saving={pwSaving} label="Change Password" loadingLabel="Updating..." />
              </form>
            </div>
          </section>

          {/* Addresses */}
          <section style={sectionStyle}>
            <SectionHeader
              icon={<MapPin size={15} />}
              title="Saved Addresses"
              action={
                <button
                  type="button"
                  onClick={() => setShowAddrForm(v => !v)}
                  className="inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] transition-opacity hover:opacity-75"
                  style={{ fontFamily: BODY, color: GOLD, border: `1px solid rgba(196,162,62,0.35)`, background: 'transparent' }}
                >
                  <Plus size={11} />
                  Add New
                </button>
              }
            />
            <div className="space-y-4 p-5" style={sectionBodyStyle}>
              <FeedbackMsg msg={addrMsg} />

              {addresses.length === 0 && !showAddrForm && (
                <p
                  className="text-[10px] font-medium uppercase tracking-[0.15em]"
                  style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.35)' }}
                >
                  No addresses saved yet.
                </p>
              )}

              <div className="space-y-3">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    className="flex items-start justify-between"
                    style={{
                      border: `1px solid rgba(196,162,62,0.12)`,
                      background: CREAM,
                      padding: '12px 14px',
                    }}
                  >
                    <div className="space-y-0.5">
                      <p
                        className="text-[12px] font-semibold tracking-tight"
                        style={{ fontFamily: BODY, color: DARK }}
                      >
                        {addr.address}{addr.address2 ? `, ${addr.address2}` : ''}
                      </p>
                      <p
                        className="text-[10px] font-medium uppercase tracking-[0.1em]"
                        style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.45)' }}
                      >
                        {[addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(' · ')}
                      </p>
                      {addr.notes && (
                        <p
                          className="text-[9px] font-medium uppercase tracking-[0.1em]"
                          style={{ fontFamily: BODY, color: 'rgba(28,26,20,0.3)' }}
                        >
                          {addr.notes}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="ml-3 cursor-pointer transition-colors"
                      aria-label="Delete"
                      style={{ color: 'rgba(28,26,20,0.25)', border: `1px solid rgba(220,50,50,0)`, background: 'transparent', padding: '2px' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(198,40,40,0.7)'
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(220,50,50,0.3)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(28,26,20,0.25)'
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(220,50,50,0)'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {showAddrForm && (
                <form
                  onSubmit={handleAddAddress}
                  className="space-y-4 pt-4 mt-2"
                  style={{ borderTop: `1px solid rgba(196,162,62,0.15)` }}
                >

                  {/* Country */}
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>
                      Country <span style={{ color: 'rgba(198,40,40,0.7)' }}>*</span>
                    </label>
                    <select className={inputCls} style={inputStyle} value={newAddr.country}
                      onChange={e => setNewAddr(p => ({ ...p, country: e.target.value, state: '' }))}>
                      <option value="">Select country...</option>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Address Line 1 */}
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>
                      Address Line 1 <span style={{ color: 'rgba(198,40,40,0.7)' }}>*</span>
                    </label>
                    <input className={inputCls} style={inputStyle} value={newAddr.address}
                      onChange={e => setNewAddr(p => ({ ...p, address: e.target.value }))}
                      required placeholder="Street, number, apartment..." />
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>
                      Address Line 2{' '}
                      <span style={{ color: 'rgba(28,26,20,0.3)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                    </label>
                    <input className={inputCls} style={inputStyle} value={newAddr.address2}
                      onChange={e => setNewAddr(p => ({ ...p, address2: e.target.value }))}
                      placeholder="Suite, unit, building, floor..." />
                  </div>

                  {/* State */}
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>
                      {newAddr.country === 'US' ? 'State' : 'State / Province / Region'}
                      {newAddr.country === 'US' && <span style={{ color: 'rgba(198,40,40,0.7)' }}> *</span>}
                    </label>
                    {newAddr.country === 'US' ? (
                      <select className={inputCls} style={inputStyle} value={newAddr.state}
                        onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))}>
                        <option value="">Select state...</option>
                        {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                      </select>
                    ) : (
                      <input className={inputCls} style={inputStyle} value={newAddr.state}
                        onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))}
                        placeholder="State / Province / Region" />
                    )}
                  </div>

                  {/* City + Postal Code */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>
                        City <span style={{ color: 'rgba(198,40,40,0.7)' }}>*</span>
                      </label>
                      <input className={inputCls} style={inputStyle} value={newAddr.city}
                        onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))}
                        required placeholder="New York" />
                    </div>
                    <div>
                      <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>
                        {newAddr.country === 'US' ? 'ZIP Code' : 'Postal Code'}
                      </label>
                      <input className={inputCls} style={inputStyle} value={newAddr.postalCode}
                        onChange={e => {
                          const v = newAddr.country === 'US'
                            ? e.target.value.replace(/\D/g, '').slice(0, 5)
                            : e.target.value.slice(0, 10)
                          setNewAddr(p => ({ ...p, postalCode: v }))
                        }}
                        placeholder={newAddr.country === 'US' ? '10001' : '00000'} />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className={labelCls} style={{ fontFamily: BODY, color: GOLD }}>
                      Instructions{' '}
                      <span style={{ color: 'rgba(28,26,20,0.3)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                    </label>
                    <input className={inputCls} style={inputStyle} value={newAddr.notes}
                      onChange={e => setNewAddr(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Door code, floor, neighbor..." />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={addrSaving}
                      className="cursor-pointer px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ fontFamily: BODY, background: GOLD, color: DARK, border: 'none' }}
                    >
                      {addrSaving ? 'Saving...' : 'Add Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddrForm(false)}
                      className="cursor-pointer px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-75"
                      style={{ fontFamily: BODY, color: DARK, background: 'transparent', border: `1px solid rgba(28,26,20,0.2)` }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
