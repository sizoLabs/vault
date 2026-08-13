export const openModal = (name: string) => {
    const modal = document.querySelector(`[data-modal='${name}']`) as HTMLDialogElement
    modal.showModal()
}

export const closeModal = (name: string) => {
    const modal = document.querySelector(`[data-modal='${name}']`) as HTMLDialogElement
    modal.close()
}