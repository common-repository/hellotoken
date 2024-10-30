jQuery(function($) {
  var post_type_noun = (HelloToken.post_type == "page")? "Pages" : "Posts";
  var ht_toggle_category_id = 0;

  // ^^^ these two variables are not being used

  var $inlineedit = $('#inlineedit'),
    $checkbox_group = $('.inline-edit-col-right .inline-edit-group', $inlineedit).first(),
    $pub_actions = $('#misc-publishing-actions');

  // create monetize label
  var $monetize_label = $('<label class="alignleft" style="margin-left: .5em;"></label>'),
    $monetize_checkbox = $('<input type="checkbox" name="hellotoken-monetize" value="1"/>'),
    $monetize_title = $('<span class="checkbox-title" style="margin-left: 2px; font-weight: bold;"></span>').text(HelloToken.text.monetize_with_ht);

  $monetize_label.append($monetize_checkbox).append($monetize_title);

  // add monetize checkbox to post inline edit form
  if ($inlineedit.length > 0) {
    $checkbox_group.append($monetize_label.clone());

    function hellotoken_init_inlineedit() {
      var $inline_link = $('#the-list a.editinline:not(.hellotoken_inline)');

      $inline_link.addClass('hellotoken_inline').on('click', function() {
        // Get the row, the number of the row (i.e. post), and the corresponding hidden value
        // Disregard absolutely terrible naming of hellotoken_, ht-, and ht_
        // It's the shitty naming of the person before me, and I haven't changed it yet for fear
        // of breaking something else
        var $row = $(this).closest('tr'),
          post_id = $row.attr('id').split('-')[1],
          $hidden = $('input[name=hellotoken_monetize]', $row);

        var waitForElements = function() {
          var $edit_row = ('#edit-' + post_id),
            $checkbox = $('input[name=hellotoken-monetize]', $edit_row);
          if ($checkbox.length === 0) {
            window.setTimeout(waitForElements, 200);
          } else {
            // Set the checkbox based on the value of the hidden element (tracked further in hellotoken.php)
            $checkbox.prop('checked', ($hidden.val() === "1")).on('change', function() {
              // Appropriately change value based on check/un-check
              $hidden.val($(this).is(":checked") ? "1" : "0");
            });
            $('.save', $edit_row).on('click', function() {
              $.post(HelloToken.action_url, {
                post_id: post_id,
                monetize: $checkbox.is(":checked") ? "1" : "0",
                quickedit_nonce: HelloToken.quickedit_nonce
              }, function(r) {
                if (r === -1)
                  console.log("HT: DB authentication error.");
              });
            });
          }
        };

        waitForElements();
      });
    }

    $(document).ajaxStop(hellotoken_init_inlineedit);
    hellotoken_init_inlineedit();
  }

  // add checkbox to add/edit post page
  if ($pub_actions.length > 0) {
    var $label = $monetize_label.clone(),
      $checkbox = $('input[type=checkbox]', $label),
      $monetize_hidden = $('input[name=hellotoken_monetize]');

    // Set the checkbox based on the value of the hidden element (tracked further in hellotoken.php) and then listen for change
    $checkbox.prop('checked', $monetize_hidden.val() === "1").on('change', function()
    {
      // Appropriately change value based on check/un-check
      $monetize_hidden.val($checkbox.is(':checked') ? "1" : "0");
    });

    // $('<div class="misc-pub-section"></div>').append($label.css('margin-left', '0')
    //     // misc-pub-section doesn't exist
    //   .css('margin-top', '2px').removeClass('hellotoken-alignleft')).appendTo($pub_actions);

  $('<div class="misc-pub-section"></div>').append($label.css('margin-left', '0')
    .css('margin-top', '2px').removeClass('alignleft')).appendTo($pub_actions);

  }

});
