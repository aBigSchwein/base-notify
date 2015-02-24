var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var https = require('follow-redirects').https;
var btoa = require('btoa');
var port = 3000;

app.get('/', function (req, res) 
{
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) 
{
	var version = "v1.0.0";
	
	console.log('User Connected!');
	socket.emit('welcome', { version: version});
	socket.on('disconnect', function()
	{
		console.log('User Disconnected!');
	});
	socket.on('refresh', function(data){
		
		var previousURL = "";
		if(data.url != "")
			previousURL = data.url;
			
		console.log("------Refreshing Projects------");
		var projectID = data.projectID;
		var username = data.username;
		var password = data.password;
		
		var options = {
			host: 'basecamp.com',
			path: '/'+projectID+'/api/v1/projects.json',
			port: '443',
			method: "GET",
			headers: {
						'Authorization': 'Basic '+btoa(username+':'+password),
						'User-Agent': 'base-notify('+username+')',
						'Content-Type': 'application/json; charset=utf-8'
					 }
			};
			
		console.log("Options Loaded");
		
		var d = new Date();
	    console.log("\nRunning at: "+d.getMonth()+"/"+d.getDate()+"/"+d.getFullYear()+" @ "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds());
        
        if(username != "" && password != "" && projectID != "")
        {
	        getPerson(options); 
        }
        else 
        {
	        console.log("User credentials are empty...");
	        socket.emit('user_cred_fail',false);
        }
		
		function getPerson(o)
		{
			o.path = '/'+projectID+'/api/v1/people/me.json';
			var person = "";
			https.get(o, function(res)
			{
				res.on('data', function (chunk)
				{
					person += chunk;
				});
				res.on('end', function ()
				{
					person = JSON.parse(person);
					
					console.log("Person: ", person.name);
					
					getProjects(o,person);
					
				});
			}).on('error', function(err) 
			{	
				console.error("Error: "+err);
			});
		}
		function getProjects(o,person)
		{
			o.path = '/'+projectID+'/api/v1/projects.json';
			var projects = "";
			https.get(o, function(res)
			{
				res.on('data', function (chunk)
				{
					projects += chunk;
				});
				res.on('end', function ()
				{
					projects = JSON.parse(projects);
					
					console.log("Projects Count: ",projects.length);
					
					var arr = [];
					for(i in projects) 
					{
						var updated = projects[i];
						var id = projects[i].id;
						arr.push(projects[i]);
					}
					
					arr.sort(function(a, b)
					{
					    if (a.last_event_at > b.last_event_at) return -1;
					    if (b.last_event_at > a.last_event_at) return 1;
					    return 0;
					});
					
					console.log("Latest: "+arr[0].name);
					
					getProjectInfo(arr[0],o,person);
					
				});
			}).on('error', function(err) 
			{	
				console.error("Error: "+err);
			});
		}
		
		function getProjectInfo(pjt,o,person)
		{
			o.path = '/'+projectID+'/api/v1/projects/'+pjt.id+'/events.json';
			var info = "";
			
			https.get(o, function(res)
			{
				res.on('data', function (chunk)
				{
					info += chunk;
				});
				res.on('end', function()
				{
					info = JSON.parse(info);
					//console.log("Info: ",info[0]);
					var id = info[0].creator.id;
					var name = info[0].creator.name;
					var img = info[0].creator.avatar_url;
					var summary = info[0].summary;
					var title = name+": "+summary;
					var exerpt = info[0].excerpt;
					var url = info[0].html_url;
					
					if(url == previousURL)
					{
						socket.emit('not_update', {project: {message: "No New Posts", url: url}});
						console.log("No New Posts");
					}
					else if(person.id != "" && (person.id == id))
					{
						socket.emit('not_update', {project: {message: "You Posted Last", url: url}});
						console.log("You Posted Last");
					}
					else
					{
						socket.emit('update', {project: {id: id, img: img, title: title, exerpt: exerpt, message: "New Post!", url: url}});
						console.log("Notify "+pjt.name+"...");
						previousURL = url;
					}
				});
			}).on('error', function(err) 
			{	
				console.error("Error: "+err);
			});
		}
	});
});

server.listen(port, function()
{
	console.log('Server up: @http://localhost:',port);
});