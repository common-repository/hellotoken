jQuery(function($) {
  // ease of development
  var currentHost = window.location.hostname;
  var pluginURL = (currentHost === 'localhost') ? 'http://localhost:3000' : '//hellotoken.com';

  var $spinner = $('.hellotoken-spinner'),
      $saveButton = $('input[name=hellotoken-save-settings]'),
      $allEnableButton = $('#hellotoken-all-enable'),
      $allDisableButton = $('#hellotoken-all-disable'),
      $form = $('#hellotoken_form');
  var pathName = window.location.pathname + "?page=HelloToken";

  // init settings form
  $form.HelloTokenForm({
    settings: HelloToken.settings,
    texts: HelloToken.texts
  });

  function helloTokenAppendMessage(msg, perm) {
    if (msg !== undefined) {
      var permMsg = typeof perm !== 'undefined' ? perm : false;
      var $msgDisplay = $('.hellotoken-append-message').last();
      if ($msgDisplay.is(':visible')){
        $msgDisplay.clone()
          .html(msg)
          .show().insertAfter($msgDisplay);
      } else {
        $msgDisplay.show().html(msg);
      }
      if (!permMsg){
        $form.HelloTokenForm('helloTokenFadeMessage',
                             $('.hellotoken-append-message').last());
      }
    }
  }

  function helloTokenShowAmount(msg) {
    $('.hellotoken-show-amount').show().html(msg);
  }

  // save settings
  function helloTokenShowLoader(v) {
    if (v)
      $spinner.show();
    else
      $spinner.hide();
    $saveButton.attr('disabled', v);
  }

  /**
   * Send a request to the HT servers to do something
   * Perform the given callback on success
   **/
  function checkPluginId(callback) {
    var alphaId = $form.HelloTokenForm('helloTokenGetClient');
    var alphaUrl = window.location.href;
    var version = $form.HelloTokenForm('helloTokenCheckVersion');

    $.ajax({
      url: pluginURL + "/popup/check",
      method: "GET",
      dataType: "JSONP",
      data: {
        "publisher_alpha_id": alphaId, // clientID
        "publisher_url": alphaUrl, // homepageUrl
        "version": version // check version of plugin
      },
      timeout: 10000,
      success: function(data) {
        var msg, pub_cash, code;

        if (version > 1.48) {
          msg = data.msg;
          pub_cash = data.pub_cash;
          code = data.code;

          if (code == 1) {
            // up to the callback whether to use this or not
            callback({"pub_cash": pub_cash, "msg": msg});
          } else if (code == 2) {
            $form.HelloTokenForm('helloTokenAnnounceUrlFailure');
            // If url mismatch, we do not plugin activation.
            console.log("HT: Url Mismatch. Action aborted.");
            // Append message if it is available from the Ruby backend
            helloTokenAppendMessage(msg);
          } else if (code == 3) {
            $form.HelloTokenForm('helloTokenAnnounceIDFailure');
            // If bad clientID, we do not plugin activation.
            console.log("HT: Bad ClientID. Action aborted.");
            // Append message if it is available from the Ruby backend
            helloTokenAppendMessage(msg);
          }

        } else if (version > 1.45) {
          // TODO - delete after most publishers have upgraded to 1.49
          pub_cash = data[0];
          msg = data[2]; // the message being passed as a second element in an array from Ruby
          if (data[1] == 1) {
            // up to the callback whether to use this or not
            callback({"pub_cash": pub_cash, "msg": msg});
          } else if (data[1] == 2) {
            $form.HelloTokenForm('helloTokenAnnounceUrlFailure');
            // If url mismatch, we do not plugin activation.
            console.log("HT: Url Mismatch. Action aborted.");
            // Append message if it is available from the Ruby backend
            helloTokenAppendMessage(msg, true);
          } else if (data[1] == 3) {
            $form.HelloTokenForm('helloTokenAnnounceIDFailure');
            // If bad clientID, we do not plugin activation.
            console.log("HT: Bad ClientID. Action aborted.");
            // Append message if it is available from the Ruby backend
            helloTokenAppendMessage(msg, true);
          }
        } else {
          // TODO - delete after most publishers have upgraded to 1.47
          msg = data[1]; // the message being passed as a second element in an array from Ruby
          if (data[0] == 1) {
            callback({"msg": msg});
          } else if (data[0] == 2) {
            $form.HelloTokenForm('helloTokenAnnounceUrlFailure');
            // If url mismatch, we do not plugin activation.
            console.log("HT: Url Mismatch. Action aborted.");
            // Append message if it is available from the Ruby backend
            helloTokenAppendMessage(msg, true);
          } else if (data[0] == 3) {
            $form.HelloTokenForm('helloTokenAnnounceIDFailure');
            // If bad clientID, we do not plugin activation.
            console.log("HT: Bad ClientID. Action aborted.");
            // Append message if it is available from the Ruby backend
            helloTokenAppendMessage(msg, true);
          }
        }
      },
      error: function(data){
        $form.HelloTokenForm('helloTokenDisplayErrors',
          'Error connecting to HelloToken servers. Please try again later.');
        console.log("HT: Couldn't verify client ID. Action aborted.");
      }
    });
  }

  // prevent access to HT status toggling if user hasn't confirmed ID yet
  // check for any sort of presence, rather than correctness
  if (!HelloToken.clientID) {
    $allEnableButton.addClass('disabled');
    $allDisableButton.addClass('disabled');
  }

  $('body').on('click', '.hellotoken-tab', function(e) {
    e.preventDefault();

    $('.hellotoken-tab').removeClass('hellotoken-active-tab');
    $(this).addClass('hellotoken-active-tab');

    $('.hellotoken-tab-content').hide();
    var loc = $(this).data('for');
    $('.hellotoken-tab-content[data-section="' + loc + '"]').show();
  });

  $allEnableButton.on('click', function(e) {
    if ($allEnableButton.hasClass('disabled'))
      return false;
    helloTokenShowLoader(true);
    $.post(HelloToken.action_url, {
      'toggle_all_ht': "1",
      'settings_nonce': HelloToken.nonces.settings
    }, function(r){
      console.log('HT: Enabled on all posts.');
      helloTokenShowLoader(false);
      helloTokenAppendMessage('HelloToken successfully enabled on all posts.');
      return true;
    }).fail(function() {
      $form.HelloTokenForm('helloTokenDisplayErrors',
        'Error updating Wordpress database. Action aborted.');
      helloTokenShowLoader(false);
      return false;
    });
  });

  $allDisableButton.on('click', function(e) {
    if ($allDisableButton.hasClass('disabled'))
      return false;
    helloTokenShowLoader(true);
    $.post(HelloToken.action_url, {
      'toggle_all_ht': "0",
      'settings_nonce': HelloToken.nonces.settings
    }, function(r){
      console.log('HT: Disabled on all posts.');
      helloTokenShowLoader(false);
      helloTokenAppendMessage('HelloToken successfully disabled on all posts.');
      return true;
    }).fail(function() {
      $form.HelloTokenForm('helloTokenDisplayErrors',
        'Error updating Wordpress database. Action aborted.');
      helloTokenShowLoader(false);
      return false;
    });
  });

  $saveButton.on('click', function(e) {
    e.preventDefault();

    if ( ! $form.HelloTokenForm('helloTokenDoValidation'))
      return;

    checkPluginId(function(data){
      helloTokenShowLoader(true);
      var settingsPackage = $form.HelloTokenForm('helloTokenGetSettings');
      settingsPackage.settings_nonce = HelloToken.nonces.settings;
      $.post(HelloToken.action_url, settingsPackage, function(r){
        // -1 indicates nonce failure
        // (or some other thing causing php script in backend to prematurely die)
        if (r !== -1) {
          helloTokenShowLoader(false);
          $form.HelloTokenForm('helloTokenAnnounceSuccess');
          // If url matches and clientID is right, activate plugin
          console.log("HT: Settings updated.");
          if ('pub_cash' in data && data.pub_cash !== undefined)
            helloTokenShowAmount(data.pub_cash);
          // Append message if it is available from the Ruby backend
          if ('msg' in data && data.msg !== undefined)
            helloTokenAppendMessage(data.msg, true);

          // allow the toggle buttons to be used now
          $allEnableButton.removeClass('disabled');
          $allDisableButton.removeClass('disabled');

          return true;
        }
        else {
          $form.HelloTokenForm('helloTokenDisplayErrors',
            'Wordpress authentication failure. Please check your credentials and try again.');
          return false;
        }
      }).fail(function() {
        $form.HelloTokenForm('helloTokenDisplayErrors',
          'Error updating Wordpress database. Action aborted.');
        helloTokenShowLoader(false);
        return false;
      });
    });

  });

  if (pathName == "/wp-admin/options-general.php?page=HelloToken") {
    $saveButton.click();
  }
});
