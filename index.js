#!/usr/bin/env node

import {generateImagesLinks} from 'bimg';
import {downloadFile} from './download.js';

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

(async () => {
	const content = fs.readFileSync('./prompts.txt', {encoding: 'utf-8'});
	const prompts = content.split('\n');
	for (const prompt of prompts) {
		const links = await generateImagesLinks(prompt.trim());
		for (const link of links) {
			const uuid = crypto.randomUUID();
			const filename = prompt.replace(/[^a-z0-9]/gi, '_').substring(0, 192-5-uuid.length) + '_' + uuid + '.jpg';
    		await downloadFile(link, path.join(path.normalize(process.env.DESTINATION_DIR || './images'), filename));
		}
	}
})();