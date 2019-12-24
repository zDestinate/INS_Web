var Gamedig = require('gamedig');
var express = require('express'),
	app = express(),
	serv = require('http').Server(app);
var path = require('path');
var serveIndex = require('serve-index');
var vmsq = require('vmsq');
var https = require('https');
var request = require('request');

//Server start
console.log("[SERVER] Server started");

//Set server default path
app.use(express.static( __dirname + '/../client'));

app.set("views", path.join(__dirname, '../views'));
app.engine("html", require("dot-emc").init(
    {
        app: app,
        fileExtension:"html"
    }
).__express);
app.set("view engine", "html");

//Get IP address and check if its IPv4 or IPv6
function GetIPAddress(req)
{
	var ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	
	if (ip.substr(0, 7) == "::ffff:") {
		ip = ip.substr(7);
	}
	return ip;
}

//Homepage
app.get("/", function(req, res) {
	res.render("index");
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
});

//Ins server
app.get("/ins", function(req, res) {
	Gamedig.query({
		type: 'insurgency',
		host: '104.243.35.239',
		port: 27015
	}).then((state) => {
		var temp_Data = state;
		
		temp_Data = JSON.stringify(temp_Data);
		temp_Data = JSON.parse(temp_Data);
		
		var battleye, VACsecure, friendlyFire, passwordProtected, strCustomTheater;
		
		if(temp_Data.password == true)
		{
			passwordProtected = "Enabled";
		}
		else
		{
			passwordProtected = "Disabled";
		}
		
		if(temp_Data.raw.rules.mp_theater_override !== "")
		{
			strCustomTheater = temp_Data.raw.rules.mp_theater_override;
		}
		else
		{
			strCustomTheater = "none";
		}
		
		if(temp_Data.raw.rules.mp_friendlyfire != 0)
		{
			friendlyFire = "Enabled";
		}
		else
		{
			friendlyFire = "Disabled";
		}
		
		if(temp_Data.raw.rules.sv_battleye != 0)
		{
			battleye = "Enabled";
		}
		else
		{
			battleye = "Disabled";
		}
		
		if(temp_Data.raw.secure != 0)
		{
			VACsecure = "Enabled";
		}
		else
		{
			VACsecure = "Disabled";
		}
		
		var jsonPlayerName = [];
		for(var i = 0; i < temp_Data.players.length; i++)
		{
			jsonPlayerName[i] = temp_Data.players[i].name;
		}
		
		res.render("server", {"GameFound": "true", "hostname": temp_Data.name, "servertype": "Insurgency", "ip": temp_Data.query.address, "port": temp_Data.raw.port, "customtheater": strCustomTheater, "map": temp_Data.map, "passwordprotected": passwordProtected, "friendlyfire": friendlyFire, "battleye": battleye, "vacsecure": VACsecure, "totalplayers": temp_Data.raw.numplayers, "maxplayers": temp_Data.maxplayers, "playerlist": jsonPlayerName, "connectto": "steam://connect/104.243.35.239:27015"});
	}).catch((error) => {
		res.render("server", {"GameFound": "our_false"});
	});
	
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
});

app.get("/sandstorm", function(req, res) {
	Gamedig.query({
		type: 'insurgency',
		host: '104.243.35.239',
		port: 27131
	}).then((state) => {
		var temp_Data = state;
		
		temp_Data = JSON.stringify(temp_Data);
		temp_Data = JSON.parse(temp_Data);
		
		var VACsecure, passwordProtected;
			
		if(temp_Data.password == true)
		{
			passwordProtected = "Enabled";
		}
		else
		{
			passwordProtected = "Disabled";
		}
		
		if(temp_Data.raw.secure != 0)
		{
			VACsecure = "Enabled";
		}
		else
		{
			VACsecure = "Disabled";
		}
		
		var jsonPlayerName = [];
		for(var i = 0; i < temp_Data.players.length; i++)
		{
			jsonPlayerName[i] = temp_Data.players[i].name;
		}
		
		res.render("serversandstorm", {"GameFound": "true", "hostname": temp_Data.name, "servertype": "Sandstorm", "ip": temp_Data.query.address, "port": temp_Data.raw.port, "map": temp_Data.map, "gamemode": temp_Data.raw.rules.GameMode_s, "passwordprotected": passwordProtected, "vacsecure": VACsecure, "totalplayers": temp_Data.raw.numplayers, "maxplayers": temp_Data.raw.rules.PlrM_i, "playerlist": jsonPlayerName, "connectto": "steam://connect/104.243.35.239:27131"});
	}).catch((error) => {
		res.render("serversandstorm", {"GameFound": "our_false"});
	});
	
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
});

