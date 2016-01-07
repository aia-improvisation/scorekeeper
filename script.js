//Public variables
var minPlayer = 1;
var maxPlayer = 14;

//max number of points an impro can receive
var maxScorePerPlay = 5;

//private variables

//players Data
var playersData = {};
/*playersData[i].status:
	*playing : the player is currently playing an impro
	*notPlaying: the player is not playing in the current impro but still in the game
	*active: between play, the player is still part of the game
	*inactive: the user has lost
*/
var playersDataStatusList = ['playing','notPlaying','active','inactive'];

//Round number
var roundNum = 1;

//current phase
var currentPhase = '';
var currentPhaseList = ['wait','playing'];


$(document).ready(function(){
	
	///////////////////////////////////////
	//first step, we ask the user names
	///////////////////////////////////////

	//We create with javascript the field list
	for(var i=1;i<=maxPlayer;i++) {
		$('#userNamesForm form').append(' <div><label>Player '+i+'</label><input type="text" name="player'+i+'" playerid="'+i+'" class="text ui-widget-content ui-corner-all"></div>');
	}

	dialogUserNames = $( "#userNamesForm" ).dialog({
      autoOpen: true,
      height: 600,
      width: 350,
      modal: true,
      buttons: {
        Cancel: function() {
          dialogUserNames.dialog( "close" );
        },
        "Let's play": startPlaying
      }
    });

    function startPlaying() {
    	var i = 1;
    	$( "#userNamesForm input" ).each(function(){
    		var userName = $(this).val();
    		if(userName) {
//    			console.log(i+' '+userName);
    			playersData[i] = {
    				'name':userName,
    				'status':'active',
    				'scores': {'round1':4,'round4':3}
    			};
    			i++;
    		}
    	})
    	//not enought players
    	if(i<=minPlayer) {
    		alert('minimum '+minPlayer+' players');
    		return;
    	}
    	//We draw the players list
    	drawPlayersList();

    	//it's ok, we can close the discussion
    	dialogUserNames.dialog( "close" );
    }


    function drawPlayersList() {
    	console.log('drawing');

    	//we empty the display
    	$('#playersList').html('');
    	//We loop the diferent status in the order of display
    	for(statusNum in playersDataStatusList) {
    		var status = playersDataStatusList[statusNum];

    		//We loop the list of users
    		for(var num in playersData) {
    			
    			var playerData = playersData[num];


    			//if not correct status, we continue
    			if(playerData.status != status) continue;

    			

    			$('#playersList').append('<li id="player'+num+'" class="'+status+'"><div class="playerName">'+num+'. '+playerData.name+'</div><div class="playerScore"></div></li>');
				
    			//score display
    			for(var round in playerData.scores) {
    				var points = playerData.scores[round];
    				$('#player'+num+' .playerScore').append('<div class="improScore '+round+'"></div>');
    				for(var i=1;i<=maxScorePerPlay;i++) {
    					if(points >=i) $('#player'+num+' .playerScore .'+round).append('<div class="point"></div>');
    					else $('#player'+num+' .playerScore .'+round).append('<div class="noPoint"></div>');
    				}
    			}
    		}
    	}
    }


    ///////////////////////////////////////
	//second step, players selection
	///////////////////////////////////////

})