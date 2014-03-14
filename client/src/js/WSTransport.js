var uuid = require('node-uuid');

// Function for exponential back-off in case of disconnect
var retryNext = function(retryPrev) { return retryPrev * 2 };

function WSTransport(url, sessionId, userName) {
	this.url = url;
	this.sessionId = sessionId;
	this.userName = userName;

	//Connection retry parameters
	this.retryTimeInitial = 2;
	this.retryTime = this.retryTimeInitial;
	this.retryWaited = 0;

	//Pending requests
	this.pendingRequests = [];
}

WSTransport.prototype = {
	connect : function() {
		this.sockjs = new SockJS(this.url);
		_this = this;

		this.sockjs.onopen = function() {
			_this.retryTime = _this.retryTimeInitial;
			_this.send('join', {	'sessionId' : _this.sessionId,
									'name' : _this.userName} );
			if( _this.handlers.opened ) _this.handlers.opened();
		};

		this.sockjs.onmessage = function(e) {
			var msg;

			try {
				msg = JSON.parse(e.data);
			} catch(err) {
				console.log('Error: received non-JSON message from server. Ignoring.');
				return;
			}

			var fn = msg.fn;
			var args = msg.args;

			if(fn && args && _this.handlers[fn]) {
				_this.preProcess(args);
				_this.handlers[fn](args);
				_this.postProcess(args);
			}
		};

		this.sockjs.onclose = function() {
			console.log('Connection closed.');
			_this.retry();
			if( _this.handlers.closed ) _this.handlers.closed();
		};
	},

	send : function(fn, args, requireResponse) {
		this.sockjs.send( JSON.stringify( { 'fn': fn, 'args' : args } ) );
	},

	retry : function() {
		var retryFn = (function() {
			if(this.retryWaited < this.retryTime) {
				if(this.handlers.reconnecting) this.handlers.reconnecting(this.retryTime - this.retryWaited);
				this.retryWaited++;
				setTimeout(retryFn, 1000);
			} else {
				if(this.handlers.reconnecting) this.handlers.reconnecting(0);
				this.retryTime = retryNext( this.retryTime );
				this.retryWaited = 0;
				this.connect();
			}
		}).bind(this);

		retryFn();
	},

	preProcess : function(data) {
		// Empty implementation
	},

	postProcess : function(data) {
		// Empty implementation
	},

	// Handlers for RPCs should be provided by the application
	handlers : {}
};

module.exports = WSTransport;