app.get("/sandstorm/player/inventory", function(req, res) {
	res.setHeader('content-type', 'text/plain');
	res.send("Error! Please input SteamID64\nExample: insurgency.pro/sandstorm/player/inventory/76561198010486399");
	
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
});

app.get("/sandstorm/player/inventory/:id", function(req, res) {
	var hostinforaw = req.params.id;
	res.setHeader('content-type', 'text/plain');
	
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
	
	if(hostinforaw.length > 0)
	{
		const options =
		{
			url: `https://sandstorm-inventory-api.newworldinteractive.com/player/steam-inventory/`,
			headers:
			{
				'PlayerId': hostinforaw
			}
		};
		
		request(options, function(error, response, body) {
			if(response.statusCode == 200)
			{
				var strContent = JSON.stringify(JSON.parse(body), null, 2);
				if(strContent != '[]')
				{
					res.send(strContent);
				}
				else
				{
					res.send("Error! This user does not have sandstorm.\nAre you sure you put the right SteamID64?");
				}
			}
			else
			{
				res.send("Error! This user does not have sandstorm.\nAre you sure you put the right SteamID64?");
			}
			return;
		});
	}
	else
	{
		res.send("Error! Please input your steam ID\nExample: insurgency.pro/sandstorm/player/inventory/76561198010486399");
		return;
	}
});

app.get("/sandstorm/player", function(req, res) {
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
	
	res.setHeader('content-type', 'text/plain');
	res.send("Error! Please input SteamID64\nExample: insurgency.pro/sandstorm/player/76561198010486399");
});

app.get("/sandstorm/player/:id", function(req, res) {
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
	
	var hostinforaw = req.params.id;
	res.setHeader('content-type', 'text/plain');
	if(hostinforaw.length > 0)
	{
		request(`https://sandstorm-statistics-player-api.newworldinteractive.com/api/player/stats/?UniqueId=${hostinforaw}`, function(error, response, body) {
			if(response.statusCode == 200)
			{
				var strContent = JSON.stringify(JSON.parse(body), null, 2);
				res.send(strContent);
			}
			else
			{
				res.send("Error! This user does not have sandstorm.\nAre you sure you put the right SteamID64?");
			}
			return;
		});
	}
	else
	{
		res.send("Error! Please input your steam ID\nExample: insurgency.pro/sandstorm/player/76561198010486399");
		return;
	}
});

app.get("/donate", function(req, res) {
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
	res.redirect("https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XFM67QAZ9YJ68");
});

app.get("/server", function(req, res) {
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
	res.redirect("/ins");
});

app.get("/discord", function(req, res) {
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
	res.redirect("https://discord.gg/H4JBPk2");
});

