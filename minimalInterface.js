"use strict";

$(() => {
  ///////////////////////////////////////
  //some common functionalities used throughout the app
  ///////////////////////////////////////
  
  Player.restore();

  $(".playerNum.header").click(() => Player.refresh(playerOrder.num));
  $(".playerName.header").click(() => Player.refresh(playerOrder.name));
  $(".playerScore.header").click(() => Player
    .refresh(playerOrder.score));

  $("#nextRound").button().click(() => Player.round = Player.nextRound());

  $("#roundNumber").editable("unsafe", function (){
    this.input("text",
	       function(val){
		 if (Number(val) != NaN) {Player.round = Number(val)};
		 HUD.refresh();
	       },
	       function(){HUD.refresh()})
  });

  $('#lock').editable("safe", function () {
    $.deactivateEdition("safe");
    $.activateEdition("unsafe");
  });

  $('#lock').editable("unsafe", function () {
    $.deactivateEdition("unsafe");
    $.activateEdition("safe");
  });

  $(".playerControl.header").click(function(){
    new Player(0,"Player");
  })

  $("#dialogScore").dialog({
    autoOpen: false,
    height: 200,
    width: 300,
    title: "Give a score to the players",
    modal: true,
    buttons: {
      Give: function(){
	var n = Number($("#newScore").val());
	if (n < 1 || n > maxScorePerPlay) {
	  dialogError("Invalid Score");
	} else {
	  console.log(n)
	  $.each(Player.selected(), (i, p) => p.scorePush(n));
	  $("#dialogScore").dialog( "close");
	  $.each(Player.selected(), (i, p) => p.unselect());
	}
      },
      Cancel: function() {
	$("#dialogScore").dialog( "close" );
      }
    }
  });

  $.activateEdition("safe");
  $("#lock").button();

  $("#dialogError").dialog({
    autoOpen: false,
    // height: 300,
    width: 400,
    modal: true,
    buttons: {
      Cancel: function() {
	$("#dialogError").dialog( "close" );
      }
    }
  }).parent().addClass("ui-state-error");

  var dialogError = (text) => $("#dialogError").text(text).dialog("open");

  $('#giveScore').button().click(() => {
    if (Player.selected().length > 0) {
      $("#dialogScore").dialog("open")
    }else{
      dialogError("No player selected");
    }
  });

  $(".playerStatus").editable("play", function () {
    this.player().toggle()
  });

  $(".playerStatus").editable("eliminate", function () {
    var pl = this.player();
    pl.eliminated = !pl.eliminated;
  });

  $("#eliminatePlayers").button().editable("play", function(){
    $.deactivateEdition("play");
    $.activateEdition("eliminate");
    $("#eliminatePlayers").button("option","label","Stop elimination");
  });
  $("#eliminatePlayers").button().editable("eliminate", function(){
    $.deactivateEdition("eliminate");
    $.activateEdition("play");
    $("#eliminatePlayers").button("option","label","Begin elimination");
  });
  $.activateEdition("play");
  
  // $('dialog')
  
  // $('giveScore').on("click", function(){
    
});

// // $(".roundNumber").editable(function(){
//   //   this.input(function(){},function(){},)
//   // });

//   //the functions on the left
//   $('#functionsListWrapper').click(() => {
//     $('#functionsList').toggle();
    
//     if(currentPhase == 'wait') {
//       $('#btn_selectPlayers').toggle(currentPhase == 'wait');
//       $('#btn_attributeScore').toggle(currentPhase == 'wait');
//       $('#btn_eliminatePlayers').toggle();
//     } else if(currentPhase == 'playing') {
//       $('#btn_selectPlayers').hide();
//       $('#btn_attributeScore').show();
//       $('#btn_eliminatePlayers').hide();
//     }
//   })

//     //increment round num
//     function incrementRoundNum() {
// 	roundNum++;
// 	$('#title .roundNumber').html(roundNum);
//     }

//     //the main function responsible for drawing the players list
//     function drawplayerList() {
//     	//console.log('drawing');

//     	//we empty the display
//     	$('#playerList').html('');
//     	//We loop the diferent status in the order of display
//     	for(statusNum in playersDataStatusList) {
//     	    var status = playersDataStatusList[statusNum];

//     	    //We loop the list of users
//     	    for(var num in playersData) {

//     		var playerData = playersData[num];


//     		//if not correct status, we continue
//     		if(playerData.status != status) continue;

    		

//     		$('#playersList').append('<li id="player'+num+'" playerid="'+num+'" class="playerLine '+status+'"><div class="playerName">'+num+'. '+playerData.name+'</div><div class="playerScore"></div></li>');
		
