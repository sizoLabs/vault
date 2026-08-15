import { useEffect, useState } from "react"

import { getAlphabetList, getAlphabet } from "@logic/alphabet"
import { createService, getServiceCountInVault } from "@logic/service"
import { createSecret, getSecretCountInVault } from "@logic/secret"
import { genServicePassword, copyToClipboard, generateId } from "@logic/utils"
import { getVaultList } from "@logic/vault"
import { getSetting } from "@logic/settings"
import { showAlert } from "@logic/alert"

import Select from "@component/ui/form/select"
import Input from "@component/ui/form/input"
import IconSelector from "@component/ui/form/icon"
import Dialog from "@component/ui/dialog/dialog"
import DialogOption from "@component/ui/dialog/option"
import DialogFooter from "@component/ui/dialog/footer"

type CreateModalProps = {
    open: boolean
    vaultId: string
    accountId: string
    masterPassword: string
    onCreate: () => void
    onClose: () => void
}

type CreateMode = "service" | "secret"

const CreateModal = (props: CreateModalProps) => {

    const { open, vaultId, accountId, masterPassword, onCreate, onClose } = props

    const getDefaultServiceLength = () => {
        const configuredLength = Number(getSetting({ accountId, settingId: "default-password-length" }))
        return Number.isFinite(configuredLength) && configuredLength > 0 ? configuredLength : 14
    }

    const getEmptyServiceForm = () => {

        const totalServices = getServiceCountInVault(accountId, vaultId)
        const defaultAlphabetId = getSetting({ accountId, settingId: "default-alphabet" })
        const alphabets = getAlphabetList(accountId)
        const alphabet = alphabets.find((item: any) => item.id === defaultAlphabetId) || alphabets[0]
        const generatedIdentifier = `service-${totalServices + 1}-${generateId().slice(0, 12)}`

        return {
            name: 'Service #' + (totalServices + 1),
            vault: '',
            icon: 'password-user',
            description: '',
            url: '',
            identifier: generatedIdentifier,
            alphabet: alphabet?.id ?? '',
            length: getDefaultServiceLength(),
            version: 1
        }
    }

    const getEmptySecretForm = () => {

        const totalSecrets = getSecretCountInVault(accountId, vaultId)

        return {
            name: 'Secret #' + (totalSecrets + 1),
            vault: '',
            description: '',
            icon: 'password-fingerprint',
            content: ''
        }
    }
    
    const [ showServicePassword, setShowServicePassword ] = useState(
        Boolean(getSetting({
            accountId,
            settingId: "show-passwords"
        }))
    )
    
    const [ mode, setMode ] = useState<CreateMode>("service")

    const [ passwordCopied, setPasswordCopied ] = useState(false)
    const [ password, setPassword ] = useState('')
    const [ serviceForm, setServiceForm ] = useState(getEmptyServiceForm())
    const [ secretForm, setSecretForm ] = useState(getEmptySecretForm())

    const accountShowPasswords = Boolean(getSetting({ accountId, settingId: "show-passwords" }))
    const shouldDisplayPassword = showServicePassword
    const maskedPassword = password ? "•".repeat(Math.max(password.length, 12)) : ""

    const resetCreateState = () => {
        const nextServiceForm = getEmptyServiceForm()

        setMode("service")
        setServiceForm(nextServiceForm)
        setSecretForm(getEmptySecretForm())
        setPassword('')
        setPasswordCopied(false)
        setShowServicePassword(accountShowPasswords)

        if (nextServiceForm.identifier && nextServiceForm.alphabet) {
            generatePassword(nextServiceForm.alphabet, nextServiceForm.length, nextServiceForm.identifier, nextServiceForm.version)
        }
    }

    useEffect(() => {
        if (open) {
            resetCreateState()
        }
    }, [ open, accountId ])

    const handleCreateSubmit = async (event: any) => {

        event.preventDefault()

        if (mode === "service") {

            if (!serviceForm.identifier) return showAlert("Please fill in the required fields: Name and Identifier.", "error", "alert-circle", 3000)

            await createService({
                accountId,
                vaultId: serviceForm.vault || vaultId,
                name: serviceForm.name,
                description: serviceForm.description,
                url: serviceForm.url,
                icon: serviceForm.icon,
                identifier: serviceForm.identifier,
                alphabet: serviceForm.alphabet,
                length: serviceForm.length,
                masterPassword: masterPassword
            })

            showAlert(`<b>${serviceForm.name}</b> created successfully!`, 'success', 'check', 5000)

        }

        if (mode === "secret") {

            if (!secretForm.content) return showAlert("Please fill in the required fields: Name and Content.", "error", "alert-circle", 3000)

            await createSecret({
                accountId,
                name: secretForm.name,
                description: secretForm.description,
                icon: secretForm.icon,
                content: secretForm.content,
                vault: secretForm.vault || vaultId,
                masterPassword: masterPassword
            })

            showAlert(`<b>${secretForm.name}</b> created successfully!`, 'success', 'check', 5000)

        }
        
        onCreate()
        onClose()

    }

    const handleClose = () => {
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

    return (
        <Dialog
            open={open}
            title={ mode === "service" ? "Create New Service" : "Create New Secret" }
            onClose={onClose}
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
                            onClick: () => handleCreateSubmit({ preventDefault: () => {} } as any)
                        }
                    ]}
                />
            }
        >
            <div className="sticky h-13 md:h-17 top-16.25 overflow-hidden md:top-17.25 z-20 border-b border-white/10 bg-white/2 px-2 pt-2 backdrop-blur-xl inset-shadow-bottom">
                <div className="flex gap-2 w-full">
                    {([
                        { id: "service", label: "Service", icon: "ti ti-password-user" },
                        { id: "secret", label: "Secret", icon: "ti ti-password-fingerprint" }
                    ] as const).map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setMode(tab.id)}
                            className={ `flex-1 text-sm md:text-lg font-inter-bold cursor-pointer border squircle-md px-3 pt-3.5 md:pt-5 pb-10 duration-300 text-white/50 ${mode === tab.id ? "text-white! bg-primary/20 border-primary" : "bg-white/2 border-white/5 hover:bg-white/10 hover:border-white/20"}` }
                        >
                            <i className={ `${tab.icon} text-sm md:text-[20px] align-middle inline-block -mt-1.25 md:-mt-0.75 mr-2` } />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {mode === "service" ? (
                <>
                    <DialogOption
                        title="Service Name"
                        description="The name of the service"
                        layout="row"
                    >
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            value={ serviceForm.name }
                            placeholder="e.g. Example Service"
                            onChange={ (event: any) => {
                                setServiceForm({ ...serviceForm, name: event.target.value });
                            }}
                            className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                        />
                    </DialogOption>
                    <DialogOption
                        title="Details"
                        description="Additional details about this service. E.g. username, email..."
                        layout="col"
                    >
                        <textarea
                            id="description"
                            value={ serviceForm.description }
                            minLength={ 0 }
                            maxLength={ 300 }
                            rows={ 3 }
                            onChange={ (event: any) => setServiceForm({ ...serviceForm, description: event.target.value }) }
                            className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle squircle-sm"
                        />
                    </DialogOption>
                    <DialogOption
                        title="URL"
                        description="The URL of the service. Used to open the service in a new tab"
                        layout="row"
                        className="md:min-w-70"
                    >
                        <Input
                            id="url"
                            type="url"
                            value={ serviceForm.url }
                            placeholder="e.g. https://example.com"
                            onChange={ (event: any) => setServiceForm({ ...serviceForm, url: event.target.value }) }
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
                            value={ serviceForm.identifier }
                            placeholder="e.g. service.com"
                            onChange={ (event: any) => {
                                const newIdentifier = event.target.value;
                                const newForm = {...serviceForm, identifier: newIdentifier };
                                setServiceForm(newForm);
                                generatePassword(newForm.alphabet, newForm.length, newIdentifier, newForm.version);
                            }}
                            className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                        />
                    </DialogOption>
                    <DialogOption
                        title="Vault"
                        description="Vault where this service will be stored"
                        layout="row"
                        className="md:min-w-70 md:w-fit"
                    >
                        <Select
                            id="vault"
                            options={ getVaultList(accountId) }
                            selected={ serviceForm.vault || vaultId }
                            onSelect={(event: any) => {
                                const newVault = event?.value ?? serviceForm.vault ?? vaultId;
                                setServiceForm({ ...serviceForm, vault: newVault });
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
                            value={ serviceForm.icon }
                            onChange={ (newIcon: string) => {
                                const newForm = { ...serviceForm, icon: newIcon }
                                setServiceForm(newForm)
                            }}
                        />
                    </DialogOption>
                    <DialogOption
                        title="Alphabet"
                        description="Character set used to generate the password"
                        layout="row"
                        className="md:min-w-70 md:w-fit"
                    >
                        <Select
                            id="alphabet"
                            options={ getAlphabetList(accountId) }
                            selected={ serviceForm.alphabet }
                            descriptions={ true }
                            onSelect={(event: any) => {
                                const newAlphabet = event?.value ?? serviceForm.alphabet;
                                const newForm = { ...serviceForm, alphabet: newAlphabet };
                                setServiceForm(newForm);
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
                            value={ serviceForm.length }
                            type="number"
                            onChange={ (event: any) => {
                                const newLength = parseInt(event.target.value, 10);
                                const newForm = { ...serviceForm, length: newLength };
                                setServiceForm(newForm);
                                generatePassword(newForm.alphabet, newLength, newForm.identifier, newForm.version);
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
                </>
            ) : (
                <>
                    <DialogOption
                        title="Secret Name"
                        description="The name of the secret"
                        layout="row"
                    >
                        <Input
                            id="secret-name"
                            name="secret-name"
                            type="text"
                            value={ secretForm.name }
                            placeholder="e.g. API key"
                            onChange={ (event: any) => setSecretForm({ ...secretForm, name: event.target.value }) }
                            className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                        />
                    </DialogOption>
                    <DialogOption
                        title="Description"
                        description="Additional details about this secret"
                        layout="col"
                    >
                        <textarea
                            id="secret-description"
                            value={ secretForm.description }
                            minLength={ 0 }
                            maxLength={ 300 }
                            rows={ 3 }
                            onChange={ (event: any) => setSecretForm({ ...secretForm, description: event.target.value }) }
                            className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle squircle-sm"
                        />
                    </DialogOption>
                    <DialogOption
                        title="Vault"
                        description="Vault where this secret will be stored"
                        layout="row"
                        className="md:min-w-70 md:w-fit"
                    >
                        <Select
                            id="secret-vault"
                            options={ getVaultList(accountId) }
                            selected={ secretForm.vault || vaultId }
                            onSelect={(event: any) => {
                                const newVault = event?.value ?? secretForm.vault ?? vaultId;
                                setSecretForm({ ...secretForm, vault: newVault });
                            }}
                        />
                    </DialogOption>
                    <DialogOption
                        title="Icon"
                        description="Icon for the secret"
                        layout="row"
                        className="w-full md:min-w-70"
                    >
                        <IconSelector
                            value={ secretForm.icon }
                            onChange={ (newIcon: string) => {
                                const newForm = { ...secretForm, icon: newIcon }
                                setSecretForm(newForm)
                            }}
                        />
                    </DialogOption>
                    <DialogOption
                        title="Secret Content"
                        description="The content to store in this secret"
                        layout="col"
                    >
                        <textarea
                            id="secret-content"
                            value={ secretForm.content }
                            rows={ 6 }
                            onChange={ (event: any) => setSecretForm({ ...secretForm, content: event.target.value }) }
                            className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle squircle-sm"
                        />
                    </DialogOption>
                </>
            )}
        </Dialog>
    )
}

export default CreateModal
