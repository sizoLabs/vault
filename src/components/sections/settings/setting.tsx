import Toggle from "@component/ui/form/toggle"
import Select from "@component/ui/form/select"
import Input from "@component/ui/form/input"
import Color from "@component/ui/form/color"
import ColorPalette from "@component/ui/form/colorPalette"
import IconSelector from "@component/ui/form/icon"

import { getAlphabetList } from "@logic/alphabet"

import type { ISettings, IAccountSettings } from "@interface/index"

interface SettingProps {
    setting: ISettings
    value?: IAccountSettings["value"]
    accountId: string
    onChange: ({ settingId, value }: { settingId: string, value: string | number | boolean }) => void
}

const Setting = ({ setting, value, accountId, onChange }: SettingProps) => {

    const settingValue = value ?? (() => {
        if (setting.type === "toggle") return false
        if (setting.type === "number") return 14
        if (setting.type === "color") return "#a58fff"
        return ""
    })()

    return (
        <div className="container" key={ setting.id }>
            <div>
                <h3>
                    { setting.name }
                </h3>
                <div className="description">
                    { setting.description }
                </div>
            </div>
            <div className="option">

                { setting.type === "text" ? (
                    <Input
                        id={ setting.id }
                        defaultValue={ String(settingValue) }
                        type={ setting.type }
                        className="squircle-md w-full md:max-w-60"
                        onChange={ (event: React.ChangeEvent<HTMLInputElement>) => {
                            const nextValue = setting.type === "number" ? parseInt(event.target.value, 10) : event.target.value
                            onChange({ settingId: setting.id, value: nextValue })
                        }}
                    />
                ) : null}

                { setting.type === "number" ? (
                    <Input
                        id={ setting.id }
                        defaultValue={ String(settingValue) }
                        type={ setting.type }
                        className="squircle-md w-full md:max-w-23"
                        onChange={ (event: React.ChangeEvent<HTMLInputElement>) => {
                            const nextValue = setting.type === "number" ? parseInt(event.target.value, 10) : event.target.value
                            onChange({ settingId: setting.id, value: nextValue })
                        }}
                    />
                ) : null }

                { setting.type === "select" ? (
                    <div className="w-full md:max-w-60 md:min-w-50">
                        <Select
                            id={ setting.id }
                            options={ getAlphabetList(accountId) }
                            selected={ String(settingValue) }
                            onSelect={ ({ settingId, value }: { settingId: string, value: string | number | boolean }) => onChange({ settingId, value }) }
                            descriptions={ true }
                        />
                    </div>
                ) : null }

                { setting.type === "toggle" ? (
                    <div className="group">
                        <Toggle
                            id={ setting.id }
                            isChecked={ Boolean(settingValue) }
                            onToggle={ ({ settingId, value }: { settingId: string, value: string | number | boolean }) => onChange({ settingId, value }) }
                        />
                    </div>
                ) : null }

                { setting.type === "color" ? (
                    <>
                        <ColorPalette
                            id={ setting.id }
                            value={ typeof settingValue === "string" ? settingValue : "#a58fff" }
                            onChange={ ({ settingId, value }: { settingId: string, value: string }) => onChange({ settingId, value }) }
                        />
                        <Color
                            id={ setting.id }
                            value={ typeof settingValue === "string" ? settingValue : "#a58fff" }
                            onChange={ ({ settingId, value }: { settingId: string, value: string }) => onChange({ settingId, value }) }
                        />
                    </>
                ) : null }

                { setting.type === "icon" ? (
                    <>
                        <IconSelector
                            id={ setting.id }
                            value={ typeof settingValue === "string" ? settingValue : "user" }
                            onChange={ ({ settingId, value }: { settingId: string, value: string }) => onChange({ settingId, value }) }
                        />
                    </>
                ) : null }

            </div>
        </div>
    )

}

export default Setting
