import { useEffect, useState, useRef } from "react"

import type { ISettings } from "@interface/settings"

import { showAlert } from "@logic/alert"
import { getStorage, setStorage } from "@logic/storage"
import { getSetting } from "@logic/settings"
import { applyThemeColor } from "@logic/settings"
import {
    createAccount,
    getAccountName,
    setAccountMasterPassword,
    checkAccountMasterPassword
} from "@logic/account"

import Logo from "@component/sections/main/logo"
import OpenVault from "@component/sections/main/open-vault"
import CraftedBy from "@component/sections/main/crafted"
import Legal from "@component/sections/main/links"

interface VaultAccessProps {
    onSubmitForm: (
        accountId: string,
        masterPassword: string
    ) => void
    onPanelChange: (panel: string) => void
}

const VaultAccess = (props: VaultAccessProps) => {

    const { onSubmitForm, onPanelChange } = props

    const dropdownRef = useRef<HTMLDivElement | null>(null)

    const [ accountName, setAccountName ] = useState("Personal Account")
    const [ accounts, setAccounts ] = useState<string[]>([])
    const [ selectedAccount, setSelectedAccount ] = useState<string | 'new'>('new')
    const [ dropdownOpen, setDropdownOpen ] = useState(false)
    const [ isOpeningVault, setIsOpeningVault ] = useState(false)
    const [ vaultOpened, setVaultOpened ] = useState(false)
    const [ showAnimations, setShowAnimations ] = useState(false)

    const handleSubmit = (event: any) => {

        event.preventDefault()

        const password = event.target.password.value

        if(password === '') return showAlert(
            'Please enter your <b>Master Password</b>',
            'error',
            'exclamation-circle',
            5000
        )

        const newAccountName = selectedAccount === 'new'
            ? accountName.trim() || 'Personal Account'
            : getAccountName(selectedAccount)

        setAccountName(newAccountName)

        const proceed = async () => {

            if (!accounts || accounts.length === 0 || selectedAccount === 'new') {

                createAccount(newAccountName)

                const accountId = getStorage('current-account')

                if (accountId) await setAccountMasterPassword({
                    accountId,
                    masterPassword: password
                })

                const showAnimations = getSetting({ accountId, settingId: "show-animations" })

                setShowAnimations(showAnimations)

                if (showAnimations) {
                    
                    setIsOpeningVault(true)

                    return setTimeout(() => {

                        setVaultOpened(true)

                        setTimeout(() => {
                            onSubmitForm(accountId, password)
                            setIsOpeningVault(false)
                        }, 500)

                    }, 500)
                }

                onSubmitForm(accountId, password)

                return

            }

            const isValidMasterPassword = await checkAccountMasterPassword({
                accountId: selectedAccount,
                masterPassword: password
            })

            if (!isValidMasterPassword) {

                setIsOpeningVault(false)

                return showAlert(
                    'Master Password is incorrect for this account',
                    'error',
                    'exclamation-circle',
                    5000
                )

            }
            
            const showAnimations = getSetting({ accountId: selectedAccount, settingId: "show-animations" })

            setShowAnimations(showAnimations)

            if(showAnimations) {

                setIsOpeningVault(true)
    
                return setTimeout(() => {
    
                    setVaultOpened(true)
    
                    setTimeout(() => {

                        onSubmitForm(selectedAccount, password)
                        setStorage("current-account", selectedAccount)
                        setIsOpeningVault(false)

                        return 

                    }, 800)
    
                }, 1000)

            }

            onSubmitForm(selectedAccount, password)
            setStorage("current-account", selectedAccount)

        }

        proceed()

    }

    useEffect(() => {

        const accounts = getStorage("accounts") || []
        setAccounts(accounts)

        const account = getStorage("current-account") || []
        if (account && account.length > 0) setSelectedAccount(account)

    }, [])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        if (selectedAccount) {
            applyThemeColor(selectedAccount)
        }
    }, [selectedAccount])

    return (
        <div className="relative bg-white/2 border-white/10 w-full h-full squircle-md border overflow-hidden">

            <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll">

                <div className="z-50 relative mx-auto flex min-h-full w-full max-w-full flex-col items-center justify-center p-5 md:max-w-300">
                    
                    <Logo />

                    <div className="text-2xl md:text-4xl text-center mb-3">
                        The world's <b className="font-inter-black">most secure</b> Password Manager
                    </div>

                    <div className="text-xl md:text-3xl text-center text-white/60 mb-15">
                        Serverless, open source and <b className="text-primary">free forever</b>.
                    </div>

                    <div className="flex flex-col gap-10 max-w-200 mb-25">
                        
                        <form
                            onSubmit={ handleSubmit }
                            className="flex flex-col gap-2"
                        >

                            { accounts && accounts.length > 0 && (

                                <div className="relative w-full" ref={dropdownRef}>

                                    <button
                                        type="button"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="text-md md:text-xl font-inter-medium h-fit w-full squircle-md px-5 py-3 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white flex items-center justify-center text-center cursor-pointer"
                                    >
                                        <span className="truncate">
                                            { selectedAccount === 'new' ? 'Create new account' : getAccountName(selectedAccount) }
                                        </span>
                                        <i className={`ti ${dropdownOpen ? 'ti-chevron-up' : 'ti-chevron-down'} ml-2`} />
                                    </button>

                                    { dropdownOpen && (
                                        <ul className="absolute left-0 right-0 mt-0.5 max-h-60 overflow-y-auto squircle-md bg-white/5 backdrop-blur-xl border border-white/30">
                                            <li
                                                key="new"
                                                onClick={() => {
                                                    setSelectedAccount('new')
                                                    setAccountName('Personal Account')
                                                    setDropdownOpen(false)
                                                }}
                                                className="px-5 py-3 cursor-pointer hover:bg-white/10 border-b border-white/10 last:border-transparent text-center"
                                            >
                                                Create New Account
                                            </li>

                                            { accounts.map((accountId) => {

                                                const account = getStorage(accountId) || {}

                                                let label = accountId

                                                if (account.settings) {

                                                    const nameSetting = account.settings.find((setting: any) => setting.id === 'account-name')
                                                    
                                                    if (nameSetting) label = nameSetting.value
                                                    
                                                }

                                                return (
                                                    <li
                                                        key={accountId}
                                                        onClick={() => {
                                                            setSelectedAccount(accountId)
                                                            setAccountName(label)
                                                            setDropdownOpen(false)
                                                        }}
                                                        className="px-5 py-3 cursor-pointer hover:bg-white/10 text-center border-b border-white/10 last:border-transparent"
                                                    >
                                                        {label}
                                                    </li>
                                                )

                                            }) }

                                        </ul>
                                    )}

                                </div>

                            )}

                            { (!accounts || accounts.length === 0 || selectedAccount === 'new') && (
                                <input
                                    placeholder="Account Name"
                                    type="text"
                                    name="account-name"
                                    value={accountName}
                                    onChange={(event) => setAccountName(event.target.value)}
                                    className="text-md md:text-xl font-inter-medium h-fit w-full squircle-md px-5 py-3 border text-center duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white"
                                />
                            )}

                            <input
                                placeholder="Enter your Master Password"
                                type="password"
                                name="password"
                                className="text-md md:text-xl font-inter-medium h-fit w-full squircle-md px-5 py-3 border text-center duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white"
                            />

                            <button
                                type="submit"
                                disabled={isOpeningVault}
                                className={`text-md md:text-xl h-fit w-full squircle-md px-5 py-4 border cursor-pointer duration-300 transition bg-primary/10 border-primary/60 hover:bg-primary/30 hover:to-primary/30 hover:border-primary hover:text-white text-white/60 text-center font-inter-black ${isOpeningVault ? 'pointer-events-none opacity-60' : ''}`}
                            >
                                {isOpeningVault ? selectedAccount === 'new' ? 'Creating...' : 'Unlocking...' : (accounts && accounts.length > 0 && selectedAccount !== 'new' ? 'Unlock Account' : 'Create Account')}
                            </button>

                        </form>
                    </div>

                    <Legal
                        onPanelChange={ onPanelChange }
                    />

                    <CraftedBy />

                </div>

            </div>

            { showAnimations && isOpeningVault && (
                <OpenVault vaultOpened={vaultOpened} />
            )}

        </div>
    )

}

export default VaultAccess