# VAULT

VAULT is a privacy-focused, deterministic password manager and password generator that runs primarily in your browser.

Instead of storing generated passwords, VAULT derives them on demand from a master password, a service identifier, and a selected character set. Vault metadata is stored locally in the browser, while generated passwords do not need to be stored.

The project is open source and licensed under the MIT License.

## Features

* Deterministic password generation
* Custom password lengths
* Custom character sets
* Multiple accounts
* Vault (folder) organization
* Service and account management
* Secret management
* Encrypted `.vault` export and import
* Optional master-password verification
* Google Drive backup and restore
* Chrome extension integration
* Local-first data storage
* No centralized password database
* Runs directly in the browser

## How VAULT Works

VAULT separates password generation from password storage.

For generated service passwords, VAULT uses the following inputs:

* Master password
* Service or account identifier
* Character set
* Password length
* Password-generation version

These values are processed using SHA-512 through the Web Crypto API. The resulting deterministic hash is then used as the seed for a deterministic pseudo-random generator, which selects characters from the configured character set until the requested password length is reached.

Conceptually:

```text
Master Password
       +
  Identifier
       +
 Character Set
       +
   Version
       ↓
   SHA-512
       ↓
 Deterministic Seed
       ↓
 Character Selection
       ↓
 Generated Password
```

The same inputs produce the same password every time.

This means VAULT does not need to store the generated password itself. If you know the same master password and use the same identifier, character set, length, and generation version, the same password can be reproduced.

### Important

The security of deterministic password generation depends heavily on the strength and secrecy of the master password, as well as the design and implementation of the password-generation algorithm.

## Local Data

VAULT follows a local-first architecture. Core application data is stored locally in the browser.

This includes information such as:

* Accounts
* Vaults
* Services
* Secrets
* Character sets
* Application settings

Account identifiers are generated locally and vault state is maintained through browser storage.

Generated passwords do not need to be persisted because they can be reproduced deterministically.

## Master Password

The master password is used as the secret input for deterministic password generation.

VAULT can optionally store a verifier that allows the application to determine whether an entered master password is correct.

When enabled, the verifier is derived using PBKDF2-SHA-256 with a randomly generated salt and is stored locally with the account data.

The master password itself is not stored.

If master-password verification is disabled, VAULT does not store this verifier.

## Encrypted Export

VAULT supports exporting account data to an encrypted `.vault` file.

Before export, account data is serialized and encrypted locally in the browser.

The current implementation derives an AES-256 encryption key using:

```text
PBKDF2
SHA-256
100,000 iterations
```

A random salt and initialization vector (IV) are generated for every export.

The resulting encrypted data is encoded as Base64 and saved as a `.vault` file.

Conceptually:

```text
Vault Data
    ↓
JSON Serialization
    ↓
PBKDF2-SHA-256
    ↓
AES-256-CBC
    ↓
Salt + IV + Ciphertext
    ↓
Base64
    ↓
.vault File
```

The encrypted export can later be imported using the same master password.

> **Security note:** The current export format uses AES-CBC. AES-CBC provides confidentiality but does not provide authenticated integrity by itself. Future versions may migrate the format to an authenticated encryption mode such as AES-GCM.

## Google Drive

VAULT can optionally use Google Drive for backup and restore.

The Google Drive integration is intended to store encrypted vault exports rather than plaintext vault data.

Google Drive functionality is optional and is not required to use VAULT locally.

## Chrome Extension

VAULT provides integration with the VAULT Chrome extension.

The extension can synchronize relevant VAULT data such as accounts, services, and character sets with the web application.

This allows VAULT to be used while browsing without requiring the user to manually switch back to the main application.

## Privacy Model

VAULT is designed around a local-first model.

The core vault data is maintained in the user's browser rather than in a centralized password database.

There is no server-side password database required for the core password-generation functionality.

However, browser-local storage should not be considered equivalent to hardware-backed secure storage.

A malicious browser extension, compromised browser profile, malicious JavaScript served by a compromised deployment, or malware running on the device may potentially access information available to the browser.

For this reason, users should understand the security properties of the environment in which they run VAULT.

## Security Considerations

