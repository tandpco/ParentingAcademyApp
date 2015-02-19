// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','mediaPlayer','parse-angular','ngStorekit'])

.run(function($ionicPlatform,$rootScope,$storekit) {
  $rootScope.$currentUser = false
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    // 
    // if (window.StatusBar) {
    //     // org.apache.cordova.statusbar required
    //     StatusBar.hide();
    // }
    // 
    if (!window.cordova) {
      facebookConnectPlugin.browserInit(870753449624866);
        // version is optional. It refers to the version of API you may want to use.
    }
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleLightContent();
    }


    $storekit
        .setLogging(true)
        .load(['test'])
        .then(function (products) {
            console.log('products loaded');
        })
        .catch(function () {
            console.log('no products loaded');
        });
    
    $rootScope.$digest();
  });

  Parse.initialize("76ZnCz3xcYferMKc4UnWzsV5T1M1JQTltdegftt4", "v0tu2jH1nyNJ9gRGYADS8TqZtflhGu5TCjm8h6rR");
  if(Parse.User.current()) {
    $rootScope.$currentUser = Parse.User.current();
  }
  $rootScope.$logout = function() {
    Parse.User.logOut()
    $rootScope.$currentUser = false
  }
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('welcome', {
      url: "/welcome",
      templateUrl: "welcome.html",
      controller: "WelcomeCtrl"
    })
    .state('register', {
      url: "/register",
      templateUrl: "register.html",
      controller: "RegisterCtrl"
    })
    .state('playback', {
      url: "/playback/:objectId",
      templateUrl: "playback.html",
      controller: "PlayCtrl"
    })
    .state('list', {
      url: "/list",
      templateUrl: "list.html",
      controller: "ListCtrl"
    })
    .state('my', {
      url: "/my",
      templateUrl: "my.html",
      controller: "MyCtrl"
    })
    .state('buy', {
      url: "/buy/:objectId",
      templateUrl: "buy.html",
      controller: "BuyCtrl"
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/welcome');

})

