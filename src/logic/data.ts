import { getStorage, setStorage } from "@logic/storage"
import { generateId } from "@logic/utils"

export const resetAllData = (accountId: string) => {

    let account = getStorage(accountId)

    const defaultAlphabets = [
        {
            id: generateId(),
            name: "Default",
            identifier: "default",
            characters: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%*()_+=-?[]{}",./<>|`,
            description: "Characters, digits and special characters"
        },
        {
            id: generateId(),
            name: "Spanish",
            identifier: "spanish",
            characters: `ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz1234567890¡!ç@#€$%*()_+=-¿?[]{}",./<>|`,
            description: "Same as default plus ñÑ€¡¿ç"
        },
        {
            id: generateId(),
            name: "Characters and digits",
            identifier: "chars-digits",
            characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890",
            description: "Characters and digits"
        },
        {
            id: generateId(),
            name: "Legacy v2",
            identifier: "legacy-v2",
            characters: `ABCDEFGHIJKLMNÃ‘OPQRSTUVWXYZabcdefghijklmnÃ±opqrstuvwxyz1234567890!@#$%*()_+=-â‚¬Â¡?Â¿[]{}",./Ã§<>| `,
            description: "Default plus ñÑ€¡¿ç and broken utf-8 to windows-1252 conversion"
        },
        {
            id: generateId(),
            name: "Legacy v1",
            identifier: "legacy-v1",
            characters: "ABCDFGHIJKLMNOPQRSTUVWXYZabdfghijklmnopqrstuvwxyz1234567890",
            description: "A-Z a-z 0-9 without Ee"
        },
        {
            id: generateId(),
            name: "Unicode madness",
            identifier: "crazy",
            characters: "ꓯꓭꓛꓷꓱꓞꓨꓩꓘꓶꟽИꟼꓤƧꓕꓵꓥ༽᚛᚜‹›⁅⁆⁽⁾₍₎⅀∁∂∃∄∈∉∊∋∌∍∑∕∖√∛∜∝∟∠∡∢∤∦∫∬∭∮∯∰∱∲∳∹∻∼∽∾∿≀≁≂≃≄≅≆≇≈≉≊≋≌≒≓≔≕≟≠≢≤≥≦≧≨≩≪≫≮≯≰≱≲≳≴≵≶≷≸≹≺≻≼≽≾≿⊀⊁⊂⊃",
            description: "Uncommon unicode characters"
        },
        {
            id: generateId(),
            name: "Only digits",
            identifier: "digits",
            characters: "1234567890",
            description: "Only digits (0-9)"
        }
    ]

    const defaultSettings = [
        {
            id: "default-password-length",
            value: 14
        },
        {
            id: "default-show-passwords",
            value: false
        },
        {
            id: "default-alphabet",
            value: defaultAlphabets[0].id
        },
        {
            id: "enable-folder-sorting",
            value: true
        },
        {
            id: "enable-password-sorting",
            value: true
        }
    ]

    const defaultVault = [
        {
            fid: generateId(),
            name: "My Vault",
            icon: "vault"
        }
    ]
    
    account = {
        ...account,
        alphabets: defaultAlphabets,
        settings: defaultSettings,
        vaults: defaultVault
    }

    setStorage(accountId, account)

}