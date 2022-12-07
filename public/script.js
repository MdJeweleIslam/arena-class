const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined,{
    host: '/',
    port:'8000'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    addVideoStream(myVideo, stream)

    myPeer.on('call',call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId =>{
        connectToNewUser(userId, stream)
    })

    socket.on('user-disconnected', userId =>{
       if(peers[userId]) peers[userId].close()
    })

})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream){
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

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata',() => {
        video.play()
    })
    videoGrid.append(video)
}

//====================================== Front-end styling logics =================================

const audio = document.getElementById('audio')
const audio_mute = document.getElementById('audio-mute')
const video = document.getElementById('video')
const video_mute = document.getElementById('video-mute')
const record = document.getElementById('record')
const record_stop = document.getElementById('record-stop')
const leave_btn = document.getElementById('leave-btn')
const message_view_box = document.getElementById('message-view-box')

audio.addEventListener('click', function(){
    audio.style.display = 'none';
    audio_mute.style.display = 'inline-block';
})
audio_mute.addEventListener('click', function(){
    audio_mute.style.display = 'none';
    audio.style.display = 'inline-block';
})
video.addEventListener('click', function(){
    video.style.display = 'none';
    video_mute.style.display = 'inline-block';
})
video_mute.addEventListener('click', function(){
    video_mute.style.display = 'none';
    video.style.display = 'inline-block';
})
record.addEventListener('click', function(){
    record.style.display = 'none';
    record_stop.style.display = 'inline-block';
})
record_stop.addEventListener('click', function(){
    record_stop.style.display = 'none';
    record.style.display = 'inline-block';
})
leave_btn.addEventListener('click',function(){
    alert("Do you really want to leave the room?")
})



// ============================= Chat box logics ===============================

let chat_box = document.getElementById('chat_box');
let chat_box_input = document.getElementById('chat_box_input');
let send_icon = document.getElementById('send-icon');

chat_box.addEventListener('submit',function(e){
    e.preventDefault()
    console.log(e.target.chat_box_input.value);
    if (chat_box_input.value) {
        socket.emit('chat message', chat_box_input.value);
        chat_box_input.value = '';
      }
    // e.target.chat_box_input.value = ''
})
socket.on('chat message', function(msg) {
    const item = document.createElement('li');
    item.textContent = msg;
    message_view_box.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

// =============================================================================
