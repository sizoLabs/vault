import { useState } from "react"

const faqItems = [
    {
        id: "how-it-works",
        question: "How does Vault generate my passwords?",
        answer: [
            "Vault uses a deterministic cryptographic hash system with SHA-512 technology. Here's what happens: you provide your master password, a service identifier, and a character set. These inputs are combined and hashed using SHA-512, which creates a unique cryptographic fingerprint.",
            "The resulting hash is then converted into hexadecimal values to increase strength, and these values are filtered through your chosen character set to generate your final password. Because the process is deterministic, the same combination of inputs will always create the exact same password.",
            "This means Vault never stores your actual passwords anywhere. They're generated on-demand in your browser whenever you need them, which eliminates the need for password databases or cloud storage."
        ]
    },
    {
        id: "master-password",
        question: "What is the master password used for?",
        answer: [
            "Your master password is the cryptographic key to your entire vault. It's the primary input in the SHA-512 hashing algorithm that generates all your service passwords. Without it, your passwords cannot be recreated.",
            "Your master password is never stored anywhere. Not on our servers, not in your browser storage, and not in any backup. It only exists in your memory. And that's actually a good thing because it means no one can access your passwords, even if they somehow breach the application.",
            "Of course, this also means if you forget your master password, your generated passwords cannot be recovered. That's why it's really important to create a strong, memorable master password and keep it safe. Consider using a passphrase with words and numbers for both security and memorability."
        ]
    },
    {
        id: "data-storage",
        question: "Where is my information stored?",
        answer: [
            "All your data is stored locally in your browser's storage (IndexedDB or LocalStorage, depending on your browser). This includes your accounts, service configurations, custom alphabets, and application settings. Your metadata stays entirely on your device.",
            "We only store the metadata that helps organize your passwords. Things like service identifiers ('gmail', 'github'), account names, custom character sets you create, vault organization, and your settings. The actual passwords themselves are never stored because they're generated whenever you need them.",
            "Nothing leaves your device unless you choose to export your data as an encrypted file or enable Google Drive synchronization. You have complete control over what data is stored locally and whether it's synced elsewhere."
        ]
    },
    {
        id: "google-sync",
        question: "Can I sync my data across devices?",
        answer: [
            "Yes! Vault supports Google Drive backup and restore, but the sync is manual rather than automatic. After connecting Vault to your Google account, you decide when to send your local data to Drive or when to download the saved copy into this device.",
            "To enable this, you authorize Vault to connect with your Google Drive account using OAuth 2.0 authentication. Vault stores the encrypted backup in Google's AppData folder, which is a special hidden application storage area separate from your regular Google Drive files and folders.",
            "The important detail is that nothing syncs on its own: if you want to save your current vault to Google Drive, you must click the \"Replace Drive Data\" button in the settings panel. If you want to restore all data from Drive, you must click the \"Synchronize from Drive\" button in the same section. This gives you full control over when data is transferred and avoids unexpected updates.",
            "Your data is encrypted before it leaves your device using industry-standard encryption algorithms, so even Google cannot see your vault contents. The AppData storage adds privacy because your vault data is stored in an isolated application space that you cannot browse from the normal Google Drive interface."
        ]
    },
    {
        id: "google-drive-security",
        question: "Is my data safe on Google Drive?",
        answer: [
            "Yes, your data is secure on Google Drive because Vault encrypts all your vault data before it leaves your device. Your encrypted backup is stored in Google's AppData folder, which is a specialized, hidden storage area designed for application data, not in your regular Google Drive files where you could accidentally share or expose it.",
            "The encryption ensures that even if someone gains unauthorized access to your Google Drive account, they would only see encrypted data without any meaning. Your master password stays in your browser memory and is never sent to Google or stored anywhere. Additionally, the AppData folder gives you an extra layer of isolation. Your vault data is stored separately from your regular files and is not visible in the standard Google Drive interface, which adds an extra barrier against accidental exposure.",
            "Google Drive's infrastructure provides additional security through HTTPS encryption and their own data center security practices. But the main security layer comes from Vault's encryption. Your vault data is protected by your master password, making it mathematically infeasible to access without it.",
            "For added security, consider using two-factor authentication (2FA) on your Google Account. This prevents unauthorized access to your Google Drive account even if someone gets your password. The combination of AppData isolation, encryption, and 2FA creates multiple layers of protection for your vault data."
        ]
    },
    {
        id: "google-tokens",
        question: "What are access tokens and how do they work?",
        answer: [
            "Access tokens are temporary credentials that Vault uses to authenticate with Google Drive on your behalf. When you authorize Vault to access Google Drive, Google issues an access token that allows Vault to upload, download, and manage your backup file in the AppData folder.",
            "These tokens have a limited lifespan for security reasons. They expire after a certain period, usually one hour. Vault automatically manages this by requesting refresh tokens from Google, so it can obtain new access tokens without asking you to authorize again repeatedly. This ensures your sync continues to work seamlessly without interruption.",
            "The token refresh happens transparently in the background. When Vault detects that an access token is about to expire, it automatically uses the refresh token to get a new one. All of this happens locally in your browser without you needing to do anything.",
            "Your refresh tokens are stored locally in your browser storage and are never sent to our servers or any external service. You can revoke all Google Drive access anytime by removing Vault's authorization from your Google Account settings, which will invalidate all tokens and stop Google Drive sync immediately. This completely disconnects Vault from Google Drive and prevents any further syncing."
        ]
    },
    {
        id: "security",
        question: "Is this safe?",
        answer: [
            "Vault operates with a privacy-first approach that significantly reduces security risks compared to traditional password managers. Your actual passwords are never stored anywhere. They're generated when you need them, which means there's no central database of passwords that could be breached.",
            "All password generation and management happens entirely within your browser, using standard cryptographic algorithms with SHA-512 technology. Your data never leaves your device and is never transmitted to external servers, so you have complete control over your information.",
            "However, security depends on how strong your master password is. A strong master password is really important because if someone gets access to it, they can generate all your passwords. Also, while Vault's architecture is solid, we recommend forking the project and hosting it locally, auditing the code, or creating your own implementation for maximum peace of mind. The code is open-source and available on <a href=\"https://github.com/sizoLabs/vault\" target=\"_blank\" style=\"text-decoration: underline;\">GitHub</a> for transparency.",
            "Remember, Vault is provided as-is, and you're responsible for checking that its security meets your needs before using it for sensitive accounts."
        ]
    },
    {
        id: "custom-alphabets",
        question: "What are Custom Alphabets and why do I need them?",
        answer: [
            "Custom Alphabets are personalized character sets you define to generate passwords that meet specific service requirements. Some services have strict password rules. For example, some banks might require only uppercase letters and numbers, while others might not allow special characters.",
            "Instead of manually creating complex passwords that fit those requirements, you define a Custom Alphabet with exactly the characters allowed by that service. Vault then generates passwords using only those characters, so you comply with the service's password policy.",
            "You can create multiple alphabets for different scenarios. One for highly secure services with uppercase, lowercase, numbers, and special characters. Another for services with limited character sets, and another for simple numeric PINs. This flexibility ensures your generated passwords always work while maintaining maximum strength within the constraints."
        ]
    },
    {
        id: "import-export",
        question: "How do I backup and transfer my vault data?",
        answer: [
            "Vault provides Import/Export functionality to seamlessly backup and transfer your data between devices or as a safety measure. You can export your entire vault, including all accounts, services, secrets, and custom alphabets, as an encrypted file.",
            "To export, simply access the settings and select 'Export'. This creates a downloadable encrypted file containing all your metadata. You can store this file securely on external drives, cloud storage, or any safe location outside Vault.",
            "To restore your vault on a new device or after clearing your browser storage, select 'Import' from the settings and choose your exported file. Your entire vault structure and configurations will be restored locally. Remember: this file contains your metadata but not your master password, which remains known only to you."
        ]
    },
    {
        id: "account-organization",
        question: "How do I organize multiple accounts and services?",
        answer: [
            "Vault provides comprehensive account and service organization through multiple organizational layers. You can create multiple accounts to separate different contexts. For example, a personal account, a work account, or accounts for different organizations.",
            "Within each account, you create services representing different websites or applications (Gmail, GitHub, Twitter, etc.). For each service, you can store multiple secrets and configure specific settings like custom alphabets, service identifiers, and optional notes.",
            "Additionally, Vault supports Folder-Based Organization through Vaults (folders), allowing you to group related services and accounts for better structure and management. You might organize by category (Work, Personal, Finance), by security level, or any structure that makes sense for your workflow. This hierarchical organization keeps your credentials organized and easy to navigate."
        ]
    },
    {
        id: "privacy-control",
        question: "How does Vault protect my privacy?",
        answer: [
            "Privacy is fundamental to how Vault is designed. The application operates entirely in your browser without needing any external communication for core functionality. This means Vault has no knowledge of your passwords, accounts, or personal data. Even when using Google Drive sync, only your encrypted vault data is shared to the AppData folder, and Google has no way to decrypt it.",
            "Your data never leaves your device unless you choose to export it or intentionally begin a Google Drive upload or download. There are no tracking cookies, analytics, or telemetry collecting information about your usage. The application doesn't communicate with servers to validate passwords or authenticate services. All operations happen locally.",
            "Google Drive sync is optional and under your control. Your encrypted backup is stored in Google's AppData folder, which is a hidden application storage area not visible in the regular Google Drive interface. This provides isolation, so you cannot accidentally share your vault data along with regular files. The backup stays in a private application space, and it is only transferred when you click the sync buttons in the settings panel.",
            "For maximum privacy assurance, you can review the open-source code on <a href=\"https://github.com/sizoLabs/vault\" target=\"_blank\" style=\"text-decoration: underline;\">GitHub</a> to audit it yourself, host a private instance on your own infrastructure, or create your own implementation using Vault's methodologies. This transparency and ability to selfhost means privacy depends only on your choices, not on trusting a third-party service provider."
        ]
    },
    {
        id: "why-free",
        question: "Why is Vault free, and what is the author's philosophy?",
        answer: [
            "Vault is free because the philosophy behind it is simple: security and privacy should not be locked behind a paywall. The author believes that tools for protecting your digital life should be accessible to everyone, not reserved only for people who can afford premium software.",
            "This project is built around a minimalist, privacy-first mindset. The goal is not to maximize profit or collect user data, but to make a reliable, transparent, and useful tool for anyone who wants to take control of their online security without depending on opaque, centralized services.",
            "Vault is also open-source, which reflects a belief in transparency and trust. Anyone can inspect the code, understand how it works, and even adapt it for their own needs. In that sense, the project is more than a product: it is a statement that digital autonomy, independence, and personal responsibility matter more than commercial lock-in.",
            "The author is not trying to create a complex ecosystem or exploit users. The idea is to provide a practical, honest tool that helps people generate strong passwords and manage their credentials with clarity, freedom, and respect for privacy."
        ]
    }
]