//     		//score display
//     		for(var round in playerData.scores) {
//     		    var points = playerData.scores[round];
//     		    $('#player'+num+' .playerScore').append('<div class="improScore '+round+'" roundnum="'+round+'"></div>');
//     		    for(var i=1;i<=maxScorePerPlay;i++) {
//     			if(points >=i) $('#player'+num+' .playerScore .'+round).append('<div  pointnum="'+i+'" class="pointIcon point"></div>');
//     			else $('#player'+num+' .playerScore .'+round).append('<div  pointnum="'+i+'" class="pointIcon noPoint"></div>');
//     		    }
//     		}
//     	    } //end foreach player
//     	} //end foreach status

//     	//We save the users
//     	localStorage.setItem('playersData', JSON.stringify(playersData));
//     }

//     $(document).on('click','#playerList .pointIcon',function(){
//     	var playerId = $(this).closest('.playerLine').attr('playerid');
//     	var score = $(this).attr('pointnum');
//     	var round = $(this).closest('.improScore').attr('roundnum');

//     	//console.log(playerId+' - '+score + ' - '+round);

//     	playersData[playerId].scores[round] = parseInt(score);
//     	drawplayerList();
//     })


//     ///////////////////////////////////////
//     //first step, we ask the user names
//     ///////////////////////////////////////

//     //We create with javascript the field list
//     for(var i=1;i<=maxPlayer;i++) {
// 	$('#form_userNames form').append(' <div><label>Player '+i+'</label><input type="text" name="player'+i+'" playerid="'+i+'" class="text ui-widget-content ui-corner-all"></div>');
//     }

//     dialog_userNames = $( "#form_userNames" ).dialog({
// 	autoOpen: false,
// 	height: 600,
// 	width: 350,
// 	modal: true,
// 	buttons: {
//             Cancel: function() {
// 		dialog_userNames.dialog( "close" );
//             },
//             "Let's play": startGame
// 	}
//     });

//     if(playersData.length ==0) dialog_userNames.dialog( "open" );
//     else drawplayerList();


//     function startGame() {
//     	var i = 1;
//     	$( "#form_userNames input" ).each(function(){
//     	    var userName = $(this).val();
//     	    if(userName) {
// 		//    			console.log(i+' '+userName);
//     		playersData[i] = {
//     		    'name':userName,
//     		    'status':'active',
//     		    'scores': {}
//     		};
//     		i++;
//     	    }
//     	})
//     	    //not enought players
//     	    if(i<=minPlayer) {
//     		alert('minimum '+minPlayer+' players');
//     		return;
//     	    }
//     	//We draw the players list
//     	drawplayerList();

//     	//it's ok, we can close the discussion
//     	dialog_userNames.dialog( "close" );
//     }









//     ///////////////////////////////////////
//     //second step, players selection
//     ///////////////////////////////////////

//     //We set the dialog box

//     dialog_selectPlayers = $( "#form_userSelection" ).dialog({
// 	autoOpen: false,
// 	height: 600,
// 	width: 350,
// 	modal: true,
// 	buttons: {
//             Cancel: function() {
// 		dialog_userNames.dialog( "close" );
//             },
//             "Let's play": savePlayersSelection
// 	}
//     });

//     //The admin wants to select some players to play
//     //We display the list of users still in the game
//     $('#btn_selectPlayers').on('click',function() {

// 	$('#form_userSelection form').html('');
// 	//We loop the list of users
// 	for(var num in playersData) {

// 	    var playerData = playersData[num];

// 	    //only active players can play
// 	    if(playerData.status != 'active') continue;

// 	    $('#form_userSelection form').append(' <div><input type="checkbox" playerid="'+num+'" id="userSelect_checkbox_'+num+'" /><label for="userSelect_checkbox_'+num+'">'+num+'. '+playerData.name+'</label></div>');

// 	} //end foreach player

// 	dialog_selectPlayers.dialog('open');
//     })


//     function savePlayersSelection() {

//     	//We loop on the checkbox and save the playing ones
//     	var atLeastOneSelected = false;
//     	$( "#form_userSelection input" ).each(function(){
//     	    var isPlaying = $(this).prop('checked');
//     	    var userId = $(this).attr('playerid');
//     	    if(isPlaying) {
//     		playersData[userId].status = 'playing';
//     		atLeastOneSelected = true;
//     	    } else playersData[userId].status = 'notPlaying';
//     	})

//     	    if(!atLeastOneSelected) {
//     		alert('You have to select at least one player');
//     		return;
//     	    }
//     	//We draw the players list
//     	drawplayerList();
//     	//it's ok, we can close the discussion and update the status
//     	dialog_selectPlayers.dialog( "close" );
//     	$('#functionsListWrapper').trigger('click');
//     	currentPhase = 'playing';
//     }







