'use strict';

angular.module('doc.client', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/client', {
    templateUrl: 'client/client.html',
    controller: 'ClientCtrl'
  });
  $routeProvider.when('/', {
    templateUrl: 'client/client.html',
    controller: 'ClientCtrl'
  });
}])

.controller('ClientCtrl', ["$scope", "playback", "controllerSocket", function($scope, playback, socket) {


	/* Definitions */ 

	$scope.queue = [];
    $scope.volume = 0;
    $scope.mute = false;
	$scope.currentlyPlaying = null;
	$scope.chk = {
		recent: false,
		related: false,
		relatedToRecent: false
	}
	$scope.showControls = false;
	$scope.playbackState = false;
	$scope.magicModeState = false;
	$scope.playbackStateIcon = "play";
	$scope.playbackStateMessage = "Resume Playback";
	$scope.playbackMaxLengthState = true;
	$scope.magicModeState = false;

	/* Skip Current Song */
	$scope.skipSong = function(){
		playback.skip();
	}


	/* Related */

	$scope.relatedCheckboxClicked = function(){
		playback.setRelated($scope.chk.related, function(resp){
			$scope.chk.related = resp.state;
			$scope.updateMagicModeState();
		});
	}
	
	$scope.updateRelatedCheckbox = function(){
		playback.getRelated(function(resp){
			$scope.chk.related = resp.state;
		})
	}

	$scope.clearRecent = function(){
		playback.clearRecentList();
	}


	/* Related To Recent */

	$scope.relatedToRecentCheckboxClicked = function(){
		playback.setRelatedToRecent($scope.chk.relatedToRecent, function(resp){
			$scope.chk.relatedToRecent = resp.state;
			$scope.updateMagicModeState();
		});
	}

	$scope.updateRelatedToRecentCheckbox = function(){
		playback.getRelatedToRecent(function(resp){
			$scope.chk.relatedToRecent = resp.state;
		});
	};


	/* Recent */

	$scope.recentCheckboxClicked = function(){
		playback.setRecent($scope.chk.recent, function(resp){
			$scope.recentCheckbox = resp.state;
		});
	};

	$scope.updateRecentCheckbox = function(){
		playback.getRecent(function(resp){
			$scope.chk.recent = resp.state;
		});
	};


	/* Playback State */

	$scope.playbackStateButtonClicked = function(){
		$scope.playbackState = !$scope.playbackState
		playback.setState($scope.playbackState, function(resp){
			$scope.playbackState = resp.state;

			if($scope.playbackState){
				$scope.playbackStateIcon = "pause";
				$scope.playbackStateMessage = "Pause Playback";
			}
			else{
				$scope.playbackStateIcon = "play";
				$scope.playbackStateMessage = "Resume Playback";
			}
		});
	};

	$scope.updatePlaybackState = function(){
		playback.getState(function(resp){
			$scope.playbackState = resp.state;

			if($scope.playbackState){
				$scope.playbackStateIcon = "pause";
				$scope.playbackStateMessage = "Pause Playback";
			}
			else{
				$scope.playbackStateIcon = "play";
				$scope.playbackStateMessage = "Resume Playback";
			}
		})
	};


	/* Search Song */

	$scope.searchSong = function(){
		socket.emit("search", $scope.url);
    };

    socket.on("search::response", function(results){
        $scope.searchResults = results;
    });

    $scope.requestSong = function(ytid){

        for(var i=0; i < $scope.searchResults.length; i++){
            if($scope.searchResults[i].yt === ytid){
                var song = $scope.searchResults[i];
                socket.emit("queue:add", {
                    url: song.url,
                    yt: song.yt,
                    title: song.title,
                    uploader: song.uploader,
                    description: song.description,
                    thumbnail: song.thumbnail
                });
                break;
            }
        }
    }

    $scope.clearSearch = function(){
        $scope.searchResults = [];
    }

    socket.on("queue:add::response", function(song){
        alert("Song Requested\n" + song.title);
    });


    socket.on("queue:get::response", function(queue){
        $scope.queue = queue.queue;
        $scope.currentlyPlaying = queue.current;
    });

	/* Hide/Show Controls */

	$scope.toggleControls = function(){
		$scope.showControls = !$scope.showControls;
	};


	/* Magic Mode */
	$scope.toggleMagicMode = function(){
		$scope.chk.related = !$scope.chk.related;
		$scope.chk.relatedToRecent = !$scope.chk.relatedToRecent;
		$scope.relatedCheckboxClicked();
		$scope.relatedToRecentCheckboxClicked();
		$scope.magicModeState = !$scope.magicModeState;		
	}

	$scope.updateMagicModeState = function(){
		$scope.magicModeState =($scope.chk.related && $scope.chk.relatedToRecent);
	}


	/* Easter Eggs */
	$scope.easterEgg = function(){
		alert("It looked unbalanced without the one on the left...");
	}

	var egg = new Egg("up,up,down,down,left,right,left,right,b,a", function() {
		playback.toggleMaxLengthState(function(resp){
			$scope.playbackMaxLengthState = resp.state;
		});
	}).listen();

	$scope.updateMaxLength = function(){
		playback.getMaxLengthState(function(resp){
			$scope.playbackMaxLengthState = resp.state;
		});
	};

    /* Volume Control */
    socket.on("volume:get::response", function(vol){
        $scope.volume = vol;
    });
    
    $scope.volumeUpdate = function(){
        socket.emit("volume:set", $scope.volume);
    }





	/* UI REST Data Update Timer */

	$scope.restUpdate = function(){
		$scope.updateRelatedCheckbox();
		$scope.updateRelatedToRecentCheckbox();
		$scope.updateRecentCheckbox();
		$scope.updatePlaybackState();
		$scope.updateMaxLength();
		$scope.updateMagicModeState();
	};

	$scope.restUpdate();
	$scope.updateTimer = setInterval($scope.restUpdate, 5000);

    socket.emit("queue:get");
    socket.emit("volume:get");
    socket.emit("volume:mute:get");

}]);
