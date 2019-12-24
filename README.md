# INS Website
A simple website using steam server query and nodejs to check insurgency and sandstorm server status. The website also provide APIs for user to use.<br>
Original website link:<br>
http://insurgency.pro/<br><br>

This website require nodejs to run.<br>
Get nodejs here https://nodejs.org/en/

### Dependencies
```
- dot-emc
- express
- gamedig
- path
- serve-index
- vmsq
```

### Installation
1) Download and unpack the files<br>
2) Locate `/server/main.js` file and then edit the server port and your public IP to bind to at the bottom of the file. If you only have 1 public IP address then you can remove the IP parameter and just keep the port.
3) Use cmd or terminal to locate the folder then use `npm install` to install the dependencies<br>
4) Once you finish install the dependencies just type `npm start` to start the web server.<br><br>

If you want to change the page or edit anything, it will be locate in the `main.js` file. If you want to add some new page and other stuff, then you should understand how [nodejs express](https://expressjs.com/) works.<br><br>

You can also use this webserver as FastDL for Insurgency.
