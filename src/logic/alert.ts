import { generateId } from "@logic/utils"

export const showAlert = (message: string, type: string, icon: string, time: number) => {

    const oldAlert = window.document.querySelector('.alert')
    if(oldAlert) oldAlert.remove()

    const id = generateId()

    const alert = document.createElement('div')

    alert.classList.add('alert')
    alert.classList.add(type)

    alert.setAttribute("id", id)

    alert.innerHTML = `<span><i class="icon ti ti-${ icon }"></i></span> ${ message }`

    window.document.body.append(alert)
    
    requestAnimationFrame(() => alert.classList.add('show'))

    setTimeout(() => {
        const bodyAlert = window.document.getElementById(id)
        if(!bodyAlert) return
        bodyAlert.classList.remove('show')
        bodyAlert.classList.add('disapear')
        setTimeout(() => { bodyAlert.remove() }, 500)
    }, time)

}