VAULT is a cryptographic application. Using cryptographic primitives such as SHA-512, PBKDF2, and AES does not by itself guarantee that the complete application is secure.

Security depends on the entire implementation, including:

* Master-password strength
* Password-generation algorithm
* Character-selection algorithm
* Browser security
* Application integrity
* Local storage security
* Export encryption
* Dependency security
* Deployment configuration

VAULT has not been independently audited by a professional security auditing organization.

Do not assume that the project is suitable for protecting highly sensitive credentials without independently reviewing the source code and threat model.

For security-conscious deployments, consider:

1. Reviewing the source code.
2. Hosting your own instance.
3. Auditing dependencies.
4. Using HTTPS.
5. Keeping your browser and operating system up to date.
6. Using a strong, unique master password.
7. Maintaining encrypted backups of your vault data.

## Self-Hosting

One of VAULT's goals is to make self-hosting straightforward.

You can run your own instance instead of relying on a publicly hosted deployment.

For production deployment with Coolify, see [`COOLIFY.md`](COOLIFY.md).

The deployment guide covers:

* Docker Compose configuration
* Domain configuration
* Port configuration
* Google OAuth configuration
* Update procedures

## Development

### Requirements

* Node.js `>=22.12.0`
* pnpm

### Clone the repository

```bash
git clone https://github.com/sizoLabs/vault.git
cd vault
```

### Install dependencies

```bash
pnpm install
````

### Start the development server

```bash
pnpm dev
````

The development server will start Astro in development mode.

### Build for production

```bash
pnpm build
```

### Preview the production build

```bash
pnpm preview
```

## Project Structure

The application is organized into several main directories:

```text
src/
├── components/     # React UI components
├── interfaces/     # TypeScript interfaces
├── layouts/        # Astro layouts
├── logic/          # Application and cryptographic logic
├── pages/          # Astro pages
└── styles/         # Application styles
```

The main application logic is located in `src/logic/`:

```text
src/logic/
├── account.ts      # Account management and import/export
├── alert.ts        # Application alerts
├── alphabet.ts     # Character-set management
├── background.ts   # Background functionality
├── data.ts         # Data handling
├── google.ts       # Google Drive integration
├── master.ts       # Master-password verification
├── secret.ts       # Secret management
├── service.ts      # Service management
├── settings.ts     # Application settings
├── storage.ts      # Local storage abstraction
├── utils.ts        # Cryptographic and utility functions
├── vault.ts        # Vault management
└── version.ts      # Application version management
```

## Technology Stack

VAULT is built with:

