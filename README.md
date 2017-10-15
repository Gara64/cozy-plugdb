# cozy-plugdb sharing
Cozy app to administrate secure document sharing

**Warning : for demo use only**

## Prerequisite :
* The PlugDB core must be modified to deal with the fingerprint auth : simply remove the DB_ERROR in the marshaller
* Node.js 0.10 or 0.12 must be used, not higher versions (install the client only with 0.10)
* The java openjdk-7 must be installed on the host machine
* A custom Cozy DS must be used (demo branch)
  * You might need to tweak into cozydb to change the DS IP (lib/utils/client.js)
* Clone this branch + npm install on the server AND client part


## Demo how-to :
* Start the Cozy VM

 ```bash
cozy-dev vm:start
vagrant ssh
cd /vagrant/cozy-data-system
cozy-monitor stop data-system
HOST=0.0.0.0 coffee server.coffee
```
* Start the app with the command
```bash
coffee server.coffee
```
* Go on http://localhost:9999
* Play !

## Raspberry 

If this app must run on Raspberry, be sure to have java + node + coffee set up.

You also need to change the HOST in nodes_modules/cozydb, which is the IP address of the data-system, e.g. 192.168.51.1 

Also, it seems the java package has troubles to be built, which blocks the run. You might have to comment the plug routes.
