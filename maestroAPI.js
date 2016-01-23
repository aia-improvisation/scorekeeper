"use strict";

//Public variables
var minPlayer = 1;
var maxPlayer = 14;

//max number of points an impro can receive
var maxScorePerPlay = 5;

//small Jquery extension to store an edition function
$.editionCallback = [];
$.editionNextId = 0;
$.fn.extend({
  editable: function (mode, callback) {
    var thisId = $.editionNextId++;
    this.addClass("editable_" + mode);
    this.attr("edition_" + mode, thisId);
    $.editionCallback[thisId] = callback;
  },
  isEditable: function(mode){
    return this.attr("edition_" + mode);
  },
  edit: function (mode) {
    var n = this.isEditable(mode);
    if (n != undefined){
      return $.editionCallback[n].apply(this,arguments)
    }
  }
})

$.activateEdition = function (mode, activate) {
  $("body").addClass("edition_" + mode);
  if (activate == undefined || activate) {
    $("body").on("click",".editable_" + mode,
		 function(){$(this).edit(mode)});
  } else {
    $("body").removeClass("edition_" + mode);
    $("body").off("click",".editable_" + mode);
  }
  };

$.deactivateEdition = function (mode) {
  $.activateEdition(mode, false);
}


// jquery extension to edit using inputs in place
$.fn.extend({
  input : function(type, submit, cancel, tune){
    var that = this.clone(true);
    var input = $("<input type='" + type + "' value='" + that.text() + "'>")
	.attr("class", that.attr("class"));
    // extra transformation, user provided
    if (tune) tune.call(this);
    this.replaceWith(input);
    input.focus();
    input.keydown(function(event) {
      if (event.which == 13) {
	$(this).replaceWith(that);
	submit(input.val());
      }else if (event.which == 27) {
	$(this).replaceWith(that);
	cancel();
      }
    })
  }
});

//small Jquery extension to recover player
$.fn.extend({
  player: function() {
    return Player.byId(this.closest("li").attr("player"))
  }
})


///////////////////////////////////////
// Player class creation and methods //
///////////////////////////////////////
class Player {
  constructor(num, name) {
    // internal initialization
    Player.data.list.push(this);
    this.id = Player.data.id++;
    this._eliminated = false;
    this._selected = false;
    this._score = [];
    this._name = name;
    this._num = num;

    // initialization and refresh of the display
    this.init().refresh();
  }

  set name(name){this._name = name; this.refresh();}
  get name(){return this._name}

  set num(num){this._num = num; this.refresh();}
  get num(){return this._num;}

  set eliminated(eliminated){
    this._eliminated = eliminated;
    this.unselect().refresh();
  }
  get eliminated(){return this._eliminated}
  eliminate() {this.eliminated = true; return this}

  set selected(selected){
    if (this.eliminated) return undefined;
    if (this._selected < selected) Player.data.selected++;
    if (this._selected > selected) Player.data.selected--;
    this._selected = selected;
    this.refresh();
  }
  get selected() {return this._selected;}
  select() {this.selected = true; return this}
  unselect() {this.selected = false; return this}
  toggle() {
    if (this.selected) {this.unselect()} else {this.select()};
    return this.selected;
  }

  set scoreList(score) {this._score = score; this.refresh();}
  get scoreList() {return this._score;}
  score() {
    if (this.eliminated) return 0;
    return this.scoreList.reduce(((m, n) => m + n),0);}
  scorePush(k) {this.scoreList = this._score.concat([k])}
  nextRound() {return this.scoreList.length + 1}

  refresh(){
    // Store current state;
    Player.store();
    // Printing Num and Name and setting tags
    this.$.find(".playerNum").text(this.num);
    this.$.find(".playerName").text(this.name);
    this.$.toggleClass("selected", this.selected);
    this.$.toggleClass("eliminated", this.eliminated);
    // Displaying score
    var point = 0;
    var currentBlock = undefined;
    var $score = this.$.find(".playerScore").html("");
    this._score = this._score.filter(n => 
      (0 < n) && (n <= maxScorePerPlay));
    $.each(this.scoreList, (i, score_i) => {
      for(var j = 0; j < score_i; j++){
	if (point % 5 == 0) {
	  if (currentBlock) {currentBlock.addClass('complete')};
	  currentBlock = $('<div class="scoreBlock block_' + point % 5 + '">').
	    appendTo($score)
	}
	point++;
	$('<div class="point score_' + i + ' point_' + point + '">')
	  .appendTo(currentBlock)
	  .addClass(i % 2 == 0 ? "even" : "odd")
	  .editable("unsafe", function(){
	    var player = this.player();
	    this.input(
	      "text",
	      function(val){
		player.scoreList[i] = Number(val);
		player.refresh();
	      },
	      function(){player.refresh()},
	      function(){this.attr("size","1")}
	    );
	    $score.find("div.score_" + i).remove();
	  });
      }
    });
    $score.append($('<div class="nextPoint">'));
    // if no one is selected put class wait on the ul
    // return this for chaining purpose
    Player.HUDRefresh();
    return this;
  }