app.get("/server/:ip", function(req, res) {
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
	
	var hostinforaw =  req.params.ip;
	var hostinfo, portinfo, connectto;
	var tempinfo;
	
	if(hostinforaw.includes(":"))
	{
		tempinfo = hostinforaw.split(":");
	}
	
	//Master server
	var MasterServerIP;
	if(tempinfo)
	{
		MasterServerIP = tempinfo[0];
	}
	else
	{
		MasterServerIP = hostinforaw;
	}
	
	const MasterServerList = [];
	const MasterServer = vmsq('hl2master.steampowered.com:27011', vmsq.ALL, {
		gameaddr: MasterServerIP
	});
	
	MasterServer.on('error', (err) => {
		console.error(err);
	});
	
	MasterServer.on('data', (ip) => {
		MasterServerList.push(ip);
	});
	
	MasterServer.on('end', () => {
		if(tempinfo && (MasterServerList.length > 0))
		{
			hostinfo = tempinfo[0];
			portinfo = parseInt(tempinfo[1]);
			connectto = hostinfo + ":" + portinfo;
			
			for(var i = 0; i < MasterServerList.length; i++)
			{
				MasterServerSplit = MasterServerList[i].split(":");
				MasterServerIP = MasterServerSplit[0];
				MasterServerPort = parseInt(MasterServerSplit[1]);
				
				Gamedig.query({
					type: 'insurgency',
					host: MasterServerIP,
					port: MasterServerPort
				}).then((state) => {
					var temp_Data = state;
					
					temp_Data = JSON.stringify(temp_Data);
					temp_Data = JSON.parse(temp_Data);
					
					if((temp_Data.raw.folder.toLowerCase() === "insurgency") && (temp_Data.raw.port == portinfo))
					{
						var battleye, VACsecure, friendlyFire, passwordProtected, strCustomTheater;
						var strServerType = "Insurgency";
					
						if(temp_Data.raw.rules.mp_theater_override !== "")
						{
							strCustomTheater = temp_Data.raw.rules.mp_theater_override;
						}
						else
						{
							strCustomTheater = "none";
						}
						
						if(temp_Data.password == true)
						{
							passwordProtected = "Enabled";
						}
						else
						{
							passwordProtected = "Disabled";
						}
						
						if(temp_Data.raw.rules.mp_friendlyfire != 0)
						{
							friendlyFire = "Enabled";
						}
						else
						{
							friendlyFire = "Disabled";
						}
						
						if(temp_Data.raw.rules.sv_battleye != 0)
						{
							battleye = "Enabled";
						}
						else
						{
							battleye = "Disabled";
						}
						
						if(temp_Data.raw.secure != 0)
						{
							VACsecure = "Enabled";
						}
						else
						{
							VACsecure = "Disabled";
						}
						
						var jsonPlayerName = [];
						for(var i = 0; i < temp_Data.players.length; i++)
						{
							jsonPlayerName[i] = temp_Data.players[i].name;
						}
						
						res.render("server", {"GameFound": "true", "hostname": temp_Data.name, "servertype": strServerType, "ip": temp_Data.query.address, "port": temp_Data.raw.port, "customtheater": strCustomTheater, "map": temp_Data.map, "passwordprotected": passwordProtected, "friendlyfire": friendlyFire, "battleye": battleye, "vacsecure": VACsecure, "totalplayers": temp_Data.raw.numplayers, "maxplayers": temp_Data.maxplayers, "playerlist": jsonPlayerName, "connectto": "steam://connect/" + connectto});
						
						return;
					}
					else if((temp_Data.raw.folder.toLowerCase() === "sandstorm") && (temp_Data.raw.port == portinfo))
					{
						var VACsecure, passwordProtected;
						var strServerType = "Sandstorm";
						
						if(temp_Data.password == true)
						{
							passwordProtected = "Enabled";
						}
						else
						{
							passwordProtected = "Disabled";
						}
						
						if(temp_Data.raw.secure != 0)
						{
							VACsecure = "Enabled";
						}
						else
						{
							VACsecure = "Disabled";
						}
						
						var jsonPlayerName = [];
						for(var i = 0; i < temp_Data.players.length; i++)
						{
							jsonPlayerName[i] = temp_Data.players[i].name;
						}
						
						res.render("serversandstorm", {"GameFound": "true", "hostname": temp_Data.name, "servertype": strServerType, "ip": temp_Data.query.address, "port": temp_Data.raw.port, "map": temp_Data.map, "gamemode": temp_Data.raw.rules.GameMode_s, "passwordprotected": passwordProtected, "vacsecure": VACsecure, "totalplayers": temp_Data.raw.numplayers, "maxplayers": temp_Data.raw.rules.PlrM_i, "playerlist": jsonPlayerName, "connectto": "steam://connect/" + connectto});
						
						return;
					}
				})
				.catch((error) =>{
					//continue
				});
			}
			
			//Timer to check if it send
			setTimeout(function(){
				if(!res.headersSent)
				{
					res.render("server");
					return;
				}
			}, 1000); 
		}
		else if(MasterServerList.length > 0)
		{
			hostinfo = hostinforaw;
			
			for(var i = 0; i < MasterServerList.length; i++)
			{
				MasterServerSplit = MasterServerList[i].split(":");
				MasterServerIP = MasterServerSplit[0];
				MasterServerPort = parseInt(MasterServerSplit[1]);

				Gamedig.query({
					type: 'insurgency',
					host: MasterServerIP,
					port: MasterServerPort
				}).then((state) => {
					var temp_Data = state;
					
					temp_Data = JSON.stringify(temp_Data);
					temp_Data = JSON.parse(temp_Data);
					
					if(temp_Data.raw.folder.toLowerCase() === "insurgency")
					{
						var battleye, VACsecure, friendlyFire, passwordProtected, strCustomTheater;
						var strServerType = "Insurgency";
					
						if(temp_Data.raw.rules.mp_theater_override !== "")
						{
							strCustomTheater = temp_Data.raw.rules.mp_theater_override;
						}
						else
						{
							strCustomTheater = "none";
						}
						
						if(temp_Data.password == true)
						{
							passwordProtected = "Enabled";
						}
						else
						{
							passwordProtected = "Disabled";
						}
						
						if(temp_Data.raw.rules.mp_friendlyfire != 0)
						{
							friendlyFire = "Enabled";
						}
						else
						{
							friendlyFire = "Disabled";
						}
						
						if(temp_Data.raw.rules.sv_battleye != 0)
						{
							battleye = "Enabled";
						}
						else
						{
							battleye = "Disabled";
						}
						
						if(temp_Data.raw.secure != 0)
						{
							VACsecure = "Enabled";
						}
						else
						{
							VACsecure = "Disabled";
						}
						
						var jsonPlayerName = [];
						for(var i = 0; i < temp_Data.players.length; i++)
						{
							jsonPlayerName[i] = temp_Data.players[i].name;
						}
						
						connectto = hostinfo + ":" + temp_Data.query.port;
						
						res.render("server", {"GameFound": "true", "hostname": temp_Data.name, "servertype": strServerType, "ip": temp_Data.query.address, "port": temp_Data.raw.port, "customtheater": strCustomTheater, "map": temp_Data.map, "passwordprotected": passwordProtected, "friendlyfire": friendlyFire, "battleye": battleye, "vacsecure": VACsecure, "totalplayers": temp_Data.raw.numplayers, "maxplayers": temp_Data.maxplayers, "playerlist": jsonPlayerName, "connectto": "steam://connect/" + connectto});
						
						return;
					}
					else if(temp_Data.raw.folder.toLowerCase() === "sandstorm")
					{
						var VACsecure, passwordProtected;
						var strServerType = "Sandstorm";
						
						if(temp_Data.password == true)
						{
							passwordProtected = "Enabled";
						}
						else
						{
							passwordProtected = "Disabled";
						}
						
						if(temp_Data.raw.secure != 0)
						{
							VACsecure = "Enabled";
						}
						else
						{
							VACsecure = "Disabled";
						}
						
						var jsonPlayerName = [];
						for(var i = 0; i < temp_Data.players.length; i++)
						{
							jsonPlayerName[i] = temp_Data.players[i].name;
						}
						
						connectto = hostinfo + ":" + temp_Data.query.port;
						
						res.render("serversandstorm", {"GameFound": "true", "hostname": temp_Data.name, "servertype": strServerType, "ip": temp_Data.query.address, "port": temp_Data.raw.port, "map": temp_Data.map, "gamemode": temp_Data.raw.rules.GameMode_s, "passwordprotected": passwordProtected, "vacsecure": VACsecure, "totalplayers": temp_Data.raw.numplayers, "maxplayers": temp_Data.raw.rules.PlrM_i, "playerlist": jsonPlayerName, "connectto": "steam://connect/" + connectto});
						
						return;
					}
				})
				.catch((error) =>{
					//continue
				});
			}
			
			//Timer to check if it send
			setTimeout(function(){
				if(!res.headersSent)
				{
					res.render("server");
					return;
				}
			}, 1000);
		}
		else
		{
			res.render("server");
			return;
		}
	});
});

