import MainVault from "@component/sections/main/vault"
import VaultAccess from "@component/sections/main/access"
import HowItWorks from "@component/sections/main/how-it-works"
import Legal from "@component/sections/main/legal"
import Settings from "@component/sections/settings"
import Vault from "@component/sections/vault"
import Accounts from "@component/sections/accounts"
import Alphabets from "@component/sections/alphabets"

interface MainContentProps {
    activePanel: string
    accountId: string
    masterPassword: string
    vaultId: string
    account: any
    onSubmitForm: (accountId: string, masterPassword: string) => void
    onPanelChange: (panel: string) => void
    onAccountUpdated: () => void
}

export default function MainContent({
    activePanel,
    accountId,
    masterPassword,
    vaultId,
    account,
    onSubmitForm,
    onPanelChange,
    onAccountUpdated
}: MainContentProps) {
    return (
        <div className="w-full h-full flex flex-col">

            {activePanel === "main-vault" && (
                accountId ? (
                    <MainVault
                        accountId={accountId}
                        onPanelChange={onPanelChange}
                    />
                ) : (
                    <VaultAccess
                        onSubmitForm={onSubmitForm}
                        onPanelChange={onPanelChange}
                    />
                )
            )}

            {activePanel === "vault" && (
                <Vault
                    accountId={accountId}
                    vaultId={vaultId}
                    masterPassword={masterPassword}
                />
            )}

            {activePanel === "legal" && <Legal />}
            {activePanel === "how-it-works" && <HowItWorks />}
            {activePanel === "alphabets" && <Alphabets />}
            {activePanel === "accounts" && <Accounts />}
            {activePanel === "settings" && (
                <Settings
                    account={account}
                    masterPassword={masterPassword}
                    onAccountUpdated={onAccountUpdated}
                />
            )}
            
        </div>
    )
}
