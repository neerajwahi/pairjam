
var webrtc = new SimpleWebRTC({
	// the id/element dom element that will hold "our" video
	localVideoEl: 'localVideo',
	// the id/element dom element that will hold remote videos
	remoteVideosEl: 'mainVideo',
	// immediately ask for camera access
	autoRequestMedia: false
});

var elMainVid = document.getElementById('mainVideo');
elMainVid.addEventListener('click', function() {
	webrtc.startLocalVideo();
	elMainVid.innerHTML = 'Please allow video access';
});

// we have to wait until it's ready
webrtc.on('readyToCall', function () {
	// TODO: Hack-y, fix this stuff
	// you can name it anything
	webrtc.joinRoom('pairjam');
	elMainVid.innerHTML = '';
	elMainVid.classList.remove('notInSession');
	elMainVid.classList.add('inSession');
	document.getElementById('treePane').style.bottom = '201px';
});

webrtc.on('connectionReady', function() {
});