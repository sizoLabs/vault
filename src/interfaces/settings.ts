export interface IAccountSettings {
    id: string
    value: string | number | boolean
}

export interface ISettings {
    id: string
    name: string
    description: string
    placeholder?: string
    type: string
}