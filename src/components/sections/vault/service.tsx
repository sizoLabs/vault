import { useEffect, useState } from "react"

import { getAlphabetList, getAlphabet } from "@logic/alphabet"
import { updateService, deleteService, getServiceDescription } from "@logic/service"
import { genServicePassword, copyToClipboard } from "@logic/utils"
import { getStorage } from "@logic/storage"
import { getVaultList } from "@logic/vault"
import { getSetting } from "@logic/settings"
import { showAlert } from "@logic/alert"

import IconSelector from "@component/ui/form/icon"
import Select from "@component/ui/form/select"
import Input from "@component/ui/form/input"
import Dialog from "@component/ui/dialog/dialog"
import DialogOption from "@component/ui/dialog/option"
import DialogFooter from "@component/ui/dialog/footer"

import type { IService } from "@interface/index"

type ServiceModalProps = {
    open: boolean
    vaultId: string
    accountId: string
    serviceId: string
    masterPassword: string
    onUpdate: () => void
    onClose: () => void
    onServiceUpdated?: () => void
}

const ServiceModal = (props: ServiceModalProps) => {

    const { open, vaultId, accountId, serviceId, masterPassword, onUpdate, onClose } = props

    const getDefaultServiceLength = () => {
        const configuredLength = Number(getSetting({ accountId, settingId: "default-password-length" }))
        return Number.isFinite(configuredLength) && configuredLength > 0 ? configuredLength : 14
    }

    const getDefaultAlphabetId = () => {
        const alphabets = getAlphabetList(accountId)
        const configuredAlphabetId = getSetting({ accountId, settingId: "default-alphabet" })
        return alphabets.find((item: any) => item.id === configuredAlphabetId)?.id || alphabets[0]?.id || ""
    }

    const getEmptyService = (): IService => ({
        id: "",
        vault: "",
        name: "",
        icon: "",
        description: "",
        url: "",
        identifier: "",
        alphabet: "",
        length: getDefaultServiceLength(),
        version: 1
    })

    const getEmptyForm = () => ({
        name: "",
        vault: "",
        icon: "",
        description: "",
        url: "",
        identifier: "",
        alphabet: "",
        length: getDefaultServiceLength(),
        version: 1
    })

    const [ service, setService ] = useState<IService>(getEmptyService())
    
    const [ showServicePassword, setShowServicePassword ] = useState(
        Boolean(getSetting({
            accountId,
            settingId: "show-passwords"
        }))
    )
    const [ passwordCopied, setPasswordCopied ] = useState(false)
    const [ password, setPassword ] = useState('')

    const [ form, setForm ] = useState(getEmptyForm())

    const accountShowPasswords = Boolean(getSetting({ accountId, settingId: "show-passwords" }))
    const shouldDisplayPassword = showServicePassword
    const maskedPassword = password ? "•".repeat(Math.max(password.length, 12)) : ""

    const resetServiceState = () => {
        setService(getEmptyService())
        setForm(getEmptyForm())
        setPassword('')
        setPasswordCopied(false)
        setShowServicePassword(accountShowPasswords)
    }

    const handleSubmit = async (event: any) => {

        event.preventDefault()

        if(!form.identifier) return showAlert("Please fill in the required fields: Identifier", "error", "alert-circle", 3000)

        await updateService({
            accountId,
            serviceId,
            vaultId: form.vault || vaultId,
            name: form.name,
            description: form.description,
            icon: form.icon,
            url: form.url,
            identifier: form.identifier,
            alphabet: form.alphabet,
            length: form.length,
            version: form.version,
            masterPassword: masterPassword
        })

        showAlert(`<b>${form.name || "Service"}</b> updated successfully!`, 'success', 'check', 5000)
        
        onUpdate()
        onClose()

    }

    const handleClose = () => {
        onClose()
    }

    const handleDelete = () => {
        if (!serviceId) return

        const confirmation = confirm("Are you sure you want to delete this service? This action cannot be undone.")
        if (!confirmation) return

        deleteService({
            accountId,
            serviceId
        })

        showAlert(`<b>${form.name || "Service"}</b> deleted successfully!`, 'success', 'check', 5000)

        onUpdate()
        onClose()
    }

    const generatePassword = async (alphabetId: string, length: number, identifier: string, version?: number) => {
        if (!alphabetId || !identifier) {
            setPassword('')
            return
        }

        const alphabet = getAlphabet({ accountId, alphabetId })

        if (!alphabet) {
            setPassword('')
            return
        }

        const password = await genServicePassword(masterPassword, identifier, length, {
            identifier: alphabet.identifier,
            characters: alphabet.characters
        }, version)
        setPassword(password)
    }

    const copyServicePassword = async () => {
        copyToClipboard(password)
        setPasswordCopied(true)
        setTimeout(() => {
            setPasswordCopied(false)
        }, 3000)
    }

    const getServiceData = async () => {

        if (!serviceId) {
            resetServiceState()
            return
        }

        const account = getStorage(accountId)
        const service = account?.services?.find((service: IService) => service.id === serviceId)

        if (service) {
            const description = await getServiceDescription(service.description, masterPassword)
            const resolvedAlphabetId = service.alphabet || getDefaultAlphabetId()
            const nextForm = {
                name: service.name,
                icon: service.icon,
                vault: service.vault,
                description,
                identifier: service.identifier,
                alphabet: resolvedAlphabetId,
                length: service.length,
                version: service.version,
                url: service.url
            }

            setService(service)
            setForm(nextForm)
            setPassword('')
            setShowServicePassword(accountShowPasswords)
            generatePassword(resolvedAlphabetId, service.length, service.identifier, service.version)
            return
        }

        resetServiceState()

    }

    useEffect(() => {
        getServiceData()
    }, [ accountId, serviceId ])

    if(!serviceId) return null

    return (
        <Dialog
            open={open}
            title={ service.name || "Service" }
            onClose={onClose}
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
                            onClick: () => handleSubmit({ preventDefault: () => {} } as any)
                        }
                    ]}
                />
            }
        >
            <DialogOption
                title="Service Name"
                description="The name of the service"
                layout="row"
            >
                <Input
                    id="name"
                    name="name"
                    type="text"
                    value={ form.name }
                    placeholder="e.g. Example Service"
                    onChange={ (event: any) => {
                        setForm({ ...form, name: event.target.value });
                    }}
                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                />
            </DialogOption>
            <DialogOption
                title="Description"
                description="Additional details about this service. Account, Email..."
                layout="col"
            >
                <textarea
                    id="description"
                    value={ form.description }
                    minLength={ 0 }
                    maxLength={ 300 }
                    rows={ 3 }
                    onChange={ (event: any) => setForm({ ...form, description: event.target.value }) }
                    className="w-full font-inter-medium h-fit px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle squircle-sm"
                />
            </DialogOption>
            <DialogOption
                title="URL" 
                description="The URL of the service. Used to open the service in a new tab."
                layout="row"
                className="md:min-w-70"
            >
                <Input
                    id="url"
                    type="url"
                    value={ form.url }
                    placeholder="e.g. https://example.com"
                    onChange={ (event: any) => setForm({ ...form, url: event.target.value }) }
                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                />
            </DialogOption>
            <DialogOption
                title="Identifier"
                description="Unique identifier used to generate the password"
                layout="row"
                className="md:min-w-70"
            >
                <Input
                    name="identifier"
                    id="identifier"
                    type="text"
                    value={ form.identifier }
                    placeholder="e.g. service.com"
                    onChange={ (event: any) => {
                        const newIdentifier = event.target.value;
                        const newForm = {...form, identifier: newIdentifier };
                        setForm(newForm);
                        generatePassword(newForm.alphabet, newForm.length, newIdentifier, newForm.version);
                    }}
                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                />
            </DialogOption>
            <DialogOption
                title="Vault"
                description="Move this service to another vault"
                layout="row"
                className="md:min-w-70"
            >
                <Select
                    id="vault"
                    options={ getVaultList(accountId) }
                    selected={ form.vault || vaultId }
                    onSelect={(event: any) => {
                        const newVault = event?.value ?? form.vault ?? vaultId;
                        setForm({ ...form, vault: newVault });
                    }}
                />
            </DialogOption>
            <DialogOption
                title="Icon"
                description="Icon for the service."
                layout="row"
                className="w-full md:min-w-70"
            >
                <IconSelector
                    value={ form.icon }
                    onChange={ (newIcon: string) => {
                        const newForm = { ...form, icon: newIcon }
                        setForm(newForm)
                    }}
                />
            </DialogOption>
            <DialogOption
                title="Alphabet"
                description="Character set used to generate the password"
                layout="row"
                className="md:min-w-70"
            >
                <Select
                    id="alphabet"
                    options={ getAlphabetList(accountId) }
                    selected={ form.alphabet }
                    descriptions={ true }
                    onSelect={(event: any) => {
                        const newAlphabet = event?.value ?? form.alphabet;
                        const newForm = { ...form, alphabet: newAlphabet };
                        setForm(newForm);
                        generatePassword(newAlphabet, newForm.length, newForm.identifier, newForm.version);
                    }}
                />
            </DialogOption>
            <DialogOption
                title="Password Length"
                description="Length of the generated password"
                layout="row"
            >
                <Input
                    name="length"
                    id="length"
                    value={ form.length }
                    type="number"
                    onChange={ (event: any) => {
                        const newLength = parseInt(event.target.value, 10);
                        const newForm = { ...form, length: newLength };
                        setForm(newForm);
                        generatePassword(newForm.alphabet, newLength, newForm.identifier, newForm.version);
                    }}
                    className="max-w-25 font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                />
            </DialogOption>
            <DialogOption
                title="Password Version"
                description="Increment this to generate a new password for the same service."
                layout="row"
            >
                <Input
                    id="version"
                    name="version"
                    value={ form.version }
                    type="number"
                    min={ 1 }
                    max={ 999 }
                    onChange={ (event: any) => {
                        const newVersion = parseInt(event.target.value, 10);
                        const newForm = { ...form, version: newVersion };
                        setForm(newForm);
                        generatePassword(newForm.alphabet, newForm.length, newForm.identifier, newVersion);
                    }}
                    className="max-w-25 font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                />
            </DialogOption>
            <DialogOption
                title="Password"
                description="Generated password for this service"
                layout="col"
                className="pb-0"
            >
                <div className="w-full">
                    <div className="relative flex items-center gap-3">
                        <div
                            onClick={ copyServicePassword }
                            className={ `relative z-10 min-w-25 block font-inter-medium max-h-13 overflow-hidden w-full px-4 py-3 pr-15 border duration-300 bg-white/5 border-white/20 cursor-pointer focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md text-xl ${passwordCopied ? 'hover:text-emerald-500! text-emerald-500 border-emerald-500! bg-emerald-500/10!' : ''}` }
                            aria-label="Copy Password"
                        >
                            { shouldDisplayPassword ? password : maskedPassword }
                        </div>
                        <button
                            type="button"
                            onClick={ () => setShowServicePassword((currentValue) => !currentValue) }
                            className="absolute right-3 z-20 cursor-pointer h-fit px-2 pt-1.5 pb-0.5 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white text-white/50 squircle-md font-inter-medium text-sm backdrop-blur-xl"
                            aria-label={ shouldDisplayPassword ? "Hide password" : "Show password" }
                        >
                            <i className={ `ti ${shouldDisplayPassword ? "ti-eye-off" : "ti-eye"} text-2xl` } />
                        </button>
                    </div>
                    <div className={ `mt-4 text-sm ${passwordCopied ? 'text-emerald-500 font-inter-bold' : 'text-white/50'}` }>
                        { passwordCopied ? "Password copied to clipboard!" : "Click the password to copy it." }
                    </div>
                </div>
            </DialogOption>
        </Dialog>
    )
}

export default ServiceModal
