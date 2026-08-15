import { useEffect, useState } from "react"

import { getAlphabetList, getAlphabet } from "@logic/alphabet"

import type { IAlphabet } from "@interface/index"

import AlphabetCard from "@component/ui/alphabets/alphabet"

import CreateAlphabetModal from "@component/sections/alphabets/create"
import EditAlphabetModal from "@component/sections/alphabets/edit"

interface AlphabetsProps {
    accountId: string
}

const Alphabets = (props: AlphabetsProps) => {

    const { accountId } = props

    const [ alphabetsList, setAlphabetsList ] = useState<IAlphabet[]>([])
    const [ selectedAlphabet, setSelectedAlphabet ] = useState<string>("")
    
    const [ isCreateModalOpen, setIsCreateModalOpen ] = useState(false)
    const [ isEditModalOpen, setIsEditModalOpen ] = useState(false)

    useEffect(() => {

        if (!accountId) {
            setAlphabetsList([])
            setSelectedAlphabet("")
            return
        }

        const alphabets = getAlphabetList(accountId)
        setAlphabetsList(alphabets)

    }, [ accountId ])

    const handleCreateAlphabet = () => {
        setIsCreateModalOpen(true)
    }

    const handleEditAlphabet = (alphabetId: string) => {
        setSelectedAlphabet(alphabetId)
        setIsEditModalOpen(true)
    }

    const handleRefreshAlphabets = () => {

        const alphabets = getAlphabetList(accountId)
        setAlphabetsList(alphabets)

    }

    return (
        <>
            <div className="relative bg-white/2 border-white/10 w-full h-full squircle-md border overflow-hidden">

                <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll">

                    <div className="z-50 relative flex min-h-full flex-col px-5 py-5 md:p-10 overflow-hidden">

                        <div className="absolute -top-37.5 -left-37.5 opacity-5 -z-1 mask-to-bottom">
                            <i className="ti ti-letters text-[900px]" />
                        </div>
                        
                        <div className="text-3xl font-inter-black mb-5 flex flex-col md:flex-row">

                            <h2>
                                <i className="ti ti-letters mr-3 align-middle inline-block -mt-1.25" />
                                Alphabets
                            </h2>
                            
                            <div className="mt-3 md:mt-0 md:ml-5 flex flex-row justify-between gap-2">
                                <button
                                    onClick={ () => handleCreateAlphabet() }
                                    className="text-[20px] pl-2 pr-2.5 pt-1.5 pb-1 bg-white/5 squircle-md  border border-white/10 align-middle inline-block -mt-1.25 cursor-pointer hover:border-white/30 hover:bg-white/10 duration-300 md:hidden"
                                >
                                    <i className="ti ti-plus" />
                                </button>
                            </div>

                        </div>

                        <div className="flex flex-row flex-wrap w-full gap-3">

                            {alphabetsList.map((alphabet: IAlphabet, index: number) => (
                                <AlphabetCard
                                    key={ alphabet.id ?? index }
                                    alphabet={ alphabet }
                                    onSettingsClick={ () => { handleEditAlphabet(alphabet.id) } }
                                />
                            ))}

                            <div className="hidden md:block w-full sm:w-fit">
                                <button
                                    className="flex flex-col items-center justify-center px-10 py-5 sm:min-w-50 w-full h-full squircle-md border border-white/10 hover:border-white/50 hover:bg-white/10 duration-300 backdrop-blur-2xl cursor-pointer text-white/50 hover:text-white"
                                    onClick={ () => handleCreateAlphabet() }
                                >
                                    <i className="ti ti-plus text-8xl mb-2" />
                                    <span className="text-sm">New Alphabet</span>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            <CreateAlphabetModal
                open={ isCreateModalOpen }
                accountId={ accountId }
                onCreate={ handleRefreshAlphabets }
                onClose={ () => setIsCreateModalOpen(false) }
            />

            <EditAlphabetModal
                open={ isEditModalOpen }
                accountId={ accountId }
                alphabetId={ selectedAlphabet }
                onUpdate={ handleRefreshAlphabets }
                onClose={ () => setIsEditModalOpen(false) }
            />

        </>
    )

}

export default Alphabets