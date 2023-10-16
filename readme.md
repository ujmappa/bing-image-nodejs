# Bing ImageCreator generate script
Usage of reverse engineered API written in NodeJS. See the original [Python module](https://github.com/acheong08/BingImageCreator) I got the idea from.

- Install NodeJS modules with `npm install`
- Add authentication token to application.env
- Enter your prompts in prompts.txt divided by new line. 

If you have enjoyed my work and wish to support what I do, please consider buying me a coffee! I would appreciate it very much and it helps me to continue to do what I do. Thank you! 

[https://ko-fi.com/ujmappa](https://ko-fi.com/ujmappa)


## Getting authentication
### Chromium based browsers (Chrome, Edge, Opera, Brave)
- Go to https://bing.com/images/create and log in
- F12 to open developer console
- In the console, type `await cookieStore.get('_U')` and press enter
- Copy the content of the value field to userid.txt

### Firefox
- Go to https://bing.com/images/create and log in.
- F12 to open developer tools
- Navigate to the storage tab
- Expand the cookies tab
- Click on the `https://bing.com` cookie
- Copy the value from the `_U` to userid.txt
