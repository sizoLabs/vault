import { useEffect, useState } from "react"

import { getAlphabet, updateAlphabet, deleteAlphabet } from "@logic/alphabet"
import { showAlert } from "@logic/alert"

import Input from "@component/ui/form/input"
import IconSelector from "@component/ui/form/icon"
import Dialog from "@component/ui/dialog/dialog"
import DialogOption from "@component/ui/dialog/option"
import DialogFooter from "@component/ui/dialog/footer"

type EditAlphabetModalProps = {
    open: boolean
    accountId: string
    alphabetId: string
    onUpdate: () => void
    onClose: () => void
}

const EditAlphabetModal = (props: EditAlphabetModalProps) => {

    const { open, accountId, alphabetId, onUpdate, onClose } = props

    const getEmptyForm = () => ({
        name: '',
        identifier: '',
        characters: '',
        description: '',
        icon: 'letters'
    })

    const [ form, setForm ] = useState(getEmptyForm())

    useEffect(() => {
        if (!open || !accountId || !alphabetId) {
            setForm(getEmptyForm())
            return
        }

        const alphabet = getAlphabet({ accountId, alphabetId })

        if (alphabet) {
            setForm({
                name: alphabet.name || '',
                identifier: alphabet.identifier || '',
                characters: alphabet.characters || '',
                description: alphabet.description || '',
                icon: alphabet.icon || 'letters'
            })
            return
        }

        setForm(getEmptyForm())
    }, [ open, accountId, alphabetId ])

    const handleClose = () => {
        setForm(getEmptyForm())
        onClose()
    }

    const handleChange = (field: string, value: string) => {
        setForm({
            ...form,
            [field]: value
        })
    }

    const handleSubmit = () => {

        if (!form.name.trim()) {
            return showAlert("Please fill in the alphabet name.", "error", "alert-circle", 3000)
        }

        if (!form.identifier.trim()) {
            return showAlert("Please fill in the identifier.", "error", "alert-circle", 3000)
        }

        if (!form.characters.trim()) {
            return showAlert("Please fill in the characters.", "error", "alert-circle", 3000)
        }

        try {
            updateAlphabet({
                accountId,
                alphabetId,
                name: form.name,
                identifier: form.identifier,
                characters: form.characters,
                description: form.description,
                icon: form.icon
            })

            showAlert(`<b>${form.name}</b> alphabet updated successfully!`, 'success', 'check', 5000)

            setForm(getEmptyForm())
            onUpdate()
            onClose()

        } catch (error) {
            showAlert("Error updating alphabet. Please try again.", "error", "alert-circle", 3000)
            console.error("Error updating alphabet:", error)
        }
    }

    const handleDelete = () => {

        if (!alphabetId) return

        const confirmed = window.confirm(
            `Are you sure you want to delete the "${form.name}" alphabet? All services that use this alphabet will be affected. This action cannot be undone.`
        )

        if (!confirmed) return

        try {

            deleteAlphabet(accountId, alphabetId)
            showAlert(`<b>${form.name || "Alphabet"}</b> deleted successfully!`, 'success', 'check', 5000)
            setForm(getEmptyForm())
            onUpdate()
            onClose()
            
        } catch (error) {
            showAlert("Error deleting alphabet. Please try again.", "error", "alert-circle", 3000)
            console.error("Error deleting alphabet:", error)
        }
    }

    return (
        <Dialog
            open={open}
            title="Edit Alphabet"
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
                title="Alphabet Name"
                description="Enter a name for this alphabet"
                layout="row"
            >
                <Input
                    id="alphabet-name"
                    name="alphabet-name"
                    type="text"
                    value={form.name}
                    placeholder="My Alphabet"
                    onChange={(event: any) => {
                        handleChange('name', event.target.value)
                    }}
                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                />
            </DialogOption>

            <DialogOption
                title="Description"
                description="Optional description for this alphabet"
                layout="col"
            >
                <textarea
                    id="alphabet-description"
                    name="alphabet-description"
                    value={form.description}
                    rows={3}
                    placeholder="Describe this alphabet"
                    onChange={(event: any) => {
                        handleChange('description', event.target.value)
                    }}
                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                />
            </DialogOption>

            <DialogOption
                title="Identifier"
                description="Unique identifier for this alphabet"
                layout="row"
            >
                <Input
                    id="alphabet-identifier"
                    name="alphabet-identifier"
                    type="text"
                    value={form.identifier}
                    placeholder="my-alphabet"
                    onChange={(event: any) => {
                        handleChange('identifier', event.target.value)
                    }}
                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                />
            </DialogOption>

            <DialogOption
                title="Icon"
                description="Select an icon for this alphabet"
                layout="row"
            >
                <IconSelector
                    value={form.icon}
                    onChange={(value: string) => {
                        handleChange('icon', value)
                    }}
                />
            </DialogOption>

            <DialogOption
                title="Characters"
                description="The character set for this alphabet"
                layout="col"
            >
                <textarea
                    id="alphabet-characters"
                    name="alphabet-characters"
                    value={form.characters}
                    minLength={0}
                    maxLength={1000}
                    rows={3}
                    onChange={(event: any) => {
                        handleChange('characters', event.target.value)
                    }}
                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-sm"
                />
            </DialogOption>

        </Dialog>
    )
}

export default EditAlphabetModal