  // init (re)creates the html supporting the display of the player
  init(){
    var this_player = this;
    this.detach();
    if (!(this.$ instanceof jQuery)) {
      this.$ = $("<li>").addClass("playerLine").attr("player",this.id);
      $("<div class='playerControl'>").appendTo(this.$)
	.editable("unsafe", () => this.delete());
      $("<div class='playerStatus'>").appendTo(this.$);
      $("<div class='playerNum'>").appendTo(this.$).editable("unsafe", function(){
	var player = this.player();
	this.input("text",
		   function(val){
		     if (Number(val) != NaN) {player.num = Number(val)};
		     player.refresh();
		   },
		   function(){player.refresh()})
      });
      $("<div class='playerName'>").appendTo(this.$).editable("unsafe", function(){
	var player = this.player();
	this.input("text",
		   function(val){player.name = val; player.refresh()},
		   function(){player.refresh()})
      });
      $("<div class='playerScore'>").appendTo(this.$);
    }
    $("#playerList").append(this.$);
    return this;
  }

  remove() {if (this.$ instanceof jQuery) this.$.remove();}
  detach() {if (this.$ instanceof jQuery) this.$.detach();}

  delete() {
    this.remove();
    var index = Player.data.list.indexOf(this);
    if (index != -1) Player.data.list.pop(index);
    Player.store();
    delete(this);
  };
}

////////////////////////////////////////////////////////////////////
// Global manipulation on all Players is handled by class methods //
////////////////////////////////////////////////////////////////////
Player.default_data = () => ({list: [], id: 0, selected: 0, round: 1});
Player.data = Player.default_data();

Player.HUDRefresh = () => {
  // Updating round
  $('#roundNumber').html(Player.data.round);
  $('#nextRound').toggle(Player.nextRound() != Player.data.round);
  // Updating global player statuses
  $("#playerList").toggleClass("waiting", Player.selected().length == 0);
  return Player;
}

Player.__defineGetter__("round", () => Player.data.round)
Player.__defineSetter__("round", (r) => {
  Player.data.round = r;
  Player.store();
  Player.HUDRefresh();
})

Player.selected = function () {
  return Player.data.list.filter((p) => p.selected);
}

// refresh rebuilds the whole player list, sorting them according to
// an order
Player.refresh = function (order) {
  //  updating players
  // var orders = {};
  // if (orderList) {
  //   if (orderList instanceof Array) $.each(orderList, (i, order) => orders[order] = true);
  //   else orders = orderList;
  // };
  // var lastOrders = Player.lastOrders ? Player.lastOrders : {};
  // var orderList = [];
  // for (var order in orders) {
  //   if ((lastOrders[order] && orders[order] == "change"
  // 	&& lastOrders[order] != "rev")
  // 	|| (orders[order] == "rev")) {
  //     if (lastOrders[order] == "change") {orders[order] = "rev"};
  //     orderList.push(revOrder(playerOrder[order]));
  //   } else {
  //     orderList.push(playerOrder[order]) ;
  //   }
  // };
  // Player.lastOrders = orders;
  if (order != undefined) { Player.data.list.sort(order) };
  // if (orderList instanceof Array){
  //   Player.data.list.sort(lexOrder($.map(orderList, (i, x) => playerOrder[x])));
  // }
  $.each(Player.data.list, (i, p) => {
    p.__proto__ = Player.prototype;
    p.init().refresh();
  });
  Player.HUDRefresh();
  return Player;
}

// different available sorting orders
var playerOrder = {
  num : (y, x) => y.num - x.num,
  name : (y, x) => (x.name < y.name) ? 1 : -1,
  eliminated : (y, x) => (x.eliminated < y.eliminated) ? 1 : -1,
  selected : (x, y) => (x.selected < y.selected) ? 1 : -1,
  score : (y, x) => x.score() - y.score()
}

//composing them
function lexOrder (l) {
  return function (x, y) {
    for (var i in l) {
      if (l[i](x,y) != 0) return l[i](x,y);
    };
    return 0}
};

var revOrder = (o) => ((x, y) => o(y, x));

//We use local storage to survive page reload
Player.store = function () {
  localStorage.setItem('playerData', JSON.stringify(Player.data));
};

Player.restore = function () {
  var playerData = JSON.parse(localStorage.getItem('playerData'));
  Player.data = $.extend(Player.data, playerData);
  Player.refresh();
};

Player.reset = function () {
  $.each(Player.data.list, (i, p) => p.delete());
  Player.data = Player.default_data();
  Player.store();
};

Player.nextRound = () => 
  Player.data.list.filter(p => !p.eliminated).reduce((m, p) =>
    Math.min(m, p.nextRound ? p.nextRound() : Infinity), Infinity);

Player.byPosition = (i) => Player.data.list[i];
Player.byId = (i) => Player.data.list.filter((p) => (i == p.id))[0];
Player.byNum = (i) => Player.data.list.filter((p) => (i == p.num))[0];
Player.byName = (n) => Player.data.list.filter((p) => (n == p.name))[0];
