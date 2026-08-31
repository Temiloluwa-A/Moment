import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Shared confirm dialog — replaces window.confirm() so destructive actions
// (delete, leave, remove) get a themed modal instead of a native browser alert.
const ConfirmModal = ({
    open,
    title = 'Are you sure?',
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = true,
    loading = false,
    onConfirm,
    onCancel,
}) => {
    useEffect(() => {
        if (!open) return
        const onKey = (e) => { if (e.key === 'Escape') onCancel() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onCancel])

    if (!open) return null

    // Portaled content still bubbles through the React tree, not the DOM tree — when this
    // modal is nested inside another modal's own backdrop-click-to-close div, an unguarded
    // click here would close that parent too. Stop it explicitly.
    const cancel = (e) => { e.stopPropagation(); onCancel() }

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm"
            onClick={cancel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div
                className="relative w-full max-w-sm bg-surface border border-border rounded-3xl shadow-2xl p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-headline italic font-bold text-text">{title}</h2>
                {description && (
                    <p className="font-body text-sm text-text-muted">{description}</p>
                )}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-full border border-border-mid text-text font-label text-xs uppercase tracking-widest hover:border-primary transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 py-2.5 rounded-full font-label text-xs uppercase tracking-widest transition-all disabled:opacity-60 ${danger ? 'bg-error text-white hover:brightness-110' : 'bg-primary text-on-primary hover:bg-primary-hover'}`}
                    >
                        {loading ? 'Please wait…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    )
}

export default ConfirmModal
