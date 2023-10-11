
import axios from 'axios';
import stream from 'stream';
import {promisify} from 'util';

import fs from 'fs';


const finished = promisify(stream.finished);

const downloadFile = (url, path) => {
    const writer = fs.createWriteStream(path);
    return axios({
        method: 'get',
        url: url,
        responseType: 'stream',
    }).then(response => {
        response.data.pipe(writer);
        return finished(writer); 
    });
}

export {downloadFile};