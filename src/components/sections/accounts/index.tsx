import { useEffect, useState } from "react"

import { getAccounts, getAccountName, getAccountIcon, deleteAccount, checkAccountMasterPassword } from "@logic/account"
import { getStorage, setStorage } from "@logic/storage"
import { updateSettings, getAccountSettings } from "@logic/settings"
import { showAlert } from "@logic/alert"

import AccountCard from "@component/ui/accounts/account"
import Dialog from "@component/ui/dialog/dialog"
import DialogOption from "@component/ui/dialog/option"
import DialogFooter from "@component/ui/dialog/footer"
import Input from "@component/ui/form/input"

import CreateAccountModal from "@component/sections/accounts/create"
import EditAccountModal from "@component/sections/accounts/edit"

interface AccountsProps {
    onSelectAccount?: (accountId: string, masterPassword: string) => void
}

const Accounts = ({ onSelectAccount }: AccountsProps) => {

    const [ accountsList, setAccountsList ] = useState<string[]>([])
    const [ selectedAccount, setSelectedAccount ] = useState<string>("")
    const [ currentAccountId, setCurrentAccountId ] = useState<string>("")
    const [ pendingAccountId, setPendingAccountId ] = useState<string>("")
    const [ pendingMasterPassword, setPendingMasterPassword ] = useState("")
    const [ isCreateModalOpen, setIsCreateModalOpen ] = useState(false)
    const [ isEditModalOpen, setIsEditModalOpen ] = useState(false)
    const [ isPasswordDialogOpen, setIsPasswordDialogOpen ] = useState(false)

    const syncAccounts = () => {
        const accounts = getAccounts()
        setAccountsList(accounts)
        setCurrentAccountId(getStorage("current-account") || "")
    }

    useEffect(() => {
        syncAccounts()
    }, [])

    const handleCreateAccount = () => {
        setIsCreateModalOpen(true)
    }

    const handleEditAccount = (accountId: string) => {
        const currentAccount = getStorage("current-account") || ""

        if (currentAccount !== accountId) {
            showAlert("Only the active account can be edited.", "error", "alert-circle", 3000)
            return
        }

        setSelectedAccount(accountId)
        setIsEditModalOpen(true)
    }

    const handleSelectAccount = (accountId: string) => {
        setPendingAccountId(accountId)
        setPendingMasterPassword("")
        setIsPasswordDialogOpen(true)
    }

    const handleConfirmSelectAccount = async () => {
        const accountId = pendingAccountId
        const masterPassword = pendingMasterPassword.trim()

        if (!accountId) return

        if (!masterPassword) {
            showAlert("Please enter your <b>Master Password</b>", "error", "alert-circle", 5000)
            return
        }

        const isValidMasterPassword = await checkAccountMasterPassword({
            accountId,
            masterPassword
        })

        if (!isValidMasterPassword) {
            showAlert("Master Password is incorrect for this account", "error", "alert-circle", 5000)
            return
        }

        setStorage("current-account", accountId)
        setCurrentAccountId(accountId)
        setIsPasswordDialogOpen(false)
        setPendingMasterPassword("")
        setPendingAccountId("")

        if (onSelectAccount) {
            onSelectAccount(accountId, masterPassword)
        }
    }

    const handleRefreshAccounts = () => {
        syncAccounts()
    }

    return (
        <>
            <div className="relative bg-white/2 border-white/10 w-full h-full squircle-md border overflow-hidden">

                <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll">

                    <div className="z-50 relative flex min-h-full flex-col px-5 py-5 md:p-10 overflow-hidden">

                        <div className="absolute -top-60 -left-35 opacity-5 -z-1 mask-to-bottom">
                            <i className="ti ti-user-circle text-[900px]" />
                        </div>

                        <div className="text-3xl font-inter-black mb-5 flex flex-col md:flex-row">

                            <h2>
                                <i className="ti ti-user-circle mr-2 align-middle inline-block -mt-1.25" /> Accounts
                            </h2>

                            <div className="mt-3 md:mt-0 md:ml-5 flex flex-row justify-between gap-2">
                                <button
                                    onClick={ () => handleCreateAccount() }
                                    className="text-[20px] pl-2 pr-2.5 pt-1.5 pb-1 bg-white/5 squircle-md border border-white/10 align-middle inline-block -mt-1.25 cursor-pointer hover:border-white/30 hover:bg-white/10 duration-300 md:hidden"
                                >
                                    <i className="ti ti-plus" />
                                </button>
                            </div>

                        </div>

                        <div className="flex flex-row flex-wrap w-full gap-3">

                            {accountsList.map((accountId: string, index: number) => {
                                const isCurrentAccount = currentAccountId === accountId

                                return (
                                    <AccountCard
                                        key={ accountId ?? index }
                                        accountId={ accountId }
                                        accountName={ getAccountName(accountId) }
                                        accountIcon={ getAccountIcon(accountId) }
                                        isCurrent={ isCurrentAccount }
                                        canEdit={ isCurrentAccount }
                                        isSelectable={ !isCurrentAccount }
                                        onClick={ () => handleSelectAccount(accountId) }
                                        onSettingsClick={ isCurrentAccount ? () => { handleEditAccount(accountId) } : undefined }
                                    />
                                )
                            })}

                            <div className="hidden md:block w-full sm:w-fit">
                                <button
                                    className="flex flex-col items-center justify-center px-10 py-5 sm:min-w-50 w-full h-full squircle-md border border-white/10 hover:border-white/50 hover:bg-white/10 duration-300 backdrop-blur-2xl cursor-pointer text-white/50 hover:text-white"
                                    onClick={ () => handleCreateAccount() }
                                >
                                    <i className="ti ti-plus text-8xl mb-2" />
                                    <span className="text-sm">New Account</span>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            <CreateAccountModal
                open={ isCreateModalOpen }
                onCreate={ (accountId: string, masterPassword: string) => {
                    handleRefreshAccounts()
                    if (onSelectAccount) {
                        onSelectAccount(accountId, masterPassword)
                    }
                }}
                onClose={ () => setIsCreateModalOpen(false) }
            />

            <EditAccountModal
                open={ isEditModalOpen }
                accountId={ selectedAccount }
                onUpdate={ handleRefreshAccounts }
                onClose={ () => setIsEditModalOpen(false) }
            />

            <Dialog
                open={ isPasswordDialogOpen }
                title="Unlock Account"
                onClose={ () => {
                    setIsPasswordDialogOpen(false)
                    setPendingMasterPassword("")
                    setPendingAccountId("")
                }}
                contentClassName="flex flex-col gap-4 p-5"
                footer={
                    <DialogFooter
                        buttons={[
                            {
                                label: "Cancel",
                                variant: "cancel",
                                onClick: () => {
                                    setIsPasswordDialogOpen(false)
                                    setPendingMasterPassword("")
                                    setPendingAccountId("")
                                }
                            },
                            {
                                label: "Unlock",
                                variant: "success",
                                position: "end",
                                onClick: handleConfirmSelectAccount
                            }
                        ]}
                    />
                }
            >
                <DialogOption
                    title="Master Password"
                    description={`Enter the password for ${getAccountName(pendingAccountId) || "this account"} to switch to it.`}
                    layout="col"
                    className="max-w-100"
                >
                    <Input
                        id="account-master-password"
                        name="account-master-password"
                        type="password"
                        value={ pendingMasterPassword }
                        placeholder="Enter your Master Password"
                        onChange={(event: any) => setPendingMasterPassword(event.target.value)}
                        className="font-inter-medium h-fit w-full px-3 py-2 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white squircle-md"
                    />
                </DialogOption>
            </Dialog>

        </>
    )

}

export default Accounts