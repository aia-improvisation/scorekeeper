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
	*eliminated: the user has lost
*/
var playersDataStatusList = ['playing','notPlaying','active','eliminated'];

//Round number
var roundNum = 1;

//current phase
var currentPhase = 'wait';
/*currentPhaseList:
	*wait : between each impro
	*playing: when the players are currently playing
*/
var currentPhaseList = ['wait','playing'];

//number of points selected
var selectedPoints = 1;


//We use local storage to survive page reload
var retrievedObject = JSON.parse(localStorage.getItem('playersData'));

if(retrievedObject) playersData = retrievedObject;

$(document).ready(function(){
	
	///////////////////////////////////////
	//some common functionalities used throughout the app
	///////////////////////////////////////

	//the functions on the left
	$('#functionsListWrapper').on('click',function(){
		if($('#functionsList').css('display') == 'none') $('#functionsList').css('display','block');
		else $('#functionsList').css('display','none');

		if(currentPhase == 'wait') {
			$('#btn_selectPlayers').css('display','block');
			$('#btn_attributeScore').css('display','none');
			$('#btn_eliminatePlayers').css('display','block');
		} else if(currentPhase == 'playing') {
			$('#btn_selectPlayers').css('display','none');
			$('#btn_attributeScore').css('display','block');
			$('#btn_eliminatePlayers').css('display','none');
		}
	})

	//increment round num
	function incrementRoundNum() {
		roundNum++;
		$('#title .roundNumber').html(roundNum);
	}

	//the main function responsible for drawing the players list
	function drawPlayersList() {
    	//console.log('drawing');

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

    			

    			$('#playersList').append('<li id="player'+num+'" playerid="'+num+'" class="playerLine '+status+'"><div class="playerName">'+num+'. '+playerData.name+'</div><div class="playerScore"></div></li>');
				
    			//score display
    			for(var round in playerData.scores) {
    				var points = playerData.scores[round];
    				$('#player'+num+' .playerScore').append('<div class="improScore '+round+'" roundnum="'+round+'"></div>');
    				for(var i=1;i<=maxScorePerPlay;i++) {
    					if(points >=i) $('#player'+num+' .playerScore .'+round).append('<div  pointnum="'+i+'" class="pointIcon point"></div>');
    					else $('#player'+num+' .playerScore .'+round).append('<div  pointnum="'+i+'" class="pointIcon noPoint"></div>');
    				}
    			}
    		} //end foreach player
    	} //end foreach status

    	//We save the users
    	localStorage.setItem('playersData', JSON.stringify(playersData));
    }

    $(document).on('click','#playersList .pointIcon',function(){
    	var playerId = $(this).closest('.playerLine').attr('playerid');
    	var score = $(this).attr('pointnum');
    	var round = $(this).closest('.improScore').attr('roundnum');

    	//console.log(playerId+' - '+score + ' - '+round);

    	playersData[playerId].scores[round] = parseInt(score);
    	drawPlayersList();
    })


