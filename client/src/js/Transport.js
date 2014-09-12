// WebSocket Ready State constants
// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#Ready_state_constants
var TRANSPORT_CONNECTING = 0;
var TRANSPORT_OPEN = 1;
var TRANSPORT_CLOSING = 2;
var TRANSPORT_CLOSED = 3;

function Transport(url, sessionId, userName) {
	this.url = url;
	this.sessionId = sessionId;
	this.userName = userName;

	//Connection retry parameters
	this.retryTimeInitial = 2;
	this.retryTime = this.retryTimeInitial;
	this.retryNext = function(retryPrev) {
		return retryPrev * 2;
	};
	this.retryWaited = 0;
}

Transport.prototype = {
	connect: function() {
		this.socket = new WebSocket(this.url + "/?join&" +
									"sessionId=" + this.sessionId + "&" +
									"name=" + this.userName);
		var _this = this;

		this.socket.onopen = function() {
			_this.retryTime = _this.retryTimeInitial;
			if (_this.handlers.opened) {
				_this.handlers.opened();
			}
		};

		this.socket.onmessage = function(e) {
			var msg;

			try {
				msg = JSON.parse(e.data);
			} catch(err) {
				console.log('Error: received non-JSON message from server. Ignoring.');
				return;
			}

			var fn = msg.fn;
			var args = msg.args;

			if (fn && args && _this.handlers[fn]) {
				_this.preProcess(args);
				_this.handlers[fn](args);
				_this.postProcess(args);
			}
		};

		this.socket.onclose = function() {
			console.log('Connection closed.');
			_this.retry();
			if (_this.handlers.closed) _this.handlers.closed();
		};
	},

	send: function(fn, args, requireResponse) {
		if (this.socket.readyState !== TRANSPORT_OPEN) {
			console.log('Socket not open, readyState = ' + this.socket.readyState);
			return;
		}
		this.socket.send(JSON.stringify({'fn': fn, 'args' : args}));
	},

	retry: function() {
		var retryFn = (function() {
			if (this.retryWaited < this.retryTime) {
				if (this.handlers.reconnecting) {
					this.handlers.reconnecting(this.retryTime - this.retryWaited);
				}
				this.retryWaited++;
				setTimeout(retryFn, 1000);
			} else {
				if (this.handlers.reconnecting) {
					this.handlers.reconnecting(0);
				}
				this.retryTime = this.retryNext(this.retryTime);
				this.retryWaited = 0;
				this.connect();
			}
		}).bind(this);

		retryFn();
	},

	preProcess: function(data) {
		// Empty implementation
	},

	postProcess: function(data) {
		// Empty implementation
	},

	handlers: {
		// Handlers for RPCs should be provided by the application
	}
};

module.exports = Transport;
