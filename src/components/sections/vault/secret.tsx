import { useEffect, useState } from "react"

import { updateSecret, getSecretContent } from "@logic/secret"
import { getStorage } from "@logic/storage"
import { getVaultList } from "@logic/vault"

import Select from "@component/ui/form/select"
import Input from "@component/ui/form/input"
import Dialog from "@component/ui/dialog/dialog"
import DialogOption from "@component/ui/dialog/option"
import DialogFooter from "@component/ui/dialog/footer"

import type { ISecret } from "@interface/index"

type SecretModalProps = {
    open: boolean
    vaultId: string
    accountId: string
    secretId: string
    masterPassword: string
    onUpdate: () => void
    onClose: () => void
    onServiceUpdated?: () => void
}

const SecretModal = (props: SecretModalProps) => {

    const { open, vaultId, accountId, secretId, masterPassword, onUpdate, onClose } = props

    const getEmptySecret = (): ISecret => ({
        id: "",
        name: "",
        description: "",
        icon: "",
        content: "",
        vault: ""
    })

    const getEmptyForm = () => ({
        id: "",
        name: "",
        description: "",
        icon: "",
        content: "",
        vault: ""
    })

    const [ secret, setSecret ] = useState<ISecret>(getEmptySecret())
    const [ form, setForm ] = useState(getEmptyForm())

    const resetServiceState = () => {
        setSecret(getEmptySecret())
        setForm(getEmptyForm())
    }

    const handleSubmit = async (event: any) => {

        event.preventDefault()

        if(!form.name) return

        await updateSecret({
            accountId,
            secretId,
            name: form.name,
            description: form.description,
            icon: form.icon,
            content: form.content,
            vault: form.vault,
            masterPassword: masterPassword
        })
        
        onUpdate()
        onClose()

    }

    const handleClose = () => {
        onClose()
    }

    const getSecretData = async () => {

        if (!secretId) {
            resetServiceState()
            return
        }

        const account = getStorage(accountId)
        const secret = account?.secrets?.find((secret: ISecret) => secret.id === secretId)

        const content = await getSecretContent(secret.content, masterPassword)
        const description = await getSecretContent(secret.description, masterPassword)
            
        if(secret) {

            const nextForm = {
                id: secret.id,
                name: secret.name,
                icon: secret.icon,
                description: description,
                content: content,
                vault: secret.vault
            }

            setSecret(secret)
            setForm(nextForm)

            return
            
        }

        resetServiceState()

    }

    useEffect(() => {
        getSecretData()
    }, [ accountId, secretId ])

    if(!secretId) return null

    return (
        <Dialog
            open={open}
            title={ secret.name || "Secret" }
            onClose={onClose}
            contentClassName="flex flex-col"
            footer={
                <DialogFooter
                    buttons={[
                        {
                            label: "Delete",
                            variant: "delete",
                            onClick: () => {}
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
                            onClick: () => handleSubmit({ preventDefault: () => {} } as any)
                        }
                    ]}
                />
            }
        >
            <DialogOption
                title="Secret Name"
                description="The name of the secret"
                layout="row"
            >
                <Input
                    id="secret-name"
                    name="secret-name"
                    type="text"
                    value={ form.name }
                    placeholder="e.g. API key"
                    onChange={ (event: any) => setForm({ ...form, name: event.target.value }) }
                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle squircle-md"
                />
            </DialogOption>
            <DialogOption
                title="Description"
                description="Additional details about this secret"
                layout="col"
            >
                <textarea
                    id="secret-description"
                    value={ form.description }
                    minLength={ 0 }
                    maxLength={ 300 }
                    rows={ 3 }
                    onChange={ (event: any) => setForm({ ...form, description: event.target.value }) }
                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle squircle-sm"
                />
            </DialogOption>
            <DialogOption
                title="Vault"
                description="Choose the vault for this secret"
                layout="row"
                className="md:min-w-70 md:w-fit"
            >
                <Select
                    id="secret-vault"
                    options={ getVaultList(accountId) }
                    selected={ form.vault || vaultId }
                    onSelect={(event: any) => {
                        const newVault = event?.value ?? form.vault ?? vaultId;
                        setForm({ ...form, vault: newVault });
                    }}
                />
            </DialogOption>
            <DialogOption
                title="Secret Value"
                description="The content to store in this secret"
                layout="col"
            >
                <textarea
                    id="secret-content"
                    value={ form.content }
                    rows={ 6 }
                    onChange={ (event: any) => setForm({ ...form, content: event.target.value }) }
                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle squircle-sm"
                />
            </DialogOption>
        </Dialog>
    )
}

export default SecretModal
