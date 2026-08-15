import { useEffect, useState } from "react"

import { createAccount, setAccountMasterPassword } from "@logic/account"
import { getStorage } from "@logic/storage"
import { showAlert } from "@logic/alert"

import Input from "@component/ui/form/input"
import IconSelector from "@component/ui/form/icon"
import Dialog from "@component/ui/dialog/dialog"
import DialogOption from "@component/ui/dialog/option"
import DialogFooter from "@component/ui/dialog/footer"

type CreateAccountModalProps = {
    open: boolean
    onCreate: (accountId: string, masterPassword: string) => void
    onClose: () => void
}

const CreateAccountModal = (props: CreateAccountModalProps) => {

    const { open, onCreate, onClose } = props

    const getEmptyForm = () => ({
        name: "",
        password: "",
        icon: "user"
    })

    const [ form, setForm ] = useState(getEmptyForm())

    useEffect(() => {
        if (!open) return
        setForm(getEmptyForm())
    }, [ open ])

    const handleClose = () => {
        setForm(getEmptyForm())
        onClose()
    }

    const handleSubmit = async () => {

        const trimmedName = form.name.trim()
        const trimmedPassword = form.password.trim()

        if (!trimmedName) {
            showAlert("Please enter an account name", "error", "alert-circle", 3000)
            return
        }

        if (!trimmedPassword) {
            showAlert("Please enter a master password", "error", "alert-circle", 3000)
            return
        }

        try {
            createAccount(trimmedName, form.icon)
            const accountId = getStorage("current-account")

            if (accountId) {
                await setAccountMasterPassword({
                    accountId,
                    masterPassword: trimmedPassword
                })
            }

            showAlert(`<b>${trimmedName}</b> account created successfully!`, "success", "check", 5000)
            setForm(getEmptyForm())
            
            if (accountId) {
                onCreate(accountId, trimmedPassword)
            }
            
            onClose()
        } catch (error) {
            showAlert("Failed to create account", "error", "alert-circle", 3000)
            console.error(error)
        }
    }

    return (
        <Dialog
            open={open}
            title="Create New Account"
            onClose={handleClose}
            contentClassName="flex flex-col"
            footer={
                <DialogFooter
                    buttons={[
                        {
                            label: "Cancel",
                            variant: "cancel",
                            onClick: handleClose
                        },
                        {
                            label: "Create",
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
                description="Enter a name for this account"
                layout="row"
            >
                <Input
                    id="account-name"
                    name="account-name"
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
                description="Choose an icon for this account"
                layout="row"
            >
                <IconSelector
                    value={form.icon}
                    onChange={(payload: any) => {
                        const nextIcon = typeof payload === "string"
                            ? payload
                            : payload?.value || "user"

                        setForm({ ...form, icon: nextIcon })
                    }}
                />
            </DialogOption>

            <DialogOption
                title="Master Password"
                description="Set the master password for this account"
                layout="row"
            >
                <Input
                    id="account-password"
                    name="account-password"
                    type="password"
                    value={form.password}
                    placeholder="Enter a secure password"
                    onChange={(event: any) => {
                        setForm({ ...form, password: event.target.value })
                    }}
                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                />
            </DialogOption>
        </Dialog>
    )
}

export default CreateAccountModal
