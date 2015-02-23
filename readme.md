# Getting Setup
1. `npm install`
2. `bower install`
3. `ionic lib update`
3. `ionic platform ios`

```bash
cordova plugin add com.ionic.keyboard
cordova plugin add org.apache.cordova.console
cordova plugin add org.apache.cordova.device
cordova plugin add org.apache.cordova.statusbar
cordova plugin add cc.fovea.plugins.inapppurchase
```

Installing the facebook plugin directly from Cordova Registry currently breaks the symlinks in `FacebookSDK.framework` [CB-6092](https://issues.apache.org/jira/browse/CB-6092). Easiest solution for now is to just `git clone` this project and install it with *Cordova CLI* using the local clone.
```sh
$ git clone https://github.com/Wizcorp/phonegap-facebook-plugin.git
```

```sh
# The path you cloned the plugin to earlier
# Remember to replace APP_ID and APP_NAME variables
$ cordova -d plugin add /path/to/cloned/phonegap-facebook-plugin --variable APP_ID=870753449624866 --variable APP_NAME="Parenting Academy"
```

# Running
Read this tutorial: [http://ionicframework.com/docs/guide/testing.html](http://ionicframework.com/docs/guide/testing.html)

You'll need to setup XCode with your developer provisioning profile in order to actually run it on your iPhone. Hit me up on Skype to work through that. `david.boskovic`