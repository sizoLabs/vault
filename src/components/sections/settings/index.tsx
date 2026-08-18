import { useEffect, useState } from "react"

import { buildMasterSeedBlocks } from "@logic/utils"

import FileInput from "@component/ui/form/file"

import Setting from "@component/sections/settings/setting"
import Input from "@component/ui/form/input"

import {
    importAccountData,
    exportAccountData,
    checkAccountMasterPassword,
    setAccountMasterPassword
} from "@logic/account"
import { getSettings, getAccountSettings, updateSettings, applyThemeColor } from "@logic/settings"
import { applyGradientBackgroundSetting, applyColoredBackgroundSetting } from "@logic/background"
import { getStorage } from "@logic/storage"
import { removeMasterVerifier } from "@logic/master"
import { resetAllData } from "@logic/data"
import { showAlert } from "@logic/alert"
import { syncServicesWithChromeExtension, deleteChromeExtensionAccount, clearChromeExtensionData } from "@logic/service"
import {
    connectGoogleDrive,
    disconnectGoogleDrive,
    formatGoogleDriveUserLabel,
    getGoogleDriveState,
    isGoogleDriveConfigured,
    pullGoogleDriveToAccount,
    pushLocalAccountToGoogleDrive,
    setGoogleDriveState
} from "@logic/google"

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
    const [ resetMasterPassword, setResetMasterPassword ] = useState<string>("")
    const [ masterSeedBlocks, setMasterSeedBlocks ] = useState<Array<{ id: number, seed: string, color: { r: number, g: number, b: number }, token: string }>>([])
    const [ driveState, setDriveState ] = useState<{ enabled: boolean, connected: boolean, accessToken: string, email: string }>({
        enabled: false,
        connected: false,
        accessToken: "",
        email: ""
    })

    const syncDriveState = (currentAccountId = accountId) => {
        setDriveState(getGoogleDriveState(currentAccountId))
    }

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

        if (settingId === "google-drive-enabled") {
            syncDriveState(accountId)
        }

        if (settingId === "store-master-verifier") {
            if (value === false) {
                removeMasterVerifier(accountId)
            } else if (masterPassword) {
                setAccountMasterPassword({ accountId, masterPassword })
            }
        }

    }

    const handleResetSubmit = async () => {

        if (!resetMasterPassword) {
            return showAlert("Please enter your Master Password to reset all data", 'error', 'exclamation-circle', 5000)
        }

        const isValidPassword = await checkAccountMasterPassword({
            accountId,
            masterPassword: resetMasterPassword
        })

        if (!isValidPassword) {
            return showAlert("Master Password is incorrect", 'error', 'exclamation-circle', 5000)
        }

        const confirmation = confirm("Are you sure you want to reset all data for this account? This action cannot be undone.")
        if (confirmation) {
            await resetAllData(accountId)
            setResetMasterPassword("")
            onAccountUpdated()
            showAlert("All data has been reset successfully", 'success', 'check', 5000)
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

    const handleSyncChromeExtension = () => {
        syncServicesWithChromeExtension({ accountId })
    }

    const handleDeleteCurrentAccountFromExtension = async () => {
        if (!accountId) {
            showAlert("No active account selected", "error", "alert-circle", 3000)
            return
        }

        const confirmed = confirm("Delete the synced data for this account from the Vault extension?")
        if (!confirmed) return

        const deleted = await deleteChromeExtensionAccount({ accountId })
        if (!deleted) {
            showAlert("Failed to delete the extension data for this account", "error", "x", 3000)
            return
        }

        showAlert("Synced account data was removed from the extension", "success", "check", 3000)
    }

    const handleDeleteAllExtensionData = async () => {
        const confirmed = confirm("Delete all synced data stored by the Vault extension?")
        if (!confirmed) return

        const cleared = await clearChromeExtensionData()
        if (!cleared) {
            showAlert("Failed to clear all extension data", "error", "x", 3000)
            return
        }

        showAlert("All extension data was cleared", "success", "check", 3000)
    }

    const handleConnectGoogleDrive = async () => {
        const connectedState = await connectGoogleDrive({ accountId })
        if (connectedState) {
            setDriveState(getGoogleDriveState(accountId))
            updateSettings({ accountId, settingId: "google-drive-enabled", value: true })
            setAccountSettings((current) => current.map((setting) => setting.id === "google-drive-enabled" ? { ...setting, value: true } : setting))
            onAccountUpdated()
        }
    }

    const handlePullGoogleDrive = async () => {
        const synced = await pullGoogleDriveToAccount({ accountId, masterPassword })
        if (synced) {
            onAccountUpdated()
        }
    }

    const handlePushGoogleDrive = async () => {
        await pushLocalAccountToGoogleDrive({ accountId, masterPassword })
    }

    const handleDisconnectGoogleDrive = () => {
        disconnectGoogleDrive(accountId)
        setDriveState(getGoogleDriveState(accountId))
        updateSettings({ accountId, settingId: "google-drive-enabled", value: false })
        setAccountSettings((current) => current.map((setting) => setting.id === "google-drive-enabled" ? { ...setting, value: false } : setting))
    }

    const isDriveSyncEnabled = Boolean(accountSettings.find((setting) => setting.id === "google-drive-enabled")?.value) || driveState.enabled
    const driveFileIdentifier = String(accountSettings.find((setting) => setting.id === "google-drive-file-id")?.value || "").trim()
    const canUseDriveSyncActions = driveState.connected && Boolean(driveFileIdentifier)
    const isMasterVerifierDisabled = accountSettings.some((setting) => setting.id === "store-master-verifier" && setting.value === false)

    useEffect(() => {
        let isMounted = true

        if (!isMasterVerifierDisabled || !masterPassword) {
            setMasterSeedBlocks([])
            return () => {
                isMounted = false
            }
        }

        const loadSeedBlocks = async () => {
            const blocks = await buildMasterSeedBlocks(masterPassword)
            if (isMounted) setMasterSeedBlocks(blocks)
        }

        loadSeedBlocks()

        return () => {
            isMounted = false
        }
    }, [isMasterVerifierDisabled, masterPassword])

    useEffect(() => {

        const currentAccountId = getStorage("current-account")
        const currentAccountSettings = getAccountSettings(currentAccountId)

        if (currentAccountId) {
            setAccountId(currentAccountId)
            setAccountSettings(currentAccountSettings)
            setSettings(getSettings())
            setDriveState(getGoogleDriveState(currentAccountId))
            applyThemeColor(currentAccountId)
        }

    }, [account])

    if(settings && settings.length > 0) return (
        <div className="relative bg-white/2 border-white/10 w-full h-full squircle-md border overflow-hidden">

            <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll min-h-full">

                <div className="absolute -top-90 -left-85 opacity-3 -z-1 mask-to-bottom">
                    <i className="ti ti-settings text-[900px]" />
                </div>

                <div className="relative mx-auto flex max-w-200 flex-col px-5 py-5 md:p-10 pb-0 md:pb-0">

                    <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                        <i className="ti ti-settings mr-2 align-middle inline-block -mt-1.25" /> Settings
                    </h2>

                    <div className="flex flex-col w-full form squircle-md">
                        { settings.map((setting) => {

                            if (setting.id === "google-drive-file-id") {
                                return null
                            }

                            return (
                                <Setting
                                    key={ setting.id }
                                    setting={ setting }
                                    accountId={ accountId }
                                    value={ accountSettings.find((accountSetting: { id: string }) => accountSetting.id === setting.id)?.value }
                                    onChange={ onSettingChange }
                                />
                            )

                        }) }
                    </div>
                    
                </div>

                { isDriveSyncEnabled ? (
                    <div className="relative mx-auto flex max-w-200 flex-col px-5 py-5 md:p-10 pb-0 md:pb-0">

                        <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                            <i className="ti ti-brand-google-drive mr-2 align-middle inline-block -mt-1.25" /> Google Drive Sync
                        </h2>

                        <div className="flex flex-col w-full form squircle-md">
                            <div className="container">
                                <div>
                                    <h3>
                                        Google Drive Connection
                                    </h3>
                                    <div className="description">
                                        { driveState.connected && (
                                            <>
                                                Connected as
                                                <b className="ml-1">
                                                    @{ formatGoogleDriveUserLabel(driveState.email) }
                                                </b>
                                            </>
                                        )}
                                        { !driveState.connected && (
                                            <>
                                               { isGoogleDriveConfigured() ? "Connect this account to Google Drive appdata." : "Add PUBLIC_GOOGLE_CLIENT_ID in your .env file to enable sync." }
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="option flex flex-col md:flex-row gap-2">
                                    {!driveState.connected ? (
                                        <button
                                            onClick={ handleConnectGoogleDrive }
                                            disabled={ !isGoogleDriveConfigured() }
                                            className="file-input-button disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <i className="ti ti-brand-google-drive text-xl mr-1 align-middle inline-block -mt-1" /> Connect to Google Drive
                                        </button>
                                    ) : (
                                        <button
                                            onClick={ handleDisconnectGoogleDrive }
                                            className="file-input-button bg-rose-500/10 border-rose-500/50 hover:bg-rose-500/20 hover:border-rose-500"
                                        >
                                            <i className="ti ti-power text-xl mr-1 align-middle inline-block -mt-1" /> Disconnect
                                        </button>
                                    )}
                                </div>
                            </div>

                            { driveState.connected ? (
                                <>
                                
                                    { settings.map((setting) => {
                                        if (setting.id === "google-drive-file-id") return (
                                            <Setting
                                                key={ setting.id }
                                                setting={ setting }
                                                accountId={ accountId }
                                                value={ accountSettings.find((accountSetting: { id: string }) => accountSetting.id === setting.id)?.value }
                                                onChange={ onSettingChange }
                                            />
                                        )
                                    }) }

                                    <div className="container">
                                        <div>
                                            <h3>
                                                Sync from Google Drive
                                            </h3>
                                            <div className="description">
                                                Download the .vault file from Drive and apply it to this account.
                                            </div>
                                        </div>
                                        <div className="option">
                                            <button
                                                onClick={ handlePullGoogleDrive }
                                                disabled={ !canUseDriveSyncActions }
                                                className="file-input-button disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <i className="ti ti-download text-xl mr-1 align-middle inline-block -mt-1" /> Synchronize from Drive
                                            </button>
                                        </div>
                                    </div>

                                    <div className="container">
                                        <div>
                                            <h3>
                                                Upload local data to Drive
                                            </h3>
                                            <div className="description">
                                                Replace the Google Drive copy with the current local account data.
                                            </div>
                                        </div>
                                        <div className="option">
                                            <button
                                                onClick={ handlePushGoogleDrive }
                                                disabled={ !canUseDriveSyncActions }
                                                className="file-input-button disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <i className="ti ti-upload text-xl mr-1 align-middle inline-block -mt-1" /> Replace Drive Data
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : null }
                        </div>
                    </div>
                ) : null }

                <div className="relative mx-auto flex max-w-200 flex-col px-5 py-5 md:p-10 pb-0 md:pb-0">

                    <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                        <i className="ti ti-brand-chrome mr-2 align-middle inline-block -mt-1.25" /> Chrome Extension Sync
                    </h2>

                    <div className="flex md:hidden flex-col w-full form squircle-md">
                        <div className="container gap-1">
                            <div>
                                <h3>
                                    Synchronize with Vault extension
                                </h3>
                                <div className="description">
                                    Send the current account data to the Vault extension so it can match passwords on websites.
                                </div>
                            </div>
                            <div className="text-amber-500 bg-amber-500/5 border border-amber-500/50 p-3 squircle-md">
                                    This feature is only available on desktop browser.
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col w-full form squircle-md">
                        <div className="container gap-5">
                            <div>
                                <h3>
                                    Synchronize with Vault extension
                                </h3>
                                <div className="description">
                                    Send the current account data to the Vault extension so it can match passwords on websites.
                                </div>
                            </div>
                            <div className="option min-w-65">
                                <button
                                    onClick={ handleSyncChromeExtension }
                                    className="file-input-button"
                                >
                                    <i className="ti ti-brand-chrome text-xl mr-1 align-middle inline-block -mt-1" /> Sync with extension
                                </button>
                            </div>
                        </div>

                        <div className="relative container overflow-hidden md:py-7! md:px-10!">
                            <div className="absolute z-0 -left-30 -top-70 opacity-3">
                                <i className="ti ti-brand-chrome text-[800px]" />
                            </div>
                            <div className="relative z-10 w-full">
                                <h2 className="text-xl md:text-2xl font-inter-black mb-2">
                                    Download VAULT Chrome Extension
                                </h2>
                                <a
                                    href="https://github.com/sizoLabs/vault-chrome-extension"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-fit px-6 py-3 border duration-300 bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/30 hover:border-emerald-500 hover:text-white squircle-md backdrop-blur-3xl font-inter-bold"
                                >
                                    <i className="ti ti-download text-xl mr-1 align-middle inline-block -mt-1" /> Download Extension from GitHub
                                </a>
                            </div>
                        </div>

                        <div className="container gap-5">
                            <div>
                                <h3>
                                    Delete current account data from extension
                                </h3>
                                <div className="description">
                                    Remove the synced data for the active account from the Vault extension.
                                </div>
                            </div>
                            <div className="option min-w-65">
                                <button
                                    onClick={ handleDeleteCurrentAccountFromExtension }
                                    className="font-inter-bold h-fit w-full px-6 py-3 border duration-300 bg-rose-500/10 border-rose-500/50 hover:bg-rose-500/20 hover:border-rose-500 hover:text-white focus:bg-rose-500/20 focus:border-rose-500 squircle-md cursor-pointer"
                                >
                                    <i className="ti ti-trash text-xl mr-1 align-middle inline-block -mt-1" /> Delete account data
                                </button>
                            </div>
                        </div>

                        <div className="container gap-5">
                            <div>
                                <h3>
                                    Delete all extension data
                                </h3>
                                <div className="description">
                                    Delete every synced account from the Vault extension.
                                </div>
                            </div>
                            <div className="option min-w-65">
                                <button
                                    onClick={ handleDeleteAllExtensionData }
                                    className="font-inter-bold h-fit w-full px-6 py-3 border duration-300 bg-rose-500/10 border-rose-500/50 hover:bg-rose-500/20 hover:border-rose-500 hover:text-white focus:bg-rose-500/20 focus:border-rose-500 squircle-md cursor-pointer"
                                >
                                    <i className="ti ti-trash text-xl mr-1 align-middle inline-block -mt-1" /> Delete all extension data
                                </button>
                            </div>
                        </div>
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

                { isMasterVerifierDisabled ? (
                    <div className="relative mx-auto flex max-w-200 flex-col px-5 py-5 md:p-10 pb-0 md:pb-0">
                        <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                            <i className="ti ti-square-f0 mr-2 align-middle inline-block -mt-1.25" /> Master Password Tokens
                        </h2>

                        <div className="flex flex-col w-full form squircle-md">
                            <div className="container flex-col! gap-5">

                                <div>
                                    <h3>
                                        Tokens for Master Password Verification
                                    </h3>
                                    <div className="description">
                                        This allows you to know if the master password is correct. Memorize these tokens, so when you access again you will know if the master password is correct.
                                    </div>
                                </div>

                                <div className="w-full">

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                                        { masterSeedBlocks.length > 0 ? masterSeedBlocks.map((block) => (
                                            <div
                                                style={{ background: `rgba(${block.color.r}, ${block.color.g}, ${block.color.b}, 0.1)`, borderColor: `rgba(${block.color.r}, ${block.color.g}, ${block.color.b}, 0.8)` }}
                                                key={ block.id }
                                                className="squircle-md border border-white/10 bg-black/10 p-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-inter-bold text-white">
                                                        Token { block.id }
                                                    </span>
                                                </div>
                                                <div className="mt-3 flex flex-row items-center justify-around gap-1">
                                                    <span className="block w-full text-4xl font-inter-black text-left">
                                                        { block.token }
                                                    </span>
                                                    <span className="block min-h-10 w-full h-full squircle-full" style={{ backgroundColor: `rgba(${block.color.r}, ${block.color.g}, ${block.color.b}, 1)` }}></span>
                                                </div>
                                            </div>
                                            
                                        )) : (
                                            <div className="md:col-span-4 text-rose-500 bg-rose-500/5 border border-rose-500/50 px-3 py-3 squircle-md">
                                                Seed preview is unavailable until a master password is available in the current session.
                                            </div>
                                        ) }
                                        <div className="md:col-span-4 text-amber-500 bg-amber-500/5 border border-amber-500/50 p-3 squircle-md mt-3">
                                                This shows because the "Store Master Password Verification" setting is disabled.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null }

                <div className="relative mx-auto flex max-w-200 flex-col px-5 py-5 md:p-10 pb-10">

                    <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                        <i className="ti ti-trash mr-2 align-middle inline-block -mt-1.25" /> Reset Account Data
                    </h2>

                    <div className="flex flex-col w-full form squircle-md">
                        
                        <div className="container flex flex-col! gap-5">
                            <div>
                                <h3>
                                    Reset Account Data
                                </h3>
                                <div className="description">
                                    This will delete all the data in this account.
                                    <span className="ml-1 text-rose-500 font-inter-bold">
                                        Backup your data, this action cannot be undone.
                                    </span>
                                </div>
                            </div>
                            <div className="w-full md:max-w-70">
                                <Input
                                    id="reset-master-password"
                                    type="password"
                                    placeholder="Master Password"
                                    value={ resetMasterPassword }
                                    onChange={ (event: React.ChangeEvent<HTMLInputElement>) => setResetMasterPassword(event.target.value) }
                                    className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md mb-3"
                                />
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