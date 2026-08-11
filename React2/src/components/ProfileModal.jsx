import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useQueryClient } from '@tanstack/react-query'
import { useMode } from '../context/ModeContext'
import { useToast } from '../context/ToastContext'
import Avatar from './Avatar'

const API = import.meta.env.VITE_API_URL
const AVATAR_STYLES = ['lorelei', 'notionists', 'avataaars', 'funEmoji', 'adventurer', 'micah', 'thumbs', 'bottts']

const ProfileModal = ({ open, onClose, userData }) => {
    const { mode, toggleMode } = useMode()
    const { showToast } = useToast()
    const queryClient = useQueryClient()

    const [userName, setUserName] = useState('')
    const [avatarStyle, setAvatarStyle] = useState('lorelei')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)
    const [showPasswordFields, setShowPasswordFields] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const passwordSectionRef = useRef(null)

    // Sync local edit state whenever the modal opens with fresh data.
    useEffect(() => {
        if (open && userData) {
            setUserName(userData.userName || '')
            setAvatarStyle(userData.avatarStyle || 'lorelei')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmDelete(false)
            setShowPasswordFields(false)
        }
    }, [open, userData])

    // Close on Escape.
    useEffect(() => {
        if (!open) return
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    // Auto-close the password section when clicking anywhere else in the modal.
    useEffect(() => {
        if (!showPasswordFields) return
        const onMouseDown = (e) => {
            if (passwordSectionRef.current && !passwordSectionRef.current.contains(e.target)) {
                setShowPasswordFields(false)
                setCurrentPassword('')
                setNewPassword('')
            }
        }
        document.addEventListener('mousedown', onMouseDown)
        return () => document.removeEventListener('mousedown', onMouseDown)
    }, [showPasswordFields])

    if (!open) return null

    const authHeader = () => ({ headers: { Authorization: `Bearer ${Cookies.get('token')}` } })
    const dirty = userData && (userName !== userData.userName || avatarStyle !== userData.avatarStyle)
    const memberSince = userData?.createdAt
        ? new Date(userData.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
        : null

    const saveProfile = async () => {
        if (!userName.trim()) {
            showToast({ type: 'error', title: 'Username required', description: 'Your username can’t be empty.' })
            return
        }
        setShowPasswordFields(false)
        setCurrentPassword('')
        setNewPassword('')
        setSavingProfile(true)
        try {
            await axios.patch(`${API}/api/v1/profile`, { userName: userName.trim(), avatarStyle }, authHeader())
            await queryClient.invalidateQueries({ queryKey: ['profile'] })
            showToast({ type: 'success', title: 'Saved', description: 'Your profile has been updated.' })
        } catch (error) {
            const msg = error.response?.data?.message || 'Could not update your profile. Please try again.'
            showToast({ type: 'error', title: 'Update failed', description: msg })
        } finally {
            setSavingProfile(false)
        }
    }

    const changePassword = async () => {
        if (newPassword.length < 6) {
            showToast({ type: 'error', title: 'Password too short', description: 'Use at least 6 characters.' })
            return
        }
        setSavingPassword(true)
        try {
            await axios.patch(`${API}/api/v1/profile/password`, { currentPassword, newPassword }, authHeader())
            setCurrentPassword('')
            setNewPassword('')
            setShowPasswordFields(false)
            showToast({ type: 'success', title: 'Password changed', description: 'Use your new password next time you sign in.' })
        } catch (error) {
            const msg = error.response?.data?.message || 'Could not change your password. Please try again.'
            showToast({ type: 'error', title: 'Change failed', description: msg })
        } finally {
            setSavingPassword(false)
        }
    }

    const signOut = () => {
        Cookies.remove('token')
        queryClient.clear()
        window.location.href = '/login'
    }

    const deleteAccount = async () => {
        setDeleting(true)
        try {
            await axios.delete(`${API}/api/v1/profile`, authHeader())
            Cookies.remove('token')
            queryClient.clear()
            showToast({ type: 'success', title: 'Account deleted', description: 'Your account has been removed. Take care.' })
            window.location.href = '/sign-up'
        } catch (error) {
            const msg = error.response?.data?.message || 'Could not delete your account. Please try again.'
            showToast({ type: 'error', title: 'Delete failed', description: msg })
            setDeleting(false)
        }
    }

    const inputClass = 'w-full border py-2.5 px-3.5 rounded-xl border-input-border bg-input-bg text-input-text outline-none focus:border-primary transition-colors placeholder:text-placeholder text-sm'
    const labelClass = 'font-label text-[11px] uppercase tracking-[0.18em] text-text-subtle'

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Account settings"
        >
            <div
                className="relative w-full max-w-md max-h-[88vh] overflow-y-auto custom-scrollbar bg-surface border border-border rounded-3xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative p-6 pb-5 border-b border-border">
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <Avatar
                            seed={userData?.email}
                            avatarStyle={avatarStyle}
                            className="w-16 h-16 rounded-2xl bg-bg border border-border shrink-0 shadow-lg"
                        />
                        <div className="min-w-0">
                            <h2 className="font-headline italic text-2xl text-text leading-tight truncate">{userData?.fullName}</h2>
                            <p className="text-sm text-text-muted truncate">@{userData?.userName}</p>
                            {memberSince && (
                                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-text-subtle mt-1">Keeping time since {memberSince}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Appearance / theme */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={labelClass}>Appearance</p>
                            <p className="font-body text-text mt-1 text-sm">{mode === 'light' ? 'Light' : 'Dark'} mode</p>
                        </div>
                        <button
                            onClick={toggleMode}
                            className="btn-glass px-4 py-2 rounded-full text-sm text-text flex items-center gap-2"
                        >
                            <span>{mode === 'light' ? '🌙' : '☀️'}</span>
                            Switch to {mode === 'light' ? 'dark' : 'light'}
                        </button>
                    </div>

                    {/* Profile: avatar + username */}
                    <div className="space-y-4">
                        <p className={labelClass}>Profile</p>
                        <div>
                            <p className="font-body text-text-muted text-xs mb-2">Profile image</p>
                            <div className="grid grid-cols-4 gap-2.5">
                                {AVATAR_STYLES.map((style) => {
                                    const active = style === avatarStyle
                                    return (
                                        <button
                                            key={style}
                                            onClick={() => setAvatarStyle(style)}
                                            aria-label={`Use ${style} avatar`}
                                            className={`rounded-2xl p-1.5 border transition-all ${active ? 'border-primary bg-primary/10 scale-105' : 'border-border hover:border-border-mid'}`}
                                        >
                                            <Avatar seed={userData?.email} avatarStyle={style} className="w-full aspect-square rounded-xl bg-bg" />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="pm-username" className={labelClass}>Username</label>
                            <input id="pm-username" className={inputClass} value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="username" />
                        </div>
                        <button
                            onClick={saveProfile}
                            disabled={savingProfile || !dirty}
                            className="w-full py-3 rounded-full bg-primary text-on-primary font-label text-sm uppercase tracking-widest font-semibold hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {savingProfile ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>

                    {/* Password — collapsible */}
                    <div ref={passwordSectionRef} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className={labelClass}>Change password</p>
                            {showPasswordFields && (
                                <button
                                    onClick={() => {
                                        setShowPasswordFields(false)
                                        setCurrentPassword('')
                                        setNewPassword('')
                                    }}
                                    aria-label="Close password fields"
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            )}
                        </div>

                        {!showPasswordFields ? (
                            <button
                                onClick={() => setShowPasswordFields(true)}
                                className="w-full py-3 rounded-full btn-glass text-text font-label text-sm uppercase tracking-widest hover:text-primary"
                            >
                                Change password
                            </button>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <label htmlFor="pm-current" className="font-body text-text-muted text-xs">Current password</label>
                                    <input id="pm-current" type="password" className={inputClass} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="pm-new" className="font-body text-text-muted text-xs">New password</label>
                                    <input id="pm-new" type="password" className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
                                </div>
                                <button
                                    onClick={changePassword}
                                    disabled={savingPassword || !newPassword}
                                    className="w-full py-3 rounded-full btn-glass text-text font-label text-sm uppercase tracking-widest hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {savingPassword ? 'Updating…' : 'Update password'}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Account actions */}
                    <div className="space-y-3 pt-2 border-t border-border">
                        <button
                            onClick={signOut}
                            className="w-full py-3 rounded-full border border-border-mid text-text font-label text-sm uppercase tracking-widest hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Sign out
                        </button>

                        {!confirmDelete ? (
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="w-full py-3 rounded-full text-error font-label text-sm uppercase tracking-widest hover:bg-error/10 transition-colors"
                            >
                                Delete account
                            </button>
                        ) : (
                            <div className="rounded-2xl border border-error/40 bg-error/5 p-4 space-y-3">
                                <p className="font-body text-sm text-text">
                                    This permanently deletes your account and can’t be undone. Are you sure?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setConfirmDelete(false)}
                                        className="flex-1 py-2.5 rounded-full border border-border-mid text-text font-label text-xs uppercase tracking-widest hover:border-primary transition-colors"
                                    >
                                        Keep account
                                    </button>
                                    <button
                                        onClick={deleteAccount}
                                        disabled={deleting}
                                        className="flex-1 py-2.5 rounded-full bg-error text-white font-label text-xs uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-60"
                                    >
                                        {deleting ? 'Deleting…' : 'Delete forever'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileModal
