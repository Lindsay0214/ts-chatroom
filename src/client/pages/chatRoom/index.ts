import "./index.css";
import { io } from 'socket.io-client'
import { UserData } from "@/service/UserService";

type UserMessage = { userData: UserData, message: string, time: number }

const url = new URL(location.href)
const userName = url.searchParams.get('user_name')
const roomName = url.searchParams.get('room_name')

if (!userName || !roomName) {
    location.href = '/main/main.html'
}

// 建立連接 node server
const clientIo = io()

clientIo.emit('join', { userName, roomName })

const textInput = document.getElementById('textInput') as HTMLInputElement
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement
const chatBoard = document.getElementById('chatBoard') as HTMLDivElement
const headerRoomName = document.getElementById('headerRoomName') as  HTMLParagraphElement
const backBtn = document.getElementById('backBtn') as  HTMLParagraphElement

headerRoomName.innerText = roomName || "-"

let userID = ''

function messageHandler(data: UserMessage) {

    const date = new Date(data.time)
    const time = `${date.getHours()}:${date.getMinutes()}`

    const divBox = document.createElement('div')
    divBox.classList.add('flex', 'mb-4', 'items-end')
    if (data.userData.id === userID) {
        divBox.classList.add('justify-end')
        divBox.innerHTML = `
             <p class="text-xs text-gray-700 mr-4">${time}</p>
            <div>
                <p class="text-xs text-gray-700 mb-1">${data.userData.userName}</p>
                <p
                    class="mx-w-[50%] break-all bg-gray-800 px-4 py-2 rounded-tr-full rounded-br-full rounded-tl-full text-white"
                >
                    ${data.message}
                </p>
            </div>
        `
    } else {
        divBox.classList.add('justify-start')
        divBox.innerHTML = `
            <p class="text-xs text-gray-700 mr-4">${time}</p>
            <div>
                <p class="text-xs text-white mb-1 text-right">${data.userData.userName}</p>
                <p
                class="mx-w-[50%] break-all bg-white px-4 py-2 rounded-bl-full rounded-br-full rounded-tl-full"
                >
                ${data.message}
                </p>
            </div>
        `
    }

    chatBoard.appendChild(divBox)
    textInput.value = ''
    chatBoard.scrollTop = chatBoard.scrollHeight
}

function roomMessageHandler(message: string) {
    const divBox = document.createElement('div')
    divBox.classList.add('flex', 'justify-end', 'mb-4', 'items-end')
    divBox.innerHTML = `
        <div class="flex justify-center mb-4 items-center">
            <p class="text-gray-700 text-sm">${message}</p>
        </div> 
    `

    chatBoard.append(divBox)
    chatBoard.scrollTop = chatBoard.scrollHeight
}

submitBtn.addEventListener('click', () => {
    const textValue = textInput.value
    // chat event 
    clientIo.emit('chat', textValue)
})

backBtn.addEventListener('click', () => {
    location.href = '/main/main.html'
})

clientIo.on('join', (message) => {
    roomMessageHandler(message)
})

clientIo.on('chat', (data: UserMessage) => {
    messageHandler(data)
})

clientIo.on('leave', (message) => {
    roomMessageHandler(message)
})

clientIo.on('userID', (id) => {
    userID = id
})