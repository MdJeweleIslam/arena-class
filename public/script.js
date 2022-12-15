const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer({
    host: '/',
    port: '8000'
})
// console.log(myPeer._events);
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

// Below variable is making stream global
let videoStream

// Below is getting users own video permission and showing on own browser
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    videoStream = stream
    addVideoStream(myVideo, stream)

    // myPeer.on is calling the peer
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })

    socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close()
    })

})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

//====================================== Front-end styling logics =================================

const audio = document.getElementById('audio')
const audio_mute = document.getElementById('audio-mute')
const video = document.getElementById('video')
const video_mute = document.getElementById('video-mute')
const screen_share = document.getElementById('screen-share')
const record = document.getElementById('record')
const record_stop = document.getElementById('record-stop')
const leave_btn = document.getElementById('leave-btn')
const message_view_box = document.getElementById('message-view-box')

audio.addEventListener('click', function () {
    const track = videoStream.getAudioTracks()[0].enabled
    console.log(videoStream.getAudioTracks());
    if (track) {
        videoStream.getAudioTracks()[0].enabled = false
    }
    else {
        videoStream.getAudioTracks()[0].enabled = true
    }
    audio.style.display = 'none';
    audio_mute.style.display = 'inline-block';
})
audio_mute.addEventListener('click', function () {
    const track = videoStream.getAudioTracks()[0].enabled
    console.log(videoStream.getAudioTracks());
    if (track) {
        videoStream.getAudioTracks()[0].enabled = false
    }
    else {
        videoStream.getAudioTracks()[0].enabled = true
    }
    audio_mute.style.display = 'none';
    audio.style.display = 'inline-block';
})
video.addEventListener('click', function () {
    const track = videoStream.getVideoTracks()[0].enabled
    console.log(videoStream.getVideoTracks()[0]);
    if (track) {
        videoStream.getVideoTracks()[0].enabled = false
    }
    else {
        videoStream.getVideoTracks()[0].enabled = true
    }
    video.style.display = 'none';
    video_mute.style.display = 'inline-block';
})
video_mute.addEventListener('click', function () {
    const track = videoStream.getVideoTracks()[0].enabled
    console.log(videoStream.getVideoTracks()[0].enabled);
    if (track) {
        videoStream.getVideoTracks()[0].enabled = false
    }
    else {
        videoStream.getVideoTracks()[0].enabled = true
    }
    video_mute.style.display = 'none';
    video.style.display = 'inline-block';
})



// ============================= Chat box logics ===============================

let chat_box = document.getElementById('chat_box');
let chat_box_input = document.getElementById('chat_box_input');
let send_icon = document.getElementById('send-icon');

chat_box.addEventListener('submit', function (e) {
    e.preventDefault()
    // console.log(e.target.chat_box_input.value);
    if (chat_box_input.value) {
        socket.emit('chat message', chat_box_input.value);
        chat_box_input.value = '';
    }
    // e.target.chat_box_input.value = ''
})
socket.on('chat message', function (msg) {
    const item = document.createElement('li');
    item.textContent = msg;
    message_view_box.appendChild(item);
    message_view_box.scrollTop = message_view_box.scrollHeight - message_view_box.clientHeight;
});

// =============================================================================

//================================== Screen share logics =======================
const videoElem = document.getElementById('screen')
screen_share.addEventListener('click', async function () {
    startCapture();
})

// Options for getDisplayMedia()
const displayMediaOptions = {
    video: {
        cursor: "always"
    },
    audio: true
};

async function startCapture() {
    // const screen = document.createElement('video')
    try {
        videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        // videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        

        // l[0].srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
        // l[0].srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
        // l[0].addEventListener('loadedmetadata', () => {
        //     l[0].play()
        // })
        //   const videoStreamTrack = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        //   call.peerConnection.getSenders()[1].replaceTrack(videoStreamTrack)


        // dumpOptionsInfo();
    } catch (err) {
        console.error(`Error: ${err}`);
    }
}

function dumpOptionsInfo() {
    const videoTrack = videoElem.srcObject.getVideoTracks()[0];
}


//==============================================================================
//=========================== Screen record logic ===========================================
record.addEventListener('click', async function () {
    record.style.display = 'none';
    record_stop.style.display = 'inline-block';
    let stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    })

    //needed for better browser support
    const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
        ? "video/webm; codecs=vp9"
        : "video/webm"
    let mediaRecorder = new MediaRecorder(stream, {
        mimeType: mime
    })
    let chunks = []
    mediaRecorder.addEventListener('dataavailable', function (e) {
        chunks.push(e.data)
    })
    mediaRecorder.addEventListener('stop', function () {
        let blob = new Blob(chunks, {
            type: chunks[0].type
        })
        let url = URL.createObjectURL(blob)

        // let video = document.querySelector("video")
        // video.src = url

        let a = document.createElement('a')
        a.href = url
        a.download = 'video.webm'
        a.click()
    })

    //we have to start the recorder manually
    mediaRecorder.start()
})
record_stop.addEventListener('click', function () {
    record_stop.style.display = 'none';
    record.style.display = 'inline-block';
    mediaRecorder.stop();
})
//==============================================================================