.controller('WelcomeCtrl', function($scope) {
  $scope.fbLogin = function(){

    var fbLoginSuccess = function(userData){
        if (!userData.authResponse){
                fbLoginError("Cannot find the authResponse");
                return;
        }
        var expDate = new Date(
                new Date().getTime() + userData.authResponse.expiresIn * 1000
        ).toISOString();
        var authData = {
                id: String(userData.authResponse.userID),
                access_token: userData.authResponse.accessToken,
                expiration_date: expDate
        }
        fbLogged.resolve(authData);
        fbLoginSuccess = null;
    };

    var fbLoginError = function(error){
            fbLogged.reject(error);
    };


    var fbLogged = new Parse.Promise();
    facebookConnectPlugin.login(["email"], fbLoginSuccess, fbLoginError);

    fbLogged.then(function(authData){
            return Parse.FacebookUtils.logIn(authData);
    }).then(function(user){

      $scope.$root.$currentUser = user;
      if(!user.getEmail)
        FB.api('/me', function(me) {
          user.set("displayName", me.name);
          user.set("email", me.email);
          user.save();
          console.log("/me response", me);
        });
    }, function(error){
      alert('error')
    });
  }
})
.controller('RegisterCtrl', function($scope,$state) {
  $scope.form = {}
  $scope.$register = function() {
    user = new Parse.User();
    console.log($scope.form)
    user.set("username", $scope.form.email);
    user.set("password", $scope.form.password);
    user.set("displayName", $scope.form.name);
    user.set("email", $scope.form.email);

    user.signUp(null, {
      success: function(user) {
        $scope.$root.$currentUser = user;
        user.set('password', $scope.form.password)
        user.logIn({success:function(){
          $state.go('list')
        }})
      },
      error: function(user, error) {
        $scope.form.error = error
      }
    });

  }
})
.controller('PlayCtrl', function($scope,$ionicSlideBoxDelegate,$stateParams,$timeout) {
  // $cordovaStatusBar.style(2)
  $scope.$onslide = 0;
  $scope.$slide = 1;
  $scope.$watch('$onslide',function(v){
    console.log(v)
  })

  var $products = new Parse.Query("Product")
  $scope.$talk = false
  $scope.$pieces = []
  $scope.$raudio = []
  $scope.$audio = false
  $scope.$player = false
  $products.get($stateParams.objectId,{success:function(data){
    $scope.$talk = data;
    $scope.$talk.relation('Pieces').query().find({
        success:function(data){
          console.log('got pieces',data)
          // $scope.$pieces = data
          for (var i = 0; i < data.length; i++) {
            if(data[i].get('Audio')) {
              $scope.$raudio.push({ src: data[i].get('Audio').url(), type: 'audio/mp3' })
              $scope.$pieces.push(data[i])
            }
          };
          $scope.$audio = $scope.$raudio[0]
          $timeout(function(){$ionicSlideBoxDelegate.update();},5)
        }
    })
  }})

  $scope.slideHasChanged = function($index,$slide) {
    console.log($index)
    $scope.$audio = $scope.$raudio[$index]
    $scope.$slide = $index+1;
  }
  $scope.activeSlide = function($index) {
    $scope.$slide = $index+1;
  }
  $scope.countSlides = function(){
    return $ionicSlideBoxDelegate.slidesCount()
  }



  $scope.mySpecialPlayButton = function () {
    $scope.customText = 'I started angular-media-player with a custom defined action!';
    $scope.audio1.playPause();
  };
})
.controller('ListCtrl', function($scope) {
  // $cordovaStatusBar.style(2)
  var $products = new Parse.Query("Product")
  $scope.$products = []
  $products.find({success:function(data){
    $scope.$products = data;
    // for (var i = 0; i < data.length; i++) {
    //   console.log(data[i].get('Name'))
    // };
  }})
})
.controller('MyCtrl', function($scope) {
  // $cordovaStatusBar.style(2)
  var $products = new Parse.Query("Product")
  $scope.$products = []
  $scope.$root.$currentUser.relation('Products').query().find({success:function(data){
    $scope.$products = data;
    // for (var i = 0; i < data.length; i++) {
    //   console.log(data[i].get('Name'))
    // };
  }})
})
.controller('BuyCtrl', function($scope,$stateParams,$state,$storekit) {
  // $cordovaStatusBar.style(2)
  var $products = new Parse.Query("Product")
  $scope.$talk = false
  $scope.alreadyPurchased = false
  $products.get($stateParams.objectId,{success:function(data){
    $scope.$talk = data;
    $scope.$root.$currentUser.relation('Products').query().get($scope.$talk.id,{
        success:function(data){
          $scope.alreadyPurchased = true
          console.log('already purchased')
        }
    })
  }})
 // watch for purchases
  $storekit
    .watchPurchases()
    .then(function () {
        // Not currently used
    }, function (error) {
        $scope.$buying = 'Error purchasing...'
        // alert('error')
    }, function (purchase) {
      $scope.$buying = 'Successful purchase!'
      if (purchase.productId === 'test') {
        $scope.$root.$currentUser.relation('Products').add($scope.$talk)
        $scope.$root.$currentUser.save()
        $state.go('playback',{objectId:$scope.$talk.id})
      }
    });
  $scope.$buying = false;
  $scope.$buy = function(){
    $scope.$buying = 'Looking up product...'
    $scope.$root.$currentUser.relation('Products').query().get($scope.$talk.id,{
      success:function(data){
        $scope.$buying = 'Found purchase...'
        $state.go('playback',{objectId:$scope.$talk.id})
      },
      error:function(data) {
        $scope.$buying = 'Connecting to app store...'
        $storekit.purchase('test');
      }
    })
  }
})

// ionic.Platform.ready(function() {
//     angular.bootstrap(document, ['starter']);
// });
angular.element(document).ready(function() {
  if (window.cordova) {
    document.addEventListener('deviceready', function() {
      angular.bootstrap(document.body, ['starter']);
    }, false);
  } else {
    angular.bootstrap(document.body, ['starter']);
  }
});
