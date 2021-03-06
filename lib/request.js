/**
 * Clout Auth Library
 */
var _ = require('lodash'),
	request = require('request'),
	debug = require('debug')('clout-auth:request');

module.exports = function requestExports(auth) {
	var config = auth.config;
	function createRequest(type, opts, cb) {
		var pth = config.paths[type],
			url = config.baseUrl + pth[1];
		debug('createRequest:%s:%s', type, JSON.stringify(opts));
		debug('url: %s', url);
		var req = {
			url: url,
			method: pth[0],
			json: true,
			headers: {
				'user-agent': 'clout-auth-sdk'
			}
		};
		opts.header && _.merge(req.headers, opts.header);

		if (opts.body) {
			req.body = opts.body;
		}

		request(req, function (error, response, body) {
			// Implement Retries
			debug('request:%s:%s', type, JSON.stringify(opts));
			debug('error: %s', error);
			debug('response: %s', JSON.stringify(response));
			debug('body: %s', JSON.stringify(body));
			if (error || !body || !!body.error) {
				return cb(body && body.error && body.error.message || 'Something went wrong :(', body);
			}
			var token = body.access && body.access.token;
			cb(null, body.access, token);
		});
	}
	auth.request = {
		login: function (opts, cb) {
			createRequest('login', { body: opts }, cb);
		},
		whoami: function (token, cb) {
			var opts = { auth: { tenantName: '', token: '' } };
			if (token && token.hasOwnProperty('tenantName')) {
				opts.auth = token;
			} else {
				opts.auth.token = token;
			}
			createRequest('whoami', { body: opts }, cb);
		}
	}
};
