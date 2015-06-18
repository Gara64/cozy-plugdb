# cozy-sharing
Cozy app to share documents with others cozies protected by PlugDB

Warning : for demo use only

##Prerequisite : 
* 2 Cozy instances with admin party mode on the CouchDB (no authentication).
* A LAN connection between the instances, either physical or virtual. By default the IP are 192.168.0.1 for the first instance and 192.168.0.2 for the second.
* 2 running PlugDB, one for each Cozy instance on the port /dev/ttyACM0 for the first and /dev/ttyACM3 for the second. Its also need fingerprint enabled.
* Clone this branch on the 2 servers

##Demo how-to : 
* Start the 2 servers with the command
```bash
coffee server.coffee
```
* Go on http://localhost:9999
* Play !
