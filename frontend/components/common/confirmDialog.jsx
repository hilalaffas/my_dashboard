'use client'
import { Modal } from './modal'
export function ConfirmDialog({ title, message, confirmLabel = 'Hapus', onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="modal-text">{message}</p>
      <div className="modal-actions">
        <button className="outline-button" onClick={onClose}>
          Batal
        </button>
        <button className="danger-button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
