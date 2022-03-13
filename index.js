const http = require("http");
const url = require("url");
const StringDecoder = require('string_decoder').StringDecoder;
const server = http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);
	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');
	const method = req.method.toLowerCase();
	const query = parsedUrl.query;
	const headers = req.headers;
	const decoder = new StringDecoder('utf-8');
	let buffer = '';
	req.on('data', (data) => {
		buffer += decoder.write(data);
	});
	req.on('end', () => {
		buffer += decoder.end();
		const chosenHandler = typeof router[trimmedPath] !== 'undefined' ? router[trimmedPath] : handlers.notFound;
		const data = {
			trimmedPath,
			query,
			method,
			headers,
			data: JSON.parse(buffer)
		};
		chosenHandler(data, (statusCode, payload) => {
			statusCode = typeof statusCode === 'number'? statusCode: 200;
			payload = typeof payload === 'object'? payload: {};
			const payloadString = JSON.stringify(payload);
			res.writeHead(statusCode);
			res.end(payloadString);
			console.log('response: ', statusCode, payload);
		});
	});
/*	console.log('path: ' + trimmedPath + ' method: ' + method + ' query parameters', query);
	console.log('headers: ', headers);*/
});

server.listen(3000, () => {
	console.log("listen server on port 3000");
});

const handlers = {};

handlers.sample = (data, callback) => {
	callback(405, { 'name': 'data', data: data });
}

handlers.notFound = (data, callback) => {
	callback(404);
}

const router = {
	'sample' : handlers.sample
};