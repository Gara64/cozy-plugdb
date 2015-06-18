var request = require('request-json');

module.exports = Sharing = {
	couchClient: initClient("http://localhost:5985"),
	targetURL: "", 
	couchTarget: ""
};


function initClient(couchUrl) {
	this.couchClient = request.newClient(couchUrl);
}