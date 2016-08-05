An open source server for the now-defunct Turntable.fm client

Requires mongodb

Instructions:
1.) Start the server (node opentt.js)
2.) Log into http://localhost:8080
3.) Register an account
4.) Create a room by doing the following:
Log into a shell
Run mongo
use opentt
db.users.find() to get your user id
Create a room:
db.rooms.insert({"_id": ObjectId("4e0b631414169c68880143a3"),     "name": "Chill Lounge",     "shortcut": "room",     "userid": ObjectId("57a3f9f94154870440606856"),     "moderatorID": ObjectId("57a3f9f94154870440606856") })
Replacing the object id of the user with your id
5.) Edit your config.json file to add your soundcloud api id and spotify login
6.) Restart the server and play!