export default function FAQPage() {

    const [ activeItemId, setActiveItemId ] = useState<string | null>(null)
    const activeItem = faqItems.find((item) => item.id === activeItemId)

    return (
        <>
            <div className="relative h-full w-full overflow-hidden squircle-md border border-white/10 bg-white/2">

                <div className="flex h-full flex-col gap-5 md:gap-8 px-5 py-5 md:px-10 md:py-8">

                    <h2
                        onClick={() => setActiveItemId(null)}
                        className="shrink-0 cursor-pointer pt-2 text-xl font-inter-black text-white transition-colors duration-300 hover:text-primary md:text-8xl md:mb-5 text-center md:text-left"
                    >
                        Frequently Asked Questions
                    </h2>

                    <div className="h-full min-h-0 flex flex-1 flex-col gap-5 lg:flex-row">

                        <aside className="flex max-h-[80vh] min-h-0 w-full shrink-0 flex-col gap-2 overflow-y-auto no-scrollbar-but-scroll lg:max-h-full lg:w-80 mask-to-bottom mask-fade-20 pb-10">

                            {faqItems.map((item) => {

                                const isActive = item.id === activeItem?.id

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => setActiveItemId(item.id)}
                                        className={`group flex justify-start flex-col w-full items-start gap-0 md:gap-3 squircle-md md:squircle-lg border px-3 md:px-6 py-3 md:py-6 text-left transition-all duration-300 cursor-pointer ${
                                            isActive
                                                ? "border-primary/50 bg-primary/10 text-white"
                                                : "border-white/10 bg-white/2 text-white/75 hover:border-white/20 hover:bg-white/10 hover:text-white"
                                        }`}
                                    >

                                        <div className="block shrink-0 px-1 pr-1 text-sm md:text-2xl font-inter-black min-w-fit">
                                            {faqItems.findIndex((faqItem) => faqItem.id === item.id) + 1}
                                            <span className="opacity-50 ml-1.5 text-[18px] font-inter-medium">of {faqItems.length}</span>
                                        </div>

                                        <span className="text-sm md:text-[23px] leading-7 font-inter-bold">
                                            {item.question}
                                        </span>

                                    </button>
                                )
                            })}

                        </aside>

                        <section className="px-2 pb-2 lg:px-5 lg:flex flex-col min-h-0 flex-1 hidden">

                            {!activeItem && (
                                <div className="flex flex-col items-start justify-center h-full max-w-150 mx-auto gap-5 text-left">
                                    <h3 className="text-xl font-inter-black md:text-6xl">
                                        Read the questions users frequently ask about Vault
                                    </h3>
                                    <p className="text-sm text-white/70 md:text-2xl">
                                        Click on a question to view its answer
                                    </p>
                                </div>
                            )}

                            {activeItem && (
                                <h3 className="font-inter-bold text-5xl shrink-0 mb-5">
                                    { activeItem.question }
                                </h3>
                            )}

                            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar-but-scroll mask-to-bottom mask-fade-20 pb-10 max-w-270">
                                {activeItem && activeItem.answer.map((paragraph) => (
                                    <p
                                        className="mb-5 leading-10 text-white/75 text-[28px]"
                                        key={paragraph}
                                        dangerouslySetInnerHTML={{ __html: paragraph }}
                                    />
                                ))}
                            </div>

                        </section>

                    </div>

                </div>

            </div>

            {activeItem && (
                <>

                    <div className="absolute" />

                    <div className="fixed inset-0 z-999 bg-black/20 backdrop-blur-[80px] lg:hidden p-10 h-screen overflow-hidden flex flex-col">

                        <span className="shrink-0 mb-5">
                            <i className="ti ti-arrow-left text-2xl text-white cursor-pointer" onClick={() => setActiveItemId(null)} />
                        </span>

                        <h3 className="mb-10 font-inter-bold text-4xl shrink-0">
                            { activeItem.question }
                        </h3>

                        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar-but-scroll mask-to-bottom mask-fade-20 pb-10">
                            {activeItem.answer.map((paragraph) => (
                                <p
                                    className="mb-5 text-sm leading-9 text-white/75 md:text-2xl"
                                    key={paragraph}
                                    dangerouslySetInnerHTML={{ __html: paragraph }}
                                />
                            ))}
                        </div>

                    </div>
                </>
            )}
        </>
    )

}