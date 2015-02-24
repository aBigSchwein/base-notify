var https = require('follow-redirects').https;
var btoa = require('btoa');
var growl = require('growl');
var open = require('open');
var previousURL = "";

console.log("Loading...");

var projectID = "2312899";
var yourUserID = "8454513";
var username = "andrew.schweinfurth@walgreens.com";
var password = "Dudedell12";

var options = {
	host: 'basecamp.com',
	path: '/'+projectID+'/api/v1/projects.json',
	port: '443',
	method: "GET",
	headers: {
				'Authorization': 'Basic '+btoa(username+':'+password),
				'User-Agent': 'Walgreens BaseStats('+username+')',
				'Content-Type': 'application/json; charset=utf-8'
			 }
	};
	
console.log("Options Loaded");
console.log("Getting Projects...");


loop(options);

function loop(o){
    setTimeout(function(){
	    var d = new Date();
	    console.log("\nRun at: "+d.getMonth()+"/"+d.getDate()+"/"+d.getFullYear()+" @ "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds());
        getProjects(o);
    }, 10000);
}

function getProjects(o)
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
			console.log("Getting Latest Info...");
			
			getProjectInfo(arr[0],o);
			
		});
	}).on('error', function(err) 
	{	
		console.error("Error: "+err);
	});
}

function getProjectInfo(p,o)
{
	o.path = '/'+projectID+'/api/v1/projects/'+p.id+'/events.json';
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
			var heading = name+": "+summary;
			var message = info[0].excerpt;
			var url = info[0].html_url;
			var callback = function()
			{ 
				open(url);
				
				console.log("Opening "+p.name+"...");
				console.log("Done!\n--------------------------");
			}
			
			if(url == previousURL)
			{
				console.log("Not a new project");
				console.log("Done!\n--------------------------");
			}
			else if(yourUserID != "" && (yourUserID == id))
			{
				console.log("You were latest.");
				console.log("Done!\n--------------------------");
			}
			else
			{
				growl(message, {name: "Basecamp", title: heading, sticky: false, image: "article.pdf"},callback);
				previousURL = url;
			}
			
			loop(o);
		});
	}).on('error', function(err) 
	{	
		console.error("Error: "+err);
	});
}
