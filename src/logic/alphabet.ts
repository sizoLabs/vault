import { getStorage, setStorage } from "@logic/storage"
import { updateSettings, getAccountSettings } from "@logic/settings"
import { generateId } from "@logic/utils"

export const importAlphabets = ({ accountId, alphabets }: { accountId: string, alphabets: any }) => {

    let account = getStorage(accountId)

    account = {
        ...account,
        alphabets: alphabets
    }

    setStorage(accountId, account)

}

export const createDefaultAlphabet = (accountId: string) => {

    let account = getStorage(accountId)

    if(!account) account = {}

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

    account = {
        ...account,
        alphabets: defaultAlphabets
    }

    setStorage(accountId, account)

}

export const getAlphabetCount = (accountId: string) => {
    const account = getStorage(accountId)
    if(!account.alphabets || account.alphabets.length === 0) return 0
    return account.alphabets.length
}

export const getAlphabetList = (accountId: string) => {
    const account = getStorage(accountId)
    if(!account.alphabets || account.alphabets.length === 0) return []
    return account.alphabets
}

export const getAlphabet = ({ accountId, alphabetId }: { accountId: string, alphabetId: string }) => {
    const account = getStorage(accountId)
    const alphabets = account.alphabets
    for (let index = 0; index < alphabets.length; index++) {
        if(alphabets[index].id === alphabetId) return alphabets[index]
    }
}

export const createAlphabet = ({ accountId, name, identifier, characters, description }: { accountId: string, name: string, identifier: string, characters: string, description: string }) => {

    let account = getStorage(accountId)
    const alphabets = getAlphabetList(accountId)

    const newAlphabet = {
        id: generateId(),
        name: name,
        identifier: identifier,
        characters: characters,
        description: description
    }

    alphabets.push(newAlphabet)

    account = {
        ...account,
        alphabets: alphabets
    }

    setStorage(accountId, account)

    const settings = getAccountSettings(accountId)

    for (let index = 0; index < settings.length; index++) {
        if(settings[index].id === "default-alphabet") {
            if(settings[index].value == "") {
                updateSettings({
                    accountId,
                    settingId: "default-alphabet",
                    value: newAlphabet.id
                })
            }
            break
        }
    }
    
}

export const updateAlphabet = ({ accountId, alphabetId, name, identifier, characters, description }: { accountId: string, alphabetId: string, name: string, identifier: string, characters: string, description: string }) => {

    let account = getStorage(accountId)
    let alphabets = getAlphabetList(accountId)

    for (let index = 0; index < alphabets.length; index++) {
        if(alphabets[index].id === alphabetId) {
            alphabets[index].name = name
            alphabets[index].identifier = identifier
            alphabets[index].characters = characters
            alphabets[index].description = description
            break
        }
    }

    account = {
        ...account,
        alphabets: alphabets
    }

    setStorage(accountId, account)
    
}

export const deleteAlphabet = (accountId: string, alphabetId: string) => {

    let account = getStorage(accountId)
    let alphabets = getAlphabetList(accountId)

    for (let i = 0; i < alphabets.length; i++) {
        if(alphabets[i].id === alphabetId) {
            alphabets.splice(i, 1)
            break
        }
    }

    account = {
        ...account,
        alphabets: alphabets
    }

    setStorage(accountId, account)

    if(alphabets.length > 0) {
        updateSettings({
            accountId,
            settingId: "default-alphabet",
            value: alphabets[0].id
        })
        return
    }

    updateSettings({
        accountId,
        settingId: "default-alphabet",
        value: ""
    })

}