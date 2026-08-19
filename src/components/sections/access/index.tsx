import { useEffect, useState, useRef } from "react"

import { showAlert } from "@logic/alert"
import { getStorage, setStorage } from "@logic/storage"
import { getSetting } from "@logic/settings"
import { applyThemeColor } from "@logic/settings"
import {
    createAccount,
    getAccountIcon,
    getAccountName,
    setAccountMasterPassword,
    checkAccountMasterPassword
} from "@logic/account"

import Logo from "@component/ui/global/logo"
import OpenAnimation from "@component/sections/access/open-animation"
import Footer from "@component/global/footer"
import Version from "@component/sections/settings/version"

interface AccessProps {
    onSubmitForm: (
        accountId: string,
        masterPassword: string
    ) => void
    onSectionChange: (section: string) => void
}

const Access = (props: AccessProps) => {

    const { onSubmitForm, onSectionChange } = props

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

    const selectedAccountIcon = selectedAccount === 'new'
        ? 'user-plus'
        : getAccountIcon(selectedAccount)

    return (
        <div className="relative bg-white/2 border-white/10 w-full h-full squircle-md border overflow-hidden">

            <Version />

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
                                        <span className="flex min-w-0 items-center gap-2 text-left">
                                            <i className={`ti ti-${selectedAccountIcon} text-xl`} />
                                            <span className="truncate">
                                                { selectedAccount === 'new' ? 'Create new account' : getAccountName(selectedAccount) }
                                            </span>
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
                                                className="px-5 py-3 cursor-pointer hover:bg-white/10 border-b border-white/10 last:border-transparent"
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <i className="ti ti-user-plus text-lg" />
                                                    <span className="font-inter-medium text-lg">
                                                        Create New Account
                                                    </span>
                                                </div>
                                            </li>

                                            { accounts.map((accountId) => {

                                                const account = getStorage(accountId) || {}

                                                let label = accountId
                                                let icon = 'user'

                                                if (account.settings) {

                                                    const nameSetting = account.settings.find((setting: any) => setting.id === 'account-name')
                                                    const iconSetting = account.settings.find((setting: any) => setting.id === 'account-icon')

                                                    if (nameSetting) label = nameSetting.value
                                                    if (iconSetting) icon = iconSetting.value

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
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                            <div className="font-inter-medium text-lg">
                                                                <i className={`ti ti-${icon} text-lg mr-2`} />
                                                                <span>{label}</span>
                                                            </div>
                                                            <span className="text-[10px] -mt-2 text-white/50">
                                                                {accountId}
                                                            </span>
                                                        </div>
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

                </div>

            </div>

            <Footer onSectionChange={ onSectionChange } />

            { showAnimations && isOpeningVault && (
                <OpenAnimation vaultOpened={vaultOpened} />
            )}

        </div>
    )

}

export default Access