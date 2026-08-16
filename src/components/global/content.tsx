import Home from "@component/sections/home"
import Access from "@component/sections/access"
import FAQPage from "@component/sections/faq"
import LegalPage from "@component/sections/legal"
import Settings from "@component/sections/settings"
import Vault from "@component/sections/vault"
import Accounts from "@component/sections/accounts"
import Alphabets from "@component/sections/alphabets"

interface ContentProps {
    activeSection: string
    accountId: string
    masterPassword: string
    vaultId: string
    account: any
    onSubmitForm: (accountId: string, masterPassword: string) => void
    onSectionChange: (section: string) => void
    onAccountUpdated: () => void
}

const Content = ({
    activeSection,
    accountId,
    masterPassword,
    vaultId,
    account,
    onSubmitForm,
    onSectionChange,
    onAccountUpdated
}: ContentProps) => {
    return (
        <div className="w-full h-full flex flex-col">

            {activeSection === "home" && (
                accountId ? (
                    <Home
                        accountId={accountId}
                        onSectionChange={onSectionChange}
                    />
                ) : (
                    <Access
                        onSubmitForm={onSubmitForm}
                        onSectionChange={onSectionChange}
                    />
                )
            )}

            {activeSection === "vault" && (
                <Vault
                    accountId={accountId}
                    vaultId={vaultId}
                    masterPassword={masterPassword}
                />
            )}

            {activeSection === "legal" && <LegalPage />}
            {activeSection === "faq" && <FAQPage />}

            {activeSection === "alphabets" && <Alphabets accountId={accountId} />}

            {activeSection === "accounts" && (
                <Accounts onSelectAccount={onSubmitForm} />
            )}

            {activeSection === "settings" && (
                <Settings
                    account={account}
                    masterPassword={masterPassword}
                    onAccountUpdated={onAccountUpdated}
                />
            )}
            
        </div>
    )
}

export default Content