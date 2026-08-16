import { useEffect, useState } from "react"

import { getVault, updateVault, deleteVault } from "@logic/vault"
import { showAlert } from "@logic/alert"

import Input from "@component/ui/form/input"
import IconSelector from "@component/ui/form/icon"
import Dialog from "@component/ui/dialog/dialog"
import DialogOption from "@component/ui/dialog/option"
import DialogFooter from "@component/ui/dialog/footer"

type EditVaultModalProps = {
    open: boolean
    accountId: string
    vaultId: string
    onUpdate: () => void
    onClose: () => void
}

const EditVaultModal = (props: EditVaultModalProps) => {

    const { open, accountId, vaultId, onUpdate, onClose } = props

    const getEmptyVaultForm = () => ({
        name: '',
        icon: 'vault'
    })

    const [ vaultForm, setVaultForm ] = useState(getEmptyVaultForm())

    useEffect(() => {
        if (!open || !accountId || !vaultId) {
            setVaultForm(getEmptyVaultForm())
            return
        }

        const vault = getVault({ accountId, vaultId })

        if (vault) {
            setVaultForm({
                name: vault.name || '',
                icon: vault.icon || 'vault'
            })
            return
        }

        setVaultForm(getEmptyVaultForm())
    }, [ open, accountId, vaultId ])

    const handleClose = () => {
        setVaultForm(getEmptyVaultForm())
        onClose()
    }

    const handleSubmit = () => {

        if (!vaultForm.name.trim()) {
            return showAlert("Please fill in the vault name.", "error", "alert-circle", 3000)
        }

        try {
            updateVault({
                accountId,
                vaultId,
                vaultName: vaultForm.name,
                vaultIcon: vaultForm.icon
            })

            showAlert(`<b>${vaultForm.name}</b> vault updated successfully!`, 'success', 'check', 5000)

            setVaultForm(getEmptyVaultForm())
            onUpdate()
            onClose()

        } catch (error) {
            showAlert("Error updating vault. Please try again.", "error", "alert-circle", 3000)
            console.error("Error updating vault:", error)
        }
    }

    const handleDelete = () => {

        if (!vaultId) return

        const confirmed = window.confirm(
            `Are you sure you want to delete this vault and all of its services and secrets? This action cannot be undone.`
        )

        if (!confirmed) return

        try {
            deleteVault({ accountId, vaultId })
            showAlert(`<b>${vaultForm.name || "Vault"}</b> deleted successfully!`, 'success', 'check', 5000)
            setVaultForm(getEmptyVaultForm())
            onUpdate()
            onClose()
        } catch (error) {
            showAlert("Error deleting vault. Please try again.", "error", "alert-circle", 3000)
            console.error("Error deleting vault:", error)
        }
    }

    return (
        <Dialog
            open={open}
            title="Edit Vault"
            onClose={handleClose}
            contentClassName="flex flex-col"
            footer={
                <DialogFooter
                    buttons={[
                        {
                            label: "Delete",
                            variant: "delete",
                            onClick: handleDelete
                        },
                        {
                            label: "Cancel",
                            variant: "cancel",
                            position: "end",
                            onClick: handleClose
                        },
                        {
                            label: "Save",
                            variant: "success",
                            position: "end",
                            onClick: handleSubmit
                        }
                    ]}
                />
            }
        >
            <DialogOption
                title="Vault Name"
                description="Update the display name for this vault"
                layout="row"
            >
                <Input
                    id="vault-name"
                    name="vault-name"
                    type="text"
                    value={vaultForm.name}
                    placeholder="e.g. My Personal Vault"
                    onChange={(event: any) => {
                        setVaultForm({ ...vaultForm, name: event.target.value })
                    }}
                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                />
            </DialogOption>

            <DialogOption
                title="Vault Icon"
                description="Select a new icon for the vault"
                layout="row"
            >
                <IconSelector
                    value={vaultForm.icon}
                    onChange={(value: string) => {
                        setVaultForm({ ...vaultForm, icon: value })
                    }}
                />
            </DialogOption>
        </Dialog>
    )
}

export default EditVaultModal
