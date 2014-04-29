// WebRTC wrappers
var getUserMedia = require('getusermedia');
var attachMediaStream = require('attachmediastream');
var webrtcSupport = require('webrtcsupport');
var PeerConnection = require('rtcpeerconnection');

function AV(transport, remoteVideo, localVideo) {
	this.stream = null;
	this.transport = transport;
	this.peerConfig = {
		iceServers: [{"url": "stun:stun.l.google.com:19302"}]
	};
	this.peerConstraints = {};
	this.remoteVideo = remoteVideo;
	this.localVideo = localVideo;

	this.pcIn = null;
	this.pcOut = {};
}

AV.prototype = {
	onRTCMessage: function(data) {
		var self = this;

		if(data.type === 'offer') {
			if(!self.pcIn) return;

			self.pcIn.handleOffer(data.offer, function(err) {
				console.log('Handle offer');
				if(err) return;

				self.pcIn.answer(function(err, answer) {
					if(!err) {
						var msg = {
							to: data.from,
							type: 'answer',
							videoIn: true,
							answer: answer
						};
						self.transport.send('rtcMessage', msg);
					}
				});
			});
		} else if(data.type === 'answer') {
			if(!this.pcOut[data.from]) return;
			this.pcOut[data.from].handleAnswer(data.answer);
		} else if(data.type === 'ice') {
			if(!data.videoIn) {
				if(!self.pcIn) return;
				self.pcIn.processIce(data.candidate);
			} else {
				if(!this.pcOut[data.from]) return;
				this.pcOut[data.from].processIce(data.candidate);
			}
		}
	},

	share: function(cb) {
		var self = this;
		getUserMedia(function (err, stream) {
			if (err) {
				var errStr = 'Your browser does not support video chat (get Chrome)';
				if(err.name === 'PermissionDeniedError') {
					errStr = 'You browser is blocking access to the camera and microphone (did you deny access earlier?)';
				}
				cb(errStr);
			} else {
				self.stream = stream;
				attachMediaStream(self.stream, document.getElementById(self.localVideo));
				self.transport.send('shareVideo', {});
				cb(null);
			}
		});
	},

	unshare: function() {
		if(this.stream) {
			this.stream.stop();
			this.transport.send('unshareVideo', {});
			self.stream = null;
		}
	},

	subscribe: function(clientId, cb) {
		var self = this;

		var pc = new PeerConnection(this.peerConfig);
		self.pcIn = pc;

		var msg = {
			to: clientId,
			type: 'subscribe'
		};
		this.transport.send('rtcMessage', msg);

		pc.on('ice', function(candidate) {
			console.log('ice candidate');
			var msg = {
				to: clientId,
				type: 'ice',
				videoIn: true,
				candidate: candidate
			};
			self.transport.send('rtcMessage', msg);
		});
		// Remote stream added
		pc.on('addStream', function(e) {
			console.log('stream added');
			var videoEl = attachMediaStream(e.stream, document.getElementById(self.remoteVideo));
			cb(null);
		});
		// Remote stream removed
		pc.on('removeStream', function(stream) {
			console.log('stream removed');
		});
		pc.on('error', function(err) {
			cb(err);
		});
	},

	unsubscribe: function(clientId, cb) {
		if(self.pcIn) {
			self.pcIn.close();
			self.pcIn = null;
		}
		var msg = {
			to: clientId,
			type: 'unsubscribe'
		};
		this.transport.send('rtcMessage', msg);
		cb(null);
	},

	serve: function(clientId) {
		var self = this;

		var pc = new PeerConnection(this.peerConfig);
		self.pcOut[clientId] = pc;
		pc.addStream(self.stream);
		pc.offer(function(err, offer) {
			var msg = {
				to: clientId,
				type: 'offer',
				offer: offer
			};
			self.transport.send('rtcMessage', msg);
		});

		pc.on('ice', function(candidate) {
			console.log('ice candidate');
			var msg = {
				to: clientId,
				type: 'ice',
				videoIn: false,
				candidate: candidate
			};
			self.transport.send('rtcMessage', msg);
		});
	},

	unserve: function(clientId) {
		if(this.pcOut[clientId]) {
			this.pcOut[clientId].close();
			delete this.pcOut[clientId];
		}
	}
};

module.exports = AV;
