export const openModal = (name: string) => {
    const modal = document.querySelector(`[data-modal='${name}']`) as HTMLDialogElement | null
    if (!modal || typeof modal.showModal !== 'function') return
    modal.showModal()
}

export const closeModal = (name: string) => {
    const modal = document.querySelector(`[data-modal='${name}']`) as HTMLDialogElement | null
    if (!modal || typeof modal.close !== 'function') return
    modal.close()
}