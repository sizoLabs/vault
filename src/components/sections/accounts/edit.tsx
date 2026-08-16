import { useEffect, useState } from "react"

import { getAccountName, deleteAccount, getAccounts, changeMasterPassword, checkAccountMasterPassword } from "@logic/account"
import { getStorage, setStorage } from "@logic/storage"
import { showAlert } from "@logic/alert"

import Input from "@component/ui/form/input"
import IconSelector from "@component/ui/form/icon"
import Dialog from "@component/ui/dialog/dialog"
import DialogOption from "@component/ui/dialog/option"
import DialogFooter from "@component/ui/dialog/footer"

type EditAccountModalProps = {
    open: boolean
    accountId: string
    onUpdate: () => void
    onClose: () => void
}

const EditAccountModal = (props: EditAccountModalProps) => {

    const { open, accountId, onUpdate, onClose } = props

    const getEmptyForm = () => ({
        name: "",
        icon: "user"
    })

    const [ form, setForm ] = useState(getEmptyForm())
    const [ currentMasterPassword, setCurrentMasterPassword ] = useState<string>("")
    const [ newMasterPassword, setNewMasterPassword ] = useState<string>("")
    const [ deleteMasterPassword, setDeleteMasterPassword ] = useState<string>("")
    const [ isDeleteConfirmOpen, setIsDeleteConfirmOpen ] = useState(false)

    useEffect(() => {
        if (!open || !accountId) {
            setForm(getEmptyForm())
            return
        }

        const account = getStorage(accountId)
        const accountName = getAccountName(accountId)
        const accountIcon = account?.settings?.find((s: any) => s.id === "account-icon")?.value || "user"

        setForm({ name: accountName, icon: accountIcon })
    }, [ open, accountId ])

    const handleClose = () => {
        setForm(getEmptyForm())
        setCurrentMasterPassword("")
        setNewMasterPassword("")
        onClose()
    }

    const handleSubmit = () => {

        const currentAccountId = getStorage("current-account") || ""

        if (currentAccountId !== accountId) {
            showAlert("Only the active account can be edited.", "error", "alert-circle", 3000)
            onClose()
            return
        }

        const nextName = form.name.trim()

        if (!nextName) {
            showAlert("Please enter an account name", "error", "alert-circle", 3000)
            return
        }

        const account = getStorage(accountId)
        if (!account || !Array.isArray(account.settings)) {
            showAlert("Unable to update this account", "error", "alert-circle", 3000)
            return
        }

        const settings = account.settings.map((setting: any) => {
            if (setting.id === "account-name") {
                return { ...setting, value: nextName }
            }
            if (setting.id === "account-icon") {
                return { ...setting, value: form.icon }
            }
            return setting
        })

        setStorage(accountId, { ...account, settings })
        showAlert(`<b>${nextName}</b> account updated successfully!`, "success", "check", 5000)
        onUpdate()
        onClose()

    }

    const handleDelete = () => {
        if (!accountId) return

        const currentAccountId = getStorage("current-account") || ""

        if (currentAccountId !== accountId) {
            showAlert("Only the active account can be edited.", "error", "alert-circle", 3000)
            onClose()
            return
        }

        setDeleteMasterPassword("")
        setIsDeleteConfirmOpen(true)
    }

    const handleDeleteSubmit = async () => {
        if (!deleteMasterPassword.trim()) {
            showAlert("Please enter your Master Password", "error", "exclamation-circle", 5000)
            return
        }

        const isValidPassword = await checkAccountMasterPassword({
            accountId,
            masterPassword: deleteMasterPassword
        })

        if (!isValidPassword) {
            showAlert("Master Password is incorrect", "error", "exclamation-circle", 5000)
            return
        }

        const accounts = getAccounts()

        deleteAccount(accountId)

        if (getStorage("current-account") === accountId) {
            setStorage("current-account", "")
        }

        setDeleteMasterPassword("")
        setIsDeleteConfirmOpen(false)

        showAlert("Account deleted successfully", "success", "check", 5000)
        onUpdate()
        onClose()

        window.location.reload()
    }

    const handleChangeMasterPasswordSubmit = async () => {

        if (!currentMasterPassword) {
            return showAlert("Please enter your current Master Password", 'error', 'exclamation-circle', 5000)
        }

        const isValidPassword = await checkAccountMasterPassword({
            accountId,
            masterPassword: currentMasterPassword
        })

        if (!isValidPassword) {
            return showAlert("Current Master Password is incorrect", 'error', 'exclamation-circle', 5000)
        }

        if(!newMasterPassword) {
            return showAlert("Please enter a new Master Password", 'error', 'exclamation-circle', 5000)
        }

        if(newMasterPassword === currentMasterPassword) {
            return showAlert("New Master Password cannot be the same as the current", 'error', 'exclamation-circle', 5000)
        }

        const confirmation = confirm("Are you sure you want to change the master password? All your passwords will be re-encrypted with the new master password. This action cannot be undone.")
        if (!confirmation) return
        
        const success = await changeMasterPassword({
            accountId,
            newMasterPassword
        })
        
        if (success) {
            setCurrentMasterPassword("")
            setNewMasterPassword("")
            setTimeout(() => {
                window.location.reload()
            }, 2000)
        }

    }

    return (
        <>
            <Dialog
                open={open}
                title="Edit Account"
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
                    title="Account Name"
                    description="Update the display name for this account"
                    layout="row"
                >
                    <Input
                        id="account-edit-name"
                        name="account-edit-name"
                        type="text"
                        value={form.name}
                        placeholder="My Personal Account"
                        onChange={(event: any) => {
                            setForm({ ...form, name: event.target.value })
                        }}
                        className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                    />
                </DialogOption>
                <DialogOption
                    title="Account Icon"
                    description="Update the icon for this account"
                    layout="row"
                >
                    <IconSelector
                        id="account-edit-icon"
                        value={form.icon}
                        onChange={({ settingId, value }: { settingId: string, value: string }) => {
                            setForm({ ...form, icon: value })
                        }}
                    />
                </DialogOption>
                <DialogOption
                    title="Change Master Password"
                    description={`Change the master password for this account. <span style="color: #ff2056; font-weight: bold; font-family: Inter Bold;">All your passwords will be re-encrypted with the new master password. Backup your data, this action cannot be undone.</span>`}
                    layout="col"
                >
                    <div className="w-full">
                        <Input
                            id="current-master-password-edit"
                            type="password"
                            placeholder="Current Master Password"
                            value={ currentMasterPassword }
                            onChange={ (event: React.ChangeEvent<HTMLInputElement>) => setCurrentMasterPassword(event.target.value) }
                            className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md mb-3"
                        />
                        <Input
                            id="new-master-password-edit"
                            type="password"
                            placeholder="New Master Password"
                            value={ newMasterPassword }
                            onChange={ (event: React.ChangeEvent<HTMLInputElement>) => setNewMasterPassword(event.target.value) }
                            className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md mb-3"
                        />
                        <button
                            onClick={ handleChangeMasterPasswordSubmit }
                            className="font-inter-bold h-fit w-full px-3 py-3 border duration-300 bg-rose-500/10 border-rose-500/50 hover:bg-rose-500/20 hover:border-rose-500 hover:text-white focus:bg-rose-500/20 focus:border-rose-500 squircle-md cursor-pointer"
                        >
                            Change Master Password
                        </button>
                    </div>
                </DialogOption>
            </Dialog>

            <Dialog
                open={isDeleteConfirmOpen}
                title="Delete Account"
                onClose={() => {
                    setDeleteMasterPassword("")
                    setIsDeleteConfirmOpen(false)
                }}
                contentClassName="flex flex-col gap-4 p-5"
                footer={
                    <DialogFooter
                        buttons={[
                            {
                                label: "Cancel",
                                variant: "cancel",
                                onClick: () => {
                                    setDeleteMasterPassword("")
                                    setIsDeleteConfirmOpen(false)
                                }
                            },
                            {
                                label: "Delete",
                                variant: "delete",
                                position: "end",
                                onClick: handleDeleteSubmit
                            }
                        ]}
                    />
                }
            >
                <DialogOption
                    title="Confirm deletion"
                    description="This action will permanently delete the account and all its data. Enter the Master Password to continue."
                    layout="col"
                    className="max-w-100"
                >
                    <Input
                        id="delete-account-master-password"
                        type="password"
                        placeholder="Master Password"
                        value={deleteMasterPassword}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDeleteMasterPassword(event.target.value)}
                        className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                    />
                </DialogOption>
            </Dialog>
        </>
    )
}

export default EditAccountModal
