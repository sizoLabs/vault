# VAULT

VAULT is a secure, privacy-focused password manager and generator that operates entirely in your browser. Unlike traditional password managers, VAULT never stores your passwords, instead, it generates them on-demand using a deterministic hash-based system. Only metadata (folders, identifiers, and character sets) is kept locally.

## Features

- **Secure Password Generation:** Generate strong, unique passwords using customizable configurations and character sets, with no password ever being stored.
- **Secret Management:** Securely store and organize sensitive information.
- **Account Organization:** Manage multiple accounts across different services with associated secrets and character sets.
- **Folder-Based Organization:** Organize your credentials into custom vaults (folders) for better structure and management.
- **Import/Export:** Seamlessly backup and transfer your data between devices via encrypted files.
- **Custom Character Sets:** Define personalized alphabets to generate passwords that meet specific requirements.

## How It Works

VAULT uses a deterministic cryptographic hash system based on the Web Crypto API's `subtle.digest()` method with SHA-512. The process works as follows:

1. You provide a master password, an identifier, and a character set.
2. These inputs are combined and hashed using SHA-512.
3. The resulting hash is converted into hexadecimal values (2 characters each) for additional entropy.
4. The hexadecimal values are filtered through your chosen character set to generate the final password.

Because the generation is deterministic, the same combination of inputs always produces the same password. This eliminates the need to store passwords anywhere, you only need to remember your master password and keep track of the identifier and character set used for each account.

## Security and Privacy

VAULT operates entirely in your browser, your data never leaves your device and is never transmitted to external servers. All password generation and management happens locally on your machine.

**For maximum security**, consider forking this project and hosting it locally, auditing the code, or creating your own implementation. This project is provided as-is, and users are responsible for verifying its security meets their needs before use.

## Installation

Clone the repository and install dependencies:

```sh
pnpm i
```

Start the development server:

```sh
pnpm dev
```

Build the project for production:

```sh
pnpm build
```

## Contributing

Contributions are welcome! If you have ideas for new features, improvements, or bug fixes, feel free to submit a pull request. Please ensure your code follows the project's existing conventions and includes appropriate tests.