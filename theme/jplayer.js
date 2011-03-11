/**
 * @file
 * Drupal behaviors for jPlayer.
 */

(function ($) {
  
  Drupal.jPlayer = Drupal.jPlayer || {};
  
  Drupal.behaviors.jPlayer = {
    attach: function(context, settings) {
      // Set time format settings
      $.jPlayer.timeFormat.showHour = Drupal.settings.jPlayer.showHour;
      $.jPlayer.timeFormat.showMin = Drupal.settings.jPlayer.showMin;
      $.jPlayer.timeFormat.showSec = Drupal.settings.jPlayer.showSec;
      
      $.jPlayer.timeFormat.padHour = Drupal.settings.jPlayer.padHour;
      $.jPlayer.timeFormat.padMin = Drupal.settings.jPlayer.padMin;
      $.jPlayer.timeFormat.padSec = Drupal.settings.jPlayer.padSec;
      
      $.jPlayer.timeFormat.sepHour = Drupal.settings.jPlayer.sepHour;
      $.jPlayer.timeFormat.sepMin = Drupal.settings.jPlayer.sepMin;
      $.jPlayer.timeFormat.sepSec = Drupal.settings.jPlayer.sepSec;
      
      // INITIALISE
      
      $('.jp-jplayer', context).each(function() {
        var wrapper = this.parentNode;
        var player = this;
        var playerId = $(this).attr('id');
        var playerSettings = Drupal.settings.jplayerInstances[playerId];
        var type = $(this).parent().attr('class');
        
        if (type == 'jp-type-single') {
          // Initialise single player
          $(player).jPlayer({
            ready: function() {
              $(this).jPlayer("setMedia", playerSettings.files);
              
              // Make sure we pause other players on play
              $(player).bind($.jPlayer.event.play, function() {
                $(this).jPlayer("pauseOthers");
              });
              
              // Repeat?
              if (playerSettings.repeat == true) {
                $(player).bind($.jPlayer.event.ended, function() {
                  $(this).jPlayer("play");
                });
              }
              
              // Autoplay?
              if (playerSettings.autoplay == true) {
                $(this).jPlayer("play");
              }
            },
            swfPath: Drupal.settings.jPlayer.swfPath,
            cssSelectorAncestor: '#'+playerId+'_interface',
            solution: playerSettings.solution,
            supplied: playerSettings.supplied,
            preload: playerSettings.preload,
            volume: playerSettings.volume,
            muted: playerSettings.muted
          });
        }
        else {
          // Initialise playlist player
          $(player).jPlayer({
            ready: function() {
              Drupal.jPlayer.setFiles(wrapper, player, 0, playerSettings.autoplay);
              
              // Pause other players on play
              $(player).bind($.jPlayer.event.play, function() {
                $(this).jPlayer("pauseOthers");
              });
              
              // Repeat?
              if (playerSettings.repeat == true) {
                $(player).bind($.jPlayer.event.ended, function() {
                  $(this).jPlayer("play");
                });
              }
              
              // Add playlist selection
              $('#'+playerId+'_playlist').find('a').click(function(){
                var index = $(this).attr('id').split('_')[2];
                Drupal.jPlayer.setFiles(wrapper, player, index, true);
                return false;
              });
              
              // Next
              $(wrapper).find('.jp-next').click(function() {
                Drupal.jPlayer.next(wrapper, player);
              });
              
              // Previous
              $(wrapper).find('.jp-previous').click(function() {
                Drupal.jPlayer.previous(wrapper, player);
              });
            },
            swfPath: Drupal.settings.jPlayer.swfPath,
            cssSelectorAncestor: '#'+playerId+'_interface',
            solution: playerSettings.solution,
            supplied: playerSettings.supplied[0],
            preload: playerSettings.preload,
            volume: playerSettings.volume,
            muted: playerSettings.muted
          });
        }
      });
    }
  };
  
  Drupal.jPlayer.setFiles = function(wrapper, player, index, play) {
    var playerId = $(player).attr('id');
    var playerSettings = Drupal.settings.jplayerInstances[playerId];
    
    $(wrapper).find('.jp-playlist-current').removeClass('jp-playlist-current');
    $('#'+playerId+'_item_'+index).parent().addClass('jp-playlist-current');
    $('#'+playerId+'_item_'+index).addClass('jp-playlist-current');
    $(player).jPlayer("setMedia", playerSettings.files[index])
    
    if (play == true) {
      $(player).jPlayer('play');
    }
  };
  
  Drupal.jPlayer.next = function(wrapper, player) {
    var playerId = $(player).attr('id');
    var playerSettings = Drupal.settings.jplayerInstances[playerId];
    
    var current = Number($(wrapper).find('a.jp-playlist-current').attr('id').split('_')[2]);
    var index = (current + 1 < playerSettings.files.length) ? current + 1 : 0;
    
    Drupal.jPlayer.setFiles(wrapper, player, index, true);
  }
  
  Drupal.jPlayer.previous = function(wrapper, player) {
    var playerId = $(player).attr('id');
    var playerSettings = Drupal.settings.jplayerInstances[playerId];
    
    var current = Number($(wrapper).find('a.jp-playlist-current').attr('id').split('_')[2]);
    var index = (current - 1 >= 0) ? current - 1 : playerSettings.files.length - 1;
    
    Drupal.jPlayer.setFiles(wrapper, player, index, true);
  }
  
})(jQuery);