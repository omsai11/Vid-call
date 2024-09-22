const socket = io('/');  // Connect to Socket.io
const videoGrid = document.getElementById('video-grid');

// PeerJS connection setup: dynamically select port based on environment (production or local)
const myPeer = new Peer(undefined, {
  host: '/',
  port: location.hostname === 'localhost' ? '3001' : '',
  path: '/peerjs',
  secure: location.protocol === 'https:',
});

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

// Get video and audio from user's device
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  // Show user's own video stream
  addVideoStream(myVideo, stream);

  // Answer calls when others connect
  myPeer.on('call', call => {
    call.answer(stream);  // Answer the call with our video stream
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);  // Display remote user's video
    });
  });

  // When a new user connects, start the call
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  });
});

// Remove video when a user disconnects
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
});

// When PeerJS connection is open, emit 'join-room' event with roomId and peerId
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

// Function to handle new user connections
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);  // Call the new user
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);  // Display their video stream
  });
  call.on('close', () => {
    video.remove();  // Remove video element when call is closed
  });

  peers[userId] = call;  // Store the call in peers object
}

// Function to add video stream to the DOM
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}