* [Astro](https://astro.build/)
* [React](https://react.dev/)
* [TypeScript](https://www.typescriptlang.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* Web Crypto API
* SHA-256
* SHA-512
* PBKDF2
* AES-256-CBC

The project currently requires Node.js `>=22.12.0`.

## Cryptographic Architecture

VAULT uses the browser's native Web Crypto API for cryptographic operations.

### Password Generation

Password generation uses SHA-512 to deterministically derive a seed from the configured inputs.

The resulting hash is passed to the deterministic `random-seed` generator, which selects characters from the configured alphabet.

This allows VAULT to reproduce the same password without storing the generated password.

### Master Password Verification

When enabled, VAULT creates a random 128-bit salt and derives an HMAC-SHA-256 key from the master password using PBKDF2.

The verifier is then generated using HMAC-SHA-256 and stored locally.

```text
Master Password
       ↓
PBKDF2-SHA-256
       ↓
HMAC Key
       ↓
HMAC-SHA-256
       ↓
Master Verifier
```

A new random salt is generated when the verifier is created.

### Export Encryption

Encrypted exports use a randomly generated salt and IV.

The master password is processed using PBKDF2-SHA-256 and 100,000 iterations to derive a 256-bit AES key.

The vault data is then encrypted using AES-256-CBC.

```text
Master Password
       ↓
PBKDF2-SHA-256
100,000 iterations
       ↓
AES-256 Key
       ↓
AES-256-CBC
       ↓
Encrypted Vault
```

## Browser Security

VAULT requires the Web Crypto API.

Modern browsers expose Web Crypto in secure contexts, such as:

* HTTPS
* `localhost`

If VAULT is served over an insecure HTTP connection, cryptographic functionality may be unavailable depending on the browser environment.

For production deployments, HTTPS is therefore recommended.

## Data Portability

VAULT is designed to keep users in control of their data.

Account data can be exported into an encrypted `.vault` file and later imported into another VAULT installation.

This makes it possible to:

* Back up your vault
* Move between installations
* Self-host VAULT
* Recover data after clearing browser storage
* Keep offline encrypted backups

Always keep at least one backup of important vault data.

If browser storage is deleted and no backup exists, locally stored vault metadata may be permanently lost.

## Account and Vault Organization

VAULT supports multiple independent accounts.

Each account can contain:

* Vaults
* Services
* Secrets
* Character sets
* Settings

Vaults can be used to organize services and secrets into separate groups.

For example:

```text
Personal
├── Email
├── Social
├── Banking
└── Shopping

Work
├── GitHub
├── Cloud
├── Hosting
└── Internal Services
```

Deleting a vault also removes the services and secrets associated with that vault.

## Character Sets

VAULT allows users to define custom character sets for password generation.

This is useful for services that impose password requirements such as:

* Uppercase characters
* Lowercase characters
* Numbers
* Symbols
* Restricted symbol sets
* Custom alphabets

A character set is part of the deterministic password-generation configuration. Changing the selected character set can therefore produce a different password.

## Password Generation Versions

VAULT supports password-generation versions to generate a new password for the same service without changing the master password, service identifier, or character set.

When the generation version is changed, the version number is included in the cryptographic input used to generate the password. This produces a different deterministic result while keeping the rest of the configuration unchanged.

For example:

```text
Master Password + GitHub + Default Alphabet + Version 1
                         ↓
                    Password A

Master Password + GitHub + Default Alphabet + Version 2
                         ↓
                    Password B
```

Changing the generation version therefore allows you to rotate a password without having to create a new service identifier or modify your master password or character set.

The same generation version will always produce the same password when the other inputs remain unchanged.

## Threat Model

VAULT is primarily designed to reduce reliance on centralized password storage.

Its threat model assumes that the user's device and browser are not already compromised.

VAULT does not protect against:

* Malware running on the operating system
* A compromised browser
* Malicious browser extensions
* Keyloggers
* A compromised VAULT deployment
* Malicious JavaScript injected into the application
* A stolen master password

If an attacker can execute arbitrary code in the same environment as VAULT, they may potentially access secrets or generated passwords while VAULT is being used.

Self-hosting can reduce the amount of infrastructure you need to trust, but it does not eliminate endpoint security risks.

## Self-Hosting

VAULT can be self-hosted.

For production deployments using Coolify, see [`COOLIFY.md`](COOLIFY.md).

Self-hosting is particularly useful for users who want greater control over:

* Application hosting
* Deployment infrastructure
* Application updates
* Network access
* Google OAuth configuration

## Contributing

Contributions are welcome.

Before submitting a pull request:

1. Keep changes focused.
2. Follow the existing project structure and coding conventions.
3. Test affected functionality.
4. Document significant behavioral changes.
5. Pay particular attention to cryptography, storage, authentication, and import/export changes.

Security-sensitive changes should receive additional review before being merged.

## Reporting Security Issues

Please do not publicly disclose an exploitable security vulnerability before there is an opportunity to investigate it.

If you discover a potential security issue, contact the project maintainers privately and provide enough information to reproduce and understand the vulnerability.

## License

VAULT is released under the MIT License.

See [`LICENSE`](LICENSE) for the complete license text.

## Disclaimer

VAULT is provided "as is", without warranty of any kind.

The project has not undergone an independent professional security audit.

The use of cryptographic primitives such as SHA-512, PBKDF2, HMAC, and AES does not guarantee the security of the complete application.

Users are responsible for evaluating VAULT against their own security requirements before using it to store or generate sensitive credentials.

For important credentials, use a strong and unique master password, maintain encrypted backups, keep your browser and operating system updated, and consider auditing the source code or self-hosting the application.

---

**VAULT — deterministic password generation, local-first storage, and user-controlled encrypted backups.**