//     ///////////////////////////////////////
//     //third step, score attribution
//     ///////////////////////////////////////


//     //We set the dialog box

//     dialog_attributeScore = $( "#form_scoreAttribution" ).dialog({
// 	autoOpen: false,
// 	height: 220,
// 	width: 350,
// 	modal: true,
// 	buttons: {
//             Cancel: function() {
// 		dialog_userNames.dialog( "close" );
//             },
//             "Save score": saveScore
// 	}
//     });

//     //The admin wants to select some players to play
//     //We display the list of users still in the game
//     $('#btn_attributeScore').on('click',function() {
// 	selectedPoints = 0;
// 	$('#form_scoreAttribution form').html('<div class="improScore"></div>');
// 	for(var i = 1; i <= maxScorePerPlay;i++) {
// 	    $('#form_scoreAttribution form .improScore').append(' <div class="pointIcon noPoint" pointnum="'+i+'"></div>');
// 	} //end foreach score

// 	dialog_attributeScore.dialog('open');
//     })

//     $(document).on('click','#form_scoreAttribution form .improScore div',function() {
// 	selectedPoints = parseInt($(this).attr('pointnum'));

// 	for(var i = 1; i <= maxScorePerPlay;i++) {
// 	    var pointElem = $('#form_scoreAttribution form .improScore div[pointnum='+i+']');
// 	    pointElem.removeClass('noPoint');
// 	    pointElem.removeClass('point');
// 	    if(i <= selectedPoints) pointElem.addClass('point');
// 	    else pointElem.addClass('noPoint');
// 	}
//     })

//     function saveScore() {

//     	if(selectedPoints == 0) {
//     	    alert('You must select at least one point');
//     	    return;
//     	}
//     	//We loop the list of users
// 	for(var num in playersData) {

// 	    var playerData = playersData[num];

// 	    //only active players can play
// 	    if(playerData.status == 'playing') {
// 		playersData[num].scores['round'+roundNum] = selectedPoints;
// 		playersData[num].status = 'active';
// 	    }
// 	    if(playerData.status == 'notPlaying') playersData[num].status = 'active';

// 	} //end foreach player

//     	//We draw the players list
//     	drawplayerList();
//     	//it's ok, we can close the discussion and update the status
//     	dialog_attributeScore.dialog( "close" );
//     	$('#functionsListWrapper').trigger('click');
//     	currentPhase = 'wait';

//     	incrementRoundNum();
//     }



//     ///////////////////////////////////////
//     //forth step, players elimination
//     ///////////////////////////////////////

//     //We set the dialog box

//     dialog_userElimination = $( "#form_userElimination" ).dialog({
// 	autoOpen: false,
// 	height: 600,
// 	width: 350,
// 	modal: true,
// 	buttons: {
//             Cancel: function() {
// 		dialog_userNames.dialog( "close" );
//             },
//             "Eliminate": savePlayersEliminated
// 	}
//     });

//     //The admin wants to select some players to play
//     //We display the list of users still in the game
//     $('#btn_eliminatePlayers').on('click',function() {

// 	$('#form_userElimination form').html('');
// 	//We loop the list of users
// 	for(var num in playersData) {

// 	    var playerData = playersData[num];

// 	    //only active players can play
// 	    if(playerData.status != 'active') continue;

// 	    $('#form_userElimination form').append(' <div><input type="checkbox" playerid="'+num+'" id="userSelect_checkbox_'+num+'" /><label for="userSelect_checkbox_'+num+'">'+num+'. '+playerData.name+'</label></div>');

// 	} //end foreach player

// 	dialog_userElimination.dialog('open');
//     })


//     function savePlayersEliminated() {

//     	//We loop on the checkbox and save the playing ones
//     	$( "#form_userElimination input" ).each(function(){
//     	    var isEliminated = $(this).prop('checked');
//     	    var userId = $(this).attr('playerid');
//     	    if(isEliminated) {
//     		playersData[userId].status = 'eliminated';
//     	    }
//     	})

//     	    //We draw the players list
//     	    drawplayerList();
//     	//it's ok, we can close the discussion and update the status
//     	dialog_userElimination.dialog( "close" );
//     	$('#functionsListWrapper').trigger('click');
//     	currentPhase = 'wait';
//     }

//     ///////////////////////////////////////
//     //fifth step, start new game
//     ///////////////////////////////////////

//     $('#btn_newGame').on('click',function() {
//         Player.reset();
// 	currentPhase = 'wait';
// 	roundNum = 1;
// 	dialog_userNames.dialog( "open" );
// 	$('#functionsListWrapper').trigger('click');
//     })

// })
