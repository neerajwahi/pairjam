// WebRTC wrappers
var getUserMedia = require('getusermedia');
var attachMediaStream = require('attachmediastream');
var webrtcSupport = require('webrtcsupport');
var PeerConnection = require('rtcpeerconnection');

function AV(transport, remoteVideo) {
	this.stream = null;
	this.transport = transport;
	this.peerConfig = {
		iceServers: [{"url": "stun:stun.l.google.com:19302"}]
	};
	this.peerConstraints = {};
	this.remoteVideo = remoteVideo;

	this.peerConnection = new PeerConnection(this.peerConfig);

	this.initPC();
}

AV.prototype = {
	initPC: function() {
		var self = this;
		self.peerConnection.on('*', function(e) {
			console.log(e);
		});
		self.peerConnection.on('ice', function(candidate) {
			console.log('ice candidate');
			var msg = {
				type: 'ice',
				candidate: candidate
			};
			self.transport.send('rtcMessage', msg);
		});
		// Remote stream added
		self.peerConnection.on('addStream', function(e) {
			console.log('stream added');
			var videoEl = attachMediaStream(e.stream, document.getElementById(self.remoteVideo));
		});
		// Remote stream removed
		self.peerConnection.on('removeStream', function(stream) {

		});
	},

	onRTCMessage: function(data) {
		if(!data.type) return;
		var self = this;
		console.log(data.type);

		if(data.type === 'offer') {
			self.peerConnection.handleOffer(data.offer, function(err) {
				if(err) return;

				self.peerConnection.answer(function(err, answer) {
					if(!err) {
						var msg = {
							type: 'answer',
							answer: answer
						};
						self.transport.send('rtcMessage', msg);
					}
				});
			});
		} else if(data.type === 'answer') {
			self.peerConnection.handleAnswer(data.answer);
		} else if(data.type === 'ice') {
			self.peerConnection.processIce(data.candidate);
		}
	},

	enable: function(errcb, successcb) {
		var self = this;
		getUserMedia(function (err, stream) {
			if (err) {
				console.log('failed');
				console.log(err);
				var errStr = 'Your browser does not support video chat (get Chrome)';
				if(err.name === 'PermissionDeniedError') {
					errStr = 'You browser is blocking access to the camera and microphone (did you deny access earlier?)';
				}
				errcb(errStr);
			} else {
				console.log('got a stream', stream);
				self.peerConnection.addStream(stream);
				self.peerConnection.offer(function(err, offer) {
					console.log('created offer');
					console.log(offer);
					var args = {
						type: 'offer',
						offer: offer
					};
					self.transport.send('rtcMessage', args);
				});
				self.stream = stream;
				//var videoEl = attachMediaStream(stream, document.getElementById(self.remoteVideo));
				successcb();
			}
		});
	},

	disable: function() {
		if(this.stream) {
			this.stream.stop();
		}
	}
};

module.exports = AV;
