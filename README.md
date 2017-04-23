# cozy-plugdb sharing
Cozy app to share documents with others cozies protected by PlugDB

**Warning : for demo use only**

## Prerequisite :
* 2 Cozy instances with admin party mode on the CouchDB (no authentication).
* A LAN connexion between the instances, either physical or virtual. By default the IP are 192.168.0.1 for the first instance and 192.168.0.2 for the second. It can be changed in controllers/sharing.js. Note the second one should revert the source/target values to make the replications work on his side.
* 2 running PlugDB, one for each Cozy instance on the port /dev/ttyACM0 for the first and /dev/ttyACM3 for the second. Its also need fingerprint enabled.
* The PlugDB core must be modified to deal with the fingerprint auth : simply remove the DB_ERROR in the marshaller
* Node.js 0.10 or 0.12 must be used, not higher versions
* The java openjdk-7 must be installed on the host machines
* Clone this branch on the 2 servers + npm install


## Demo how-to :
* Start the 2 servers with the command
```bash
coffee server.coffee
```
* Go on http://localhost:9999
* Play !
