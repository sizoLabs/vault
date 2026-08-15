import { useEffect, useState } from "react"

import { createAlphabet } from "@logic/alphabet"
import { showAlert } from "@logic/alert"

import Input from "@component/ui/form/input"
import IconSelector from "@component/ui/form/icon"
import Dialog from "@component/ui/dialog/dialog"
import DialogOption from "@component/ui/dialog/option"
import DialogFooter from "@component/ui/dialog/footer"

type CreateAlphabetModalProps = {
    open: boolean
    accountId: string
    onCreate: () => void
    onClose: () => void
}

const CreateAlphabetModal = (props: CreateAlphabetModalProps) => {

    const { open, accountId, onCreate, onClose } = props

    const getEmptyForm = () => ({
        name: '',
        identifier: '',
        characters: '',
        description: '',
        icon: 'abc'
    })

    const [ form, setForm ] = useState(getEmptyForm())

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
            showAlert("Please enter a name", "error", "alert-circle", 3000)
            return
        }

        if (!form.identifier.trim()) {
            showAlert("Please enter an identifier", "error", "alert-circle", 3000)
            return
        }

        if (!form.characters.trim()) {
            showAlert("Please enter characters", "error", "alert-circle", 3000)
            return
        }

        try {
            createAlphabet({
                accountId,
                name: form.name,
                identifier: form.identifier,
                characters: form.characters,
                description: form.description,
                icon: form.icon
            })

            showAlert("Alphabet created successfully", "success", "check", 5000)
            handleClose()
            onCreate()
        } catch (error) {
            showAlert("Failed to create alphabet", "error", "alert-circle", 3000)
            console.error(error)
        }
    }

    return (
        <Dialog
            open={open}
            title="Create New Alphabet"
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

export default CreateAlphabetModal
