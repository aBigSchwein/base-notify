base-notify
=========

This app is still very much in developement.
Essentially it pings Basecamp API, and notifies you with webkit notifications on the newest updates

###Live Demo
You can view a sample here, it is still pretty ghetto: [https://basenotify.herokuapp.com/](https://basenotify.herokuapp.com/)

###App Flow
This will probably change with each version.

* User finds projectID from basecamp.com when authenticated from URL its [https://basecamp.com/XXXXXXXX](https://launchpad.37signals.com/basecamp)
* Checks for Saved credentials in localstorage
* Valid Credentials check succeeds then app gets your userID and the projects associated to you.
* Some ghetto sorting and boom you get the latest project update
* Makes one more call to get the info about the update
* Notifies via webkit notifications if the update is not previously notified
* Displays the notification on the page in a list view, provides a comment link
* Loops every 6000ms and takes ~2000ms to run. 

###Work in Progress

* Get ProjectID based on username/password
* User actual Basecamp oAuth

###Backlog:

* Styles for notification
* Page layout/style updates
* Notification excerpt limiting of text length 

###Usage Info
You are welcome to all pull requests and usage just make sure to give credit when credit is due :)
