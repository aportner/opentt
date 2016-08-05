# OpenTT

An open source server for the now-defunct Turntable.fm client

![Screenshot](https://raw.githubusercontent.com/aportner/opentt/master/screenshot.png)

Requires **mongodb**

**Instructions:**

1. Make sure mongod is running, then start the server by typing `node opentt.js`
2. Log into http://localhost:8080
3. Register a user account
4. Create a room through the `mongo` command
  1. `use opentt`
  2. `db.users.find()`
  3. Copy the id of your user
  4. `db.rooms.insert({"_id": ObjectId("4e0b631414169c68880143a3"), "name": "[NAME GOES HERE]", "shortcut": "room", "userid": ObjectId("[USER ID GOES HERE]"),     "moderatorID": ObjectId("[USERID GOES HERE")})`
5. Edit your config.json file to add your soundcloud api id and spotify login
6. Restart the server and play!
