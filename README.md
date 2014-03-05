Real-time web-based collaborative coding platform

#Github integration#

In order to integrate the server with Github, an application API public key
and secret are needed. These should be placed in a file called gitapiSecret in
the /server directory, with a JSON object of the following form:

module.exports = {
	'client_id' : 'YOUR CLIENT ID',
	'client_secret' : 'YOUR CLIENT SECRET'
};

