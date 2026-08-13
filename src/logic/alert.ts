import { generateId } from "@logic/utils"

const getAlertContainer = () => {
    let container = window.document.querySelector('.alerts-container')
    if (!container) {
        container = document.createElement('div')
        container.classList.add('alerts-container')
        window.document.body.append(container)
    }
    return container
}

const closeAlert = (alertElement: HTMLElement) => {
    alertElement.classList.remove('show')
    alertElement.classList.add('disapear')
    setTimeout(() => { alertElement.remove() }, 500)
}

export const showAlert = (message: string, type: string, icon: string, time: number) => {

    const id = generateId()
    const container = getAlertContainer()

    const alert = document.createElement('div')

    alert.classList.add('alert')
    alert.classList.add(type)

    alert.setAttribute("id", id)

    alert.innerHTML = `<span><i class="icon ti ti-${ icon }"></i></span> ${ message }<button class="alert-close" aria-label="Cerrar alerta"><i class="ti ti-x"></i></button>`

    container.append(alert)
    
    const closeButton = alert.querySelector('.alert-close')
    if (closeButton) {
        closeButton.addEventListener('click', () => closeAlert(alert))
    }
    
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let startTime = Date.now()
    
    const startTimeout = () => {
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, time - elapsedTime)
        
        timeoutId = setTimeout(() => {
            const bodyAlert = window.document.getElementById(id)
            if(!bodyAlert) return
            closeAlert(bodyAlert)
        }, remainingTime)
    }
    
    alert.addEventListener('mouseenter', () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
    })
    
    alert.addEventListener('mouseleave', () => {
        startTimeout()
    })
    
    requestAnimationFrame(() => alert.classList.add('show'))
    startTimeout()

}