///////////////////////////////////////
//first step, we ask the user names
///////////////////////////////////////

	//We create with javascript the field list
	for(var i=1;i<=maxPlayer;i++) {
		$('#form_userNames form').append(' <div><label>Player '+i+'</label><input type="text" name="player'+i+'" playerid="'+i+'" class="text ui-widget-content ui-corner-all"></div>');
	}

	dialog_userNames = $( "#form_userNames" ).dialog({
      autoOpen: false,
      height: 600,
      width: 350,
      modal: true,
      buttons: {
        Cancel: function() {
          dialog_userNames.dialog( "close" );
        },
        "Let's play": startGame
      }
    });

	if(playersData.length ==0) dialog_userNames.dialog( "open" );
	else drawPlayersList();


    function startGame() {
    	var i = 1;
    	$( "#form_userNames input" ).each(function(){
    		var userName = $(this).val();
    		if(userName) {
//    			console.log(i+' '+userName);
    			playersData[i] = {
    				'name':userName,
    				'status':'active',
    				'scores': {}
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
    	dialog_userNames.dialog( "close" );
    }


    






///////////////////////////////////////
//second step, players selection
///////////////////////////////////////

	//We set the dialog box

	dialog_selectPlayers = $( "#form_userSelection" ).dialog({
      autoOpen: false,
      height: 600,
      width: 350,
      modal: true,
      buttons: {
        Cancel: function() {
          dialog_userNames.dialog( "close" );
        },
        "Let's play": savePlayersSelection
      }
    });

    //The admin wants to select some players to play
    //We display the list of users still in the game
	$('#btn_selectPlayers').on('click',function() {

		$('#form_userSelection form').html('');
		//We loop the list of users
		for(var num in playersData) {
			
			var playerData = playersData[num];

			//only active players can play
			if(playerData.status != 'active') continue;

			$('#form_userSelection form').append(' <div><input type="checkbox" playerid="'+num+'" id="userSelect_checkbox_'+num+'" /><label for="userSelect_checkbox_'+num+'">'+num+'. '+playerData.name+'</label></div>');

		} //end foreach player

		dialog_selectPlayers.dialog('open');
	})


	function savePlayersSelection() {
    	
    	//We loop on the checkbox and save the playing ones
    	var atLeastOneSelected = false;
    	$( "#form_userSelection input" ).each(function(){
    		var isPlaying = $(this).prop('checked');
    		var userId = $(this).attr('playerid');
    		if(isPlaying) {
    			playersData[userId].status = 'playing';
    			atLeastOneSelected = true;
    		} else playersData[userId].status = 'notPlaying';
    	})

    	if(!atLeastOneSelected) {
    		alert('You have to select at least one player');
    		return;
    	}
    	//We draw the players list
    	drawPlayersList();
    	//it's ok, we can close the discussion and update the status
    	dialog_selectPlayers.dialog( "close" );
    	$('#functionsListWrapper').trigger('click');
    	currentPhase = 'playing';
    }







///////////////////////////////////////
//third step, score attribution
///////////////////////////////////////


	//We set the dialog box

	dialog_attributeScore = $( "#form_scoreAttribution" ).dialog({
      autoOpen: false,
      height: 220,
      width: 350,
      modal: true,
      buttons: {
        Cancel: function() {
          dialog_userNames.dialog( "close" );
        },
        "Save score": saveScore
      }
    });

    //The admin wants to select some players to play
    //We display the list of users still in the game
	$('#btn_attributeScore').on('click',function() {
		selectedPoints = 0;
		$('#form_scoreAttribution form').html('<div class="improScore"></div>');
		for(var i = 1; i <= maxScorePerPlay;i++) {
			$('#form_scoreAttribution form .improScore').append(' <div class="pointIcon noPoint" pointnum="'+i+'"></div>');
		} //end foreach score

		dialog_attributeScore.dialog('open');
	})

	$(document).on('click','#form_scoreAttribution form .improScore div',function() {
		selectedPoints = parseInt($(this).attr('pointnum'));

		for(var i = 1; i <= maxScorePerPlay;i++) {
			var pointElem = $('#form_scoreAttribution form .improScore div[pointnum='+i+']');
			pointElem.removeClass('noPoint');
			pointElem.removeClass('point');
			if(i <= selectedPoints) pointElem.addClass('point');
			else pointElem.addClass('noPoint');
		}
	})

	function saveScore() {
    	
    	if(selectedPoints == 0) {
    		alert('You must select at least one point');
    		return;
    	}
    	//We loop the list of users
		for(var num in playersData) {
			
			var playerData = playersData[num];

			//only active players can play
			if(playerData.status == 'playing') {
				playersData[num].scores['round'+roundNum] = selectedPoints;
				playersData[num].status = 'active';
			}
			if(playerData.status == 'notPlaying') playersData[num].status = 'active';
			
		} //end foreach player

    	//We draw the players list
    	drawPlayersList();
    	//it's ok, we can close the discussion and update the status
    	dialog_attributeScore.dialog( "close" );
    	$('#functionsListWrapper').trigger('click');
    	currentPhase = 'wait';

    	incrementRoundNum();
    }



 ///////////////////////////////////////
//forth step, players elimination
///////////////////////////////////////

	//We set the dialog box

	dialog_userElimination = $( "#form_userElimination" ).dialog({
      autoOpen: false,
      height: 600,
      width: 350,
      modal: true,
      buttons: {
        Cancel: function() {
          dialog_userNames.dialog( "close" );
        },
        "Eliminate": savePlayersEliminated
      }
    });

    //The admin wants to select some players to play
    //We display the list of users still in the game
	$('#btn_eliminatePlayers').on('click',function() {

		$('#form_userElimination form').html('');
		//We loop the list of users
		for(var num in playersData) {
			
			var playerData = playersData[num];

			//only active players can play
			if(playerData.status != 'active') continue;

			$('#form_userElimination form').append(' <div><input type="checkbox" playerid="'+num+'" id="userSelect_checkbox_'+num+'" /><label for="userSelect_checkbox_'+num+'">'+num+'. '+playerData.name+'</label></div>');

		} //end foreach player

		dialog_userElimination.dialog('open');
	})


	function savePlayersEliminated() {
    	
    	//We loop on the checkbox and save the playing ones
    	$( "#form_userElimination input" ).each(function(){
    		var isEliminated = $(this).prop('checked');
    		var userId = $(this).attr('playerid');
    		if(isEliminated) {
    			playersData[userId].status = 'eliminated';
    		}
    	})

    	//We draw the players list
    	drawPlayersList();
    	//it's ok, we can close the discussion and update the status
    	dialog_userElimination.dialog( "close" );
    	$('#functionsListWrapper').trigger('click');
    	currentPhase = 'wait';
    }
    
 ///////////////////////////////////////
//fifth step, start new game
///////////////////////////////////////

	$('#btn_newGame').on('click',function() {
		playersData = {};
		currentPhase = 'wait';
		roundNum = 1;
		dialog_userNames.dialog( "open" );
		$('#functionsListWrapper').trigger('click');
	})

})