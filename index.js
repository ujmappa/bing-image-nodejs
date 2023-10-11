#!/usr/bin/env node

import {generateImagesLinks} from 'bimg';
import {downloadFile} from './download.js';

import fs from 'node:fs';
import path from 'node:path';

import * as uuid from 'uuid';


(async () => {
	const content = fs.readFileSync('./prompts.txt', {encoding: 'utf-8'});
	const prompts = content.split('\n');
	for (const prompt of prompts) {
		console.log(`\nExecuting prompt: ${prompt}`);
		try {
			const links = await generateImagesLinks(prompt.trim());
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