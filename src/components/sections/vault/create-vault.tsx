import { useState } from "react"

import { createVault } from "@logic/vault"
import { showAlert } from "@logic/alert"

import Input from "@component/ui/form/input"
import IconSelector from "@component/ui/form/icon"
import Dialog from "@component/ui/dialog/dialog"
import DialogOption from "@component/ui/dialog/option"
import DialogFooter from "@component/ui/dialog/footer"

type CreateVaultModalProps = {
    open: boolean
    accountId: string
    onCreate: () => void
    onClose: () => void
}

const CreateVaultModal = (props: CreateVaultModalProps) => {

    const { open, accountId, onCreate, onClose } = props

    const getEmptyVaultForm = () => ({
        name: '',
        icon: 'vault'
    })

    const [ vaultForm, setVaultForm ] = useState(getEmptyVaultForm())

    const handleClose = () => {
        setVaultForm(getEmptyVaultForm())
        onClose()
    }

    const handleCreateSubmit = () => {

        if (!vaultForm.name.trim()) {
            return showAlert("Please fill in the vault name.", "error", "alert-circle", 3000)
        }

        try {

            createVault({
                accountId,
                vaultName: vaultForm.name,
                vaultIcon: vaultForm.icon
            })

            showAlert(`<b>${vaultForm.name}</b> vault created successfully!`, 'success', 'check', 5000)
            
            setVaultForm(getEmptyVaultForm())
            onCreate()
            handleClose()

        } catch (error) {
            showAlert("Error creating vault. Please try again.", "error", "alert-circle", 3000)
            console.error("Error creating vault:", error)
        }
    }

    return (
        <Dialog
            open={open}
            title="Create New Vault"
            onClose={handleClose}
            contentClassName="flex flex-col"
            footer={
                <DialogFooter
                    buttons={[
                        {
                            label: "Cancel",
                            variant: "cancel",
                            position: "start",
                            onClick: handleClose
                        },
                        {
                            label: "Create",
                            variant: "success",
                            position: "end",
                            onClick: handleCreateSubmit
                        }
                    ]}
                />
            }
        >
            <DialogOption
                title="Vault Name"
                description="Choose a name for your new vault"
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
                description="Select an icon for your vault"
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

export default CreateVaultModal
