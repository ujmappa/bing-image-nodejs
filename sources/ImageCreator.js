
import EventEmitter from 'node:events';
import {performance} from 'perf_hooks';

import axios from 'axios';

class ImageCreator extends EventEmitter {

	static BAD_IMAGES = [
		'https://r.bing.com/rp/in-2zU3AJUdkgFe7ZKv19yPBHVs.png',
		'https://r.bing.com/rp/TX9QuO3WzcCJz1uaaSwQAz39Kb0.jpg',
	];

	constructor(authCookie) {
		super();
		this.authCookie = authCookie;
		console.log(authCookie)
	}

	createSession() {
		const cookie = this.authCookie;
		const session = axios.create({
			headers: {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
				"accept-encoding": "gzip, deflate, br, zsdch",
				"accept-language": "en-US,en;q=0.9,hu;q=0.8",
				"cache-control": "no-cache",
				"pragma": "no-cache",
				"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.54",
				"cookie": `_U=${cookie}`,
				"sec-ch-ua": `"Microsoft Edge";v="111", "Not(A:Brand";v="8", "Chromium";v="111"`,
				"sec-ch-ua-mobile": "?0",
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "same-origin",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1",
				"x-forwarded-for": `13.${124 + Math.floor(Math.random(4))}.${Math.floor(Math.random(256))}.${Math.floor(Math.random(256))}`
			}
		});
		return session;
	}

	async generateImages(prompt) {
		const session = this.createSession();

		const query = encodeURIComponent(prompt);
		const url = `https://www.bing.com/images/create?q=${query}&rt=3&FORM=GENCRE`; 
		
		this.emit('beforeSend', {prompt, url});
		const response = await session.get(url, {
			maxRedirects: 0,

			validateStatus: function (status) {
				return status === 200 || status === 302;
		  	},
		  	timeout: 200000,
		});
		this.emit('afterSend', {prompt, url, response})
	  
		let redirectUrl;
		if (response.status === 302) {
			redirectUrl = `https://www.bing.com/${response.headers.get('location').replace('&nfy=1', '')}`;
		} else if (response.status === 200) {
			redirectUrl = `${url}&id=${response.headers.get('x-eventid')}`; // we did not get a redirect
			console.warn('Redirect failed, we are trying to get results based on event id...')
		} else {
			throw new Error(`Status is ${response.status} instead of 302 or 200`);
		}
		this.emit('redirect', {prompt, url: redirectUrl});

		const redirect = await session.get(redirectUrl);
		const requestId = response.headers.get('x-eventid');
		const pollingUrl = `https://www.bing.com/images/create/async/results/${requestId}?q=${query}`;

		this.emit('beforePolls', {prompt, requestId, url: pollingUrl});

		const startTime = performance.now();
		
		let images;
		while (!images || (images.data || '') === '') {
			const currentTime = performance.now();
			if (currentTime - startTime > 300000) {
				throw new Error('Timeout error');
			}

			this.emit('polling', {prompt, requestId, url: pollingUrl, startTime, currentTime});
			
			images = await session.get(pollingUrl);
			if (images.status !== 200) {
				throw new Error("Could not get results");
			}
			await new Promise((r) => setTimeout(r, 1000));
		}
	  
		if (images.data.errorMessage === 'Pending') {
			throw new Error('Some error occured. This might be because of wrong authentiaction value, Bing waiting time, ');
		} else if (images.data.errorMessage) {
			throw new Error(`Bing returned an error: ${images.data.errorMessage}`);
		}

		const sources = images.data
			.match(/src="([^"]+)"/g) // use regex to search for src=""
			.map((src) => src.slice(5, -1))
			.map((src) => src.split('?w=').shift()); // remove size limit
		const links = Array.from(new Set(sources)); // remove duplicates
		
		if (links.length === 0) {
			throw new Error('No images');
		}

		for (const link of links) {
			if (ImageCreator.BAD_IMAGES.includes(link)) {
				throw new Error('Bad images');
			}
		}
	  
		return links;
	}
}

export {ImageCreator};