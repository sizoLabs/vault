import { useEffect, useState } from "react"

import Toggle from "@component/ui/form/toggle"
import Select from "@component/ui/form/select"
import Input from "@component/ui/form/input"
import Color from "@component/ui/form/color"
import FileInput from "@component/ui/form/file"
import ColorPalette from "@component/ui/form/colorPalette"

import { importAccountData, exportAccountData } from "@logic/account"
import { getSettings, getAccountSettings, updateSettings, applyThemeColor } from "@logic/settings"
import { getAlphabetList } from "@logic/alphabet"
import { getStorage } from "@logic/storage"
import { resetAllData } from "@logic/data"

import { type ISettings, type IAccountSettings } from "@interface/index"

interface SettingsProps {
    account?: any
    masterPassword: string
    onAccountUpdated: () => void
}

const Settings = (props: SettingsProps) => {

    const { account, masterPassword, onAccountUpdated } = props

    const [ accountId, setAccountId ] = useState<string>("")
    const [ settings, setSettings ] = useState<ISettings[]>([])
    const [ accountSettings, setAccountSettings ] = useState<IAccountSettings[]>([])

    const onSettingChange = ({ settingId, value }: { settingId: string, value: string | number | boolean }) => {
        updateSettings({ accountId, settingId, value })
        setAccountSettings(
            (current) => current.map(
                (setting) => setting.id === settingId ? { ...setting, value } : setting
            )
        )

        if (settingId === "theme-color") {
            applyThemeColor(accountId)
        }
    }

    const handleResetSubmit = () => {
        const confirmation = confirm("Are you sure you want to reset all data for this account? This action cannot be undone.")
        if(confirmation) {
            resetAllData(accountId)
            onAccountUpdated()
        }
    }

    const handleExportSubmit = () => {
        exportAccountData({
            accountId,
            masterPassword
        })
    }

    const handleImportSubmit = (event: any) => {
        importAccountData({
            accountId,
            masterPassword,
            event,
            onImportComplete: onAccountUpdated
        })
    }

    useEffect(() => {

        const currentAccountId = getStorage("current-account")
        const currentAccountSettings = getAccountSettings(currentAccountId)

        if (currentAccountId) {
            setAccountId(currentAccountId)
            setAccountSettings(currentAccountSettings)
            setSettings(getSettings())
            applyThemeColor(currentAccountId)
        }

    }, [account])

    if(settings && settings.length > 0) return (
        <div className="relative bg-white/2 border-white/10 w-full h-full squircle squircle-md border overflow-hidden">

            <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll min-h-full">

                <div className="relative mx-auto flex max-w-200 flex-col px-5 py-5 md:p-10 pb-0 md:pb-0">

                    <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                        Settings
                    </h2>

                    <div className="flex flex-col w-full form">
                        
                        <div className="block">
                            <div>
                                <h3>
                                    Account Name
                                </h3>
                                <div className="description">
                                    Enter a name for your account.
                                </div>
                            </div>
                            <div className="option">
                                <Input
                                    id={ settings[0].id }
                                    defaultValue={ accountSettings[0].value as string }
                                    type={ settings[0].type }
                                    onChange={ onSettingChange }
                                />
                            </div>
                        </div>

                        <div className="block">
                            <div>
                                <h3>
                                    Default Password Length
                                </h3>
                                <div className="description">
                                    Select the length that the passwords will have when they are created.
                                </div>
                            </div>
                            <div className="option max-w-20">
                                <Input
                                    id={ settings[1].id }
                                    defaultValue={ accountSettings[1].value as string }
                                    type={ settings[1].type }
                                    onChange={ onSettingChange }
                                />
                            </div>
                        </div>

                        <div className="block">
                            <div>
                                <h3>
                                    Default Alphabet
                                </h3>
                                <div className="description">
                                    Default alphabet for creating your passwords.
                                </div>
                            </div>
                            <div className="option max-w-60 min-w-50">
                                <Select
                                    id={ settings[2].id }
                                    options={ getAlphabetList(accountId) }
                                    selected={ accountSettings[2].value as string }
                                    onSelect={ onSettingChange }
                                />
                            </div>
                        </div>

                        <div className="block">
                            <div>
                                <h3>
                                    Show Passwords
                                </h3>
                                <div className="description">
                                    Displays passwords when opening settings.
                                </div>
                            </div>
                            <div className="option group">
                                <Toggle
                                    id={ settings[3].id }
                                    isChecked={ accountSettings[3].value as boolean }
                                    onToggle={ onSettingChange }
                                />
                            </div>
                        </div>

                        <div className="block">
                            <div>
                                <h3>
                                    Show Page Animations
                                </h3>
                                <div className="description">
                                    Displays web animations.
                                </div>
                            </div>
                            <div className="option group">
                                <Toggle
                                    id={ settings[4].id }
                                    isChecked={ accountSettings[4].value as boolean }
                                    onToggle={ onSettingChange }
                                />
                            </div>
                        </div>

                        <div className="block">
                            <div>
                                <h3>
                                    Theme Color
                                </h3>
                                <div className="description">
                                    Choose your accent color for the app.
                                </div>
                            </div>
                            <div className="option">
                                <ColorPalette
                                    id={ settings[5].id }
                                    value={ typeof accountSettings[5]?.value === "string" ? accountSettings[5].value : "#a58fff" }
                                    onChange={ onSettingChange }
                                />
                                <Color
                                    id={ settings[5].id }
                                    value={ typeof accountSettings[5]?.value === "string" ? accountSettings[5].value : "#a58fff" }
                                    onChange={ onSettingChange }
                                />
                            </div>
                        </div>

                    </div>
                    
                </div>

                <div className="relative mx-auto flex max-w-200 flex-col px-5 py-5 md:p-10 pb-0 md:pb-0">

                    <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                        Export / Import Data
                    </h2>

                    <div className="flex flex-col w-full form">
                        
                        <div className="block">
                            <div>
                                <h3>
                                    Export Account Data
                                </h3>
                                <div className="description">
                                    Export the data from this account.
                                </div>
                            </div>
                            <div className="option">
                                <button
                                    onClick={ handleExportSubmit }
                                    className="file-input-button"
                                >
                                    Export Account Data
                                </button>
                            </div>
                        </div>

                        <div className="block">
                            <div>
                                <h3>
                                    Import Account Data
                                </h3>
                                <div className="description">
                                    Import data to this account.
                                </div>
                            </div>
                            <div className="option">
                                <FileInput
                                    id="import-account-data"
                                    onChange={ handleImportSubmit }
                                    accept=".ovni,.vault"
                                />
                            </div>
                        </div>

                    </div>
                </div>

                <div className="relative mx-auto flex max-w-200 flex-col px-5 py-5 md:p-10 pb-10">

                    <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                        Reset Account Data
                    </h2>

                    <div className="flex flex-col w-full form">
                        
                        <div className="block">
                            <div>
                                <h3>
                                    Reset Account Data
                                </h3>
                                <div className="description">
                                    This will delete all the data in this account. This action cannot be undone.
                                </div>
                            </div>
                            <div className="option">
                                <button
                                    onClick={ handleResetSubmit }
                                    className="button bg-rose-500/10! text-rose-500! border-rose-500! hover:bg-rose-500! hover:text-white! font-inter-bold!"
                                >
                                    Reset All Data
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    )

}

export default Settings