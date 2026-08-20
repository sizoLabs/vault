import { cloneElement, isValidElement, useEffect, useState, type ReactElement, type ReactNode } from "react"
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { getServiceList, reorderService } from "@logic/service"
import { getSecretList, reorderSecret } from "@logic/secret"
import { getVault } from "@logic/vault"
import { getSetting } from "@logic/settings"

import type { IService, IVault, ISecret } from "@interface/index"

import ServiceCard from "@component/ui/vault/service"
import SecretCard from "@component/ui/vault/secret"

import CreateModal from "@component/sections/vault/create-modal"
import EditServiceModal from "@component/sections/vault/edit-service"
import EditSecretModal from "@component/sections/vault/edit-secret"
import EditVaultModal from "@component/sections/vault/edit-vault"

interface VaultProps {
    accountId: string
    vaultId: string
    masterPassword: string
}

const SortableItem = ({ id, children }: { id: string, children: ReactNode }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`w-full sm:max-w-50 cursor-grab active:cursor-grabbing ${isDragging ? "z-999" : ""}`}
            {...attributes}
            {...listeners}
        >
            {isValidElement(children)
                ? cloneElement(children as ReactElement<{ className?: string }>, {
                    className: isDragging ? "bg-primary/40! border-primary! shadow-xl backdrop-blur-xl" : ""
                })
                : children}
        </div>
    )
}

