Real-time web-based collaborative coding platform

#Design overview

Pairjam consists of two isolated components: the client and server.

#GitHub integration

In order to integrate the server with GitHub, an application API public key
and secret are needed. These should be placed in a file called github_api_secret in
the /server directory, with a JSON object of the following form:

module.exports = {
	'client_id' : 'YOUR CLIENT ID',
	'client_secret' : 'YOUR CLIENT SECRET'
};

If the server does not find this file upon loading, rate requests will be limited to
the unauthenticated limit.