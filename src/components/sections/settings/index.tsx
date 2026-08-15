import { useEffect, useState } from "react"

import FileInput from "@component/ui/form/file"

import Setting from "@component/sections/settings/setting"
import Input from "@component/ui/form/input"

import { importAccountData, exportAccountData } from "@logic/account"
import { getSettings, getAccountSettings, updateSettings, applyThemeColor } from "@logic/settings"
import { applyGradientBackgroundSetting, applyColoredBackgroundSetting } from "@logic/background"
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

        if (settingId === "disable-gradient-background") {
            const themeColor = accountSettings.find(s => s.id === "theme-color")?.value as string | undefined
            applyGradientBackgroundSetting(value as boolean, themeColor)
        }

        if (settingId === "disable-colored-background") {
            applyColoredBackgroundSetting(value as boolean)
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
        <div className="relative bg-white/2 border-white/10 w-full h-full squircle-md border overflow-hidden">

            <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll min-h-full">

                <div className="relative mx-auto flex max-w-200 flex-col px-5 py-5 md:p-10 pb-0 md:pb-0">

                    <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                        <i className="ti ti-settings mr-2 align-middle inline-block -mt-1.25" /> Settings
                    </h2>

                    <div className="flex flex-col w-full form squircle-md">
                        { settings.map((setting) => (
                            <Setting
                                key={ setting.id }
                                setting={ setting }
                                accountId={ accountId }
                                value={ accountSettings.find((accountSetting) => accountSetting.id === setting.id)?.value }
                                onChange={ onSettingChange }
                            />
                        )) }
                    </div>
                    
                </div>

                <div className="relative mx-auto flex max-w-200 flex-col px-5 py-5 md:p-10 pb-0 md:pb-0">

                    <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                        <i className="ti ti-database-export mr-2 align-middle inline-block -mt-1.25" /> Export / Import Data
                    </h2>

                    <div className="flex flex-col w-full form squircle-md">
                        
                        <div className="container">
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
                                    <i className="ti ti-database-export text-xl mr-1 align-middle inline-block -mt-1" /> Export Account Data
                                </button>
                            </div>
                        </div>

                        <div className="container">
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

                <div className="relative mx-auto flex max-w-200 flex-col px-5 py-5 md:p-10 pb-0 md:pb-0">

                    <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                        <i className="ti ti-key mr-2 align-middle inline-block -mt-1.25" /> Change Master Password
                    </h2>

                    <div className="flex flex-col w-full form squircle-md">
                        
                        <div className="flex flex-col w-full p-5">
                            <div className="mb-5">
                                <h3 className="text-sm md:text-lg font-inter-bold">
                                    Change Master Password
                                </h3>
                                <div className="text-sm font-inter-medium text-white/70 mb-2 md:mb-0">
                                    This will change the master password for this account.
                                    <span className="text-rose-500 ml-1">
                                        This will change all passwords in this account to be encrypted with the new master password. Backup your data, this action cannot be undone.
                                    </span>
                                </div>
                            </div>
                            <div className="w-full md:max-w-70">
                                <Input
                                    id="change-master-password"
                                    type="password"
                                    placeholder="New Master Password"
                                    onChange={() => {}}
                                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md mb-3"
                                />
                                <button
                                    className="font-inter-bold h-fit w-full px-3 py-3 border duration-300 bg-rose-500/10 border-rose-500/50 hover:bg-rose-500/20 hover:border-rose-500 hover:text-white focus:bg-rose-500/20 focus:border-rose-500 squircle-md cursor-pointer"
                                >
                                    Change Master Password
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="relative mx-auto flex max-w-200 flex-col px-5 py-5 md:p-10 pb-10">

                    <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                        <i className="ti ti-trash mr-2 align-middle inline-block -mt-1.25" /> Reset Account Data
                    </h2>

                    <div className="flex flex-col w-full form squircle-md">
                        
                        <div className="container">
                            <div>
                                <h3>
                                    Reset Account Data
                                </h3>
                                <div className="description">
                                    This will delete all the data in this account.
                                    <span className="block text-rose-500">
                                        Backup your data, this action cannot be undone.
                                    </span>
                                </div>
                            </div>
                            <div className="option">
                                <button
                                    onClick={ handleResetSubmit }
                                    className="font-inter-bold h-fit w-full px-6 py-3 border duration-300 bg-rose-500/10 border-rose-500/50 hover:bg-rose-500/20 hover:border-rose-500 hover:text-white focus:bg-rose-500/20 focus:border-rose-500 squircle-md cursor-pointer"
                                >
                                    <i className="ti ti-trash text-xl mr-1 align-middle inline-block -mt-1" /> Reset All Data
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