app.get("/api", function(req, res) {
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
	
	res.setHeader('content-type', 'text/plain');
	res.send("Error! If you did not input any server IP and port in the URL path, please do so.\nExample: insurgency.pro/api/104.243.35.239:27015");
});

app.get("/api/:ip", function(req, res) {
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
	
	res.setHeader('content-type', 'text/plain');
	
	var hostinforaw = req.params.ip;
	var hostinfo, portinfo;
	var tempinfo;
	
	if(hostinforaw.includes(":"))
	{
		tempinfo = hostinforaw.split(":");
	}
	
	//Master server
	var MasterServerIP;
	if(tempinfo)
	{
		MasterServerIP = tempinfo[0];
	}
	else
	{
		MasterServerIP = hostinforaw;
	}
	
	const MasterServerList = [];
	const MasterServer = vmsq('hl2master.steampowered.com:27011', vmsq.ALL, {
		gameaddr: MasterServerIP
	});
	
	MasterServer.on('error', (err) => {
		console.error(err);
	});
	
	MasterServer.on('data', (ip) => {
		MasterServerList.push(ip);
	});
	
	MasterServer.on('end', () => {
		if(tempinfo && (MasterServerList.length > 0))
		{
			hostinfo = tempinfo[0];
			portinfo = parseInt(tempinfo[1]);
			
			for(var i = 0; i < MasterServerList.length; i++)
			{
				MasterServerSplit = MasterServerList[i].split(":");
				MasterServerIP = MasterServerSplit[0];
				MasterServerPort = parseInt(MasterServerSplit[1]);
				
				Gamedig.query({
				type: 'insurgency',
				host: MasterServerIP,
				port: MasterServerPort
				}).then((state) => {
					var temp_Data = state;
					temp_Data = JSON.stringify(temp_Data);
					temp_Data = JSON.parse(temp_Data);
					
					if(temp_Data.raw.port == portinfo)
					{
						temp_Data = JSON.stringify(temp_Data, null, 2);
						res.send(temp_Data);
						return;
					}
					else if(temp_Data.query.port == portinfo)
					{
						temp_Data = JSON.stringify(temp_Data, null, 2);
						res.send(temp_Data);
						return;
					}
				}).catch((error) => {
					//continue;
				});
			}
			
			//Timer to check if it send
			setTimeout(function(){
				if(!res.headersSent)
				{
					res.send("Invalid Server! Server not found. Either the server not exist or its down. Please double check the IP and the port.");
					return;
				}
			}, 1000); 
		}
		else if(MasterServerList.length > 0)
		{
			hostinfo = hostinforaw;
			
			MasterServerSplit = MasterServerList[0].split(":");
			MasterServerIP = MasterServerSplit[0];
			MasterServerPort = parseInt(MasterServerSplit[1]);
			
			Gamedig.query({
			type: 'insurgency',
			host: MasterServerIP,
			port: MasterServerPort
			}).then((state) => {
				var temp_Data = state;
				
				temp_Data = JSON.stringify(temp_Data, null, 2);
				res.send(temp_Data);
				return;
			}).catch((error) => {
				res.send("Invalid Server! Server not found. Either the server not exist or its down. Please double check the IP and the port.");
				return;
			});
		}
		else
		{
			res.send("Invalid Server! Server not found. Either the server not exist or its down. Please double check the IP and the port.");
			return;
		}
	});
});

