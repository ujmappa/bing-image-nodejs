#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config({path: './application.env'});

import {ImageCreator} from './sources/ImageCreator.js';
import {downloadFile} from './sources/downloadFile.js';

import fs from 'node:fs';
import path from 'node:path';

import * as uuid from 'uuid';


const creator = new ImageCreator(process.env.BING_IMAGE_COOKIE);
creator.on('error', (error) => {
	console.error(error.message);
});
creator.on('beforeSend', ({prompt}) => {
	console.log(`\nExecuting prompt: ${prompt}`);
});
creator.on('afterSend', ({url}) => {
	console.log(`Got response from url: ${url}`);
});
creator.on('redirect', ({url}) => {
	console.log(`Redirected to url: ${url}`);
});
creator.on('beforePolls', ({url}) => {
	console.log(`Polling results url: ${url}`);
});

(async () => {
	try { fs.mkdirSync('./images', 0o744); } catch(ex) {}
	const content = fs.readFileSync('./prompts.txt', {encoding: 'utf-8'});
	const prompts = content.split('\n');	
	for (const prompt of prompts) {
		try {
			const links = await creator.generateImages(prompt.trim());
			for (const link of links) {
				const uuidv4 = uuid.v4(); // Replaced crypto.randomUUID() to work with older versions of NodeJS as well
				const filename = `${prompt.replace(/[^a-z0-9]/gi, '_').substring(0, 192-5-uuidv4.length)}_${uuidv4}.jpg`;
				await downloadFile(link, path.join(path.normalize(process.env.DESTINATION_DIR || './images'), filename));
			}
		} catch(error) {
			console.error(error.message);
		}
	}
})();