const Vault = (props: VaultProps) => {

    const { accountId, vaultId, masterPassword } = props

    const [ vaultData, setVaultData ] = useState<IVault>()
    const [ servicesList, setServicesList ] = useState<IService[]>([])
    const [ secretList, setSecretList ] = useState<ISecret[]>([])

    const [ selectedService, setSelectedService ] = useState<string>("")
    const [ selectedSecret, setSelectedSecret ] = useState<string>("")
    
    const [ isCreateModalOpen, setIsCreateModalOpen ] = useState(false)
    const [ isVaultModalOpen, setIsVaultModalOpen ] = useState(false)
    const [ isServiceModalOpen, setIsServiceModalOpen ] = useState(false)
    const [ isSecretModalOpen, setIsSecretModalOpen ] = useState(false)
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

    const isServiceOrganizationEnabled = Boolean(getSetting({ accountId, settingId: "enable-organize-services" }))

    const handleServiceDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id || !accountId) return

        const currentIndex = servicesList.findIndex((service) => service.id === active.id)
        const targetIndex = servicesList.findIndex((service) => service.id === over.id)
        if (currentIndex < 0 || targetIndex < 0) return

        const direction = currentIndex < targetIndex ? 1 : -1
        for (let index = currentIndex; index !== targetIndex; index += direction) {
            reorderService({ accountId, vaultId, serviceId: active.id.toString(), direction })
        }
        setServicesList((items) => {
            const reorderedItems = [...items]
            const [movedItem] = reorderedItems.splice(currentIndex, 1)
            reorderedItems.splice(targetIndex, 0, movedItem)
            return reorderedItems
        })
    }

    const handleSecretDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id || !accountId) return

        const currentIndex = secretList.findIndex((secret) => secret.id === active.id)
        const targetIndex = secretList.findIndex((secret) => secret.id === over.id)
        if (currentIndex < 0 || targetIndex < 0) return

        const direction = currentIndex < targetIndex ? 1 : -1
        for (let index = currentIndex; index !== targetIndex; index += direction) {
            reorderSecret({ accountId, vaultId, secretId: active.id.toString(), direction })
        }
        setSecretList((items) => {
            const reorderedItems = [...items]
            const [movedItem] = reorderedItems.splice(currentIndex, 1)
            reorderedItems.splice(targetIndex, 0, movedItem)
            return reorderedItems
        })
    }

    useEffect(() => {

        if (!accountId || !vaultId) {
            setServicesList([])
            setSelectedService("")
            return
        }

        const services = getServiceList({ accountId, vaultId })
        setServicesList(services)

        const secrets = getSecretList({ accountId, vaultId, masterPassword })
        setSecretList(secrets)

        const vault = getVault({ accountId, vaultId })
        setVaultData(vault)

    }, [ accountId, vaultId ])

    const handleCreateService = () => {
        setIsCreateModalOpen(true)
    }

    const handleEditVault = () => {
        setIsVaultModalOpen(true)
    }

    const handleServiceSettings = (serviceId: string) => {
        setSelectedService(serviceId)
        setIsServiceModalOpen(true)
    }

    const handleSecretSettings = (secretId: string) => {
        setSelectedSecret(secretId)
        setIsSecretModalOpen(true)
    }

    const handleRefreshVault = () => {

        const services = getServiceList({ accountId, vaultId })
        setServicesList(services)

        const secrets = getSecretList({ accountId, vaultId, masterPassword })
        setSecretList(secrets)

        const vault = getVault({ accountId, vaultId })
        setVaultData(vault)

    }

    if(vaultData) return (
        <>
            <div className="relative bg-white/2 border-white/10 w-full h-full squircle-md border overflow-hidden">

                <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll">

                    <div className="z-50 relative flex min-h-full flex-col px-5 py-5 md:p-10 overflow-hidden">

                        <div className="absolute -top-37.5 -left-37.5 opacity-5 -z-1 mask-to-bottom">
                            <i className={ "ti ti-" + vaultData.icon + " text-[900px]" } />
                        </div>
                        
                        <div className="text-3xl font-inter-black mb-5 flex flex-col md:flex-row">

                            <h2>
                                <i className={ "ti ti-" + vaultData.icon + " mr-3 align-middle inline-block -mt-1.25" } />
                                { vaultData.name}
                            </h2>
                            
                            <div className="mt-5 md:mt-0 md:ml-5 flex flex-row justify-between gap-2">
                                <button
                                    onClick={ () => handleEditVault() }
                                    className="text-[20px] pl-2 pr-2.5 pt-1.5 pb-1 bg-white/5 squircle-md  border border-white/10 align-middle inline-block -mt-1.25 cursor-pointer hover:border-white/30 hover:bg-white/10 duration-300"
                                >
                                    <i className="ti ti-settings" />
                                </button>
                                <button
                                    onClick={ () => handleCreateService() }
                                    className="text-[20px] pl-2 pr-2.5 pt-1.5 pb-1 bg-white/5 squircle-md  border border-white/10 align-middle inline-block -mt-1.25 cursor-pointer hover:border-white/30 hover:bg-white/10 duration-300 md:hidden"
                                >
                                    <i className="ti ti-plus" />
                                </button>
                            </div>

                        </div>

                        <div className="flex flex-row flex-wrap w-full gap-3">

                            {isServiceOrganizationEnabled ? (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleServiceDragEnd}>
                                    <SortableContext items={servicesList.map((service) => service.id)} strategy={rectSortingStrategy}>
                                        {servicesList.map((service, index) => (
                                            <SortableItem key={service.id ?? index} id={service.id}>
                                                <ServiceCard
                                                    service={service}
                                                    masterPassword={masterPassword}
                                                    accountId={accountId}
                                                    onSettingsClick={() => { handleServiceSettings(service.id) }}
                                                />
                                            </SortableItem>
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : servicesList.map((service, index) => (
                                <div key={service.id ?? index} className="w-full sm:max-w-50">
                                    <ServiceCard
                                        service={service}
                                        masterPassword={masterPassword}
                                        accountId={accountId}
                                        onSettingsClick={() => { handleServiceSettings(service.id) }}
                                    />
                                </div>
                            ))}

                            {isServiceOrganizationEnabled ? (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSecretDragEnd}>
                                    <SortableContext items={secretList.map((secret) => secret.id)} strategy={rectSortingStrategy}>
                                        {secretList.map((secret, index) => (
                                            <SortableItem key={secret.id ?? index} id={secret.id}>
                                                <SecretCard
                                                    secret={secret}
                                                    masterPassword={masterPassword}
                                                    accountId={accountId}
                                                    onSettingsClick={() => { handleSecretSettings(secret.id) }}
                                                />
                                            </SortableItem>
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : secretList.map((secret, index) => (
                                <div key={secret.id ?? index} className="w-full sm:max-w-50">
                                    <SecretCard
                                        secret={secret}
                                        masterPassword={masterPassword}
                                        accountId={accountId}
                                        onSettingsClick={() => { handleSecretSettings(secret.id) }}
                                    />
                                </div>
                            ))}

                            <div className="hidden md:block w-full sm:w-fit">
                                <button
                                    className="flex flex-col items-center justify-center px-10 py-5 sm:min-w-50 w-full h-full squircle-md border border-white/10 hover:border-white/50 hover:bg-white/10 duration-300 backdrop-blur-2xl cursor-pointer text-white/50 hover:text-white"
                                    onClick={ () => handleCreateService() }
                                >
                                    <i className="ti ti-plus text-8xl mb-2" />
                                    <span className="text-sm">Create New</span>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            <CreateModal
                open={ isCreateModalOpen }
                vaultId={ vaultId }
                accountId={ accountId }
                masterPassword={ masterPassword }
                onCreate={ handleRefreshVault }
                onClose={ () => setIsCreateModalOpen(false) }
            />

            <EditVaultModal
                open={ isVaultModalOpen }
                vaultId={ vaultId }
                accountId={ accountId }
                onUpdate={ handleRefreshVault }
                onClose={ () => setIsVaultModalOpen(false) }
            />

            <EditServiceModal
                open={ isServiceModalOpen }
                vaultId={ vaultId }
                accountId={ accountId }
                serviceId={ selectedService }
                masterPassword={ masterPassword }
                onUpdate={ handleRefreshVault }
                onClose={ () => setIsServiceModalOpen(false) }
            />

            <EditSecretModal
                open={ isSecretModalOpen }
                vaultId={ vaultId }
                accountId={ accountId }
                secretId={ selectedSecret }
                masterPassword={ masterPassword }
                onUpdate={ handleRefreshVault }
                onClose={ () => setIsSecretModalOpen(false) }
            />

        </>
    )

}

export default Vault