app.get("/serverlist", function(req, res) {
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
	
	res.setHeader('content-type', 'text/plain');
	res.send("Error! If you did not input any server IP in the URL path, please do so. (Do not put port in)\nExample: insurgency.pro/serverlist/108.61.136.218");
});

app.get("/serverlist/:ip", function(req, res) {
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
	
	res.setHeader('content-type', 'text/plain');
	
	var hostinforaw = req.params.ip;
	
	if(hostinforaw.includes(":"))
	{
		res.send("Invalid parameter. Please remove the port.");
		return;
	}
	else
	{
		//Master server
		var MasterServerIP = hostinforaw;
		
		const MasterServerList = [];
		const MasterServer = vmsq('hl2master.steampowered.com:27011', vmsq.ALL, {
			gameaddr: MasterServerIP
		});
		
		MasterServer.on('error', (err) => {
			console.error(err);
		});
		
		MasterServer.on('data', (ip) => {
			MasterServerList.push(ip);
		});
		
		MasterServer.on('end', () => {
			if(MasterServerList.length > 0)
			{
				for(var i = 0; i < MasterServerList.length; i++)
				{
					res.write(MasterServerList[i] + "\n");
				}
				res.end();
			}
			else
			{
				res.send("Error! Invalid IP address or no server found.");
			}
		});
	}
});


//Set page 404
app.use(function(req, res, next) {
	console.log("[WEB] %s connected to %s", GetIPAddress(req), req.originalUrl);
	
	res.status(404);
	
	if (req.accepts('html')) {
		//res.render("index");
		res.send('404: Not Found');
		return;
	}

	if (req.accepts('json')) {
		res.send({ error: 'Not found' });
		return;
	}

	res.type('txt').send('Not found');
});

//Server listen port and IP
serv.listen(80, "104.243.35.240");
console.log("[SERVER] Server listening on port 80...");