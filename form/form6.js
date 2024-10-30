/*!
 jQuery hellotoken Plugin 0.1

 hellotoken configuration form to manage/generate settings.
 */

jQuery(function($) {
  function HelloTokenForm(el, options) {
    this.el = el;
    this.errors = [];

    // default settings for form
    this.default_settings = {
      company_name: '',
      company_logo: '',
      client_id: '',
      free_content_count: 0,
      show_delay: 0,
      is_demo: 0,
      redirect_type: 0,
      redirect_url: '',
      default_enable: 1,
      homepage_enable: 0
    };

    this.options = $.extend(true, {}, {

      // settings definition for controls on the form
      settings: this.default_settings,

      // text definition in the form
      texts: {
        optional: 'Optional',
        necessary: 'Crucial for Success',
        client: 'Client ID*',
        extra: 'Some Extras Just for You',
        demo: 'Demo',
        is_demo: 'Is this site a demo?',
        company: 'Company',
        please_select: 'Please select',
        free_content_count: 'Free Content Count',
        free_content_count_desc: 'Number of articles user has to click before the hellotoken dialog box is shown.',
        sign: '$',
        show_delay: 'Question show delay',
        show_delay_desc: 'Delay showing the questions by a specified amount of time. By default the questions are shown immediately.',
        seconds: 'second(s)',
        redirect_type: 'Redirect type',
        redirect_type_desc: 'If the user closes the modal, what would you like to do?',
        redirect0: 'Close the modal with no redirect',
        redirect1: 'Redirect to homepage',
        redirect2: 'Redirect to a custom URL (enter the full address, in the form "http://www.customurl.com", below)',
        default_enable: 'Default post activation',
        default_enable_desc: 'Activate or deactivate HelloToken by default on new articles',
        default_enable0: 'Deactivate HelloToken by default on new articles',
        default_enable1: 'Activate HelloToken by default on new articles'
      },

      // called when form is initialized
      onInit: $.noop
    }, options);

    this.helloTokenMakeTemplate();

    this.options.onInit.call(this);
  }

  // methods
  var proto = HelloTokenForm.prototype;

  // variables
  var helloTokenVersion = HelloToken.version;

  proto.helloTokenMakeTemplate = function() {
    var texts = this.options.texts;

    // candidate for deletion--the texts can likely be inserted directly
    // this is how it was done previously, so I kept as is to not break things
    $("#hellotoken-form").hide();
    $('h3#hellotoken-necessary-title').text(texts.necessary);
    // shouldn't rely on this being unique, but fuck it
    $("label[for='hellotoken_client_id']").text(texts.client);
    $("h3#hellotoken-default_enable-title").text(texts.default_enable);
    // also a good chance this explodes in the future
    $("div#hellotoken-default_enable-form")
      .children("label[for='hellotoken_radio1']")
      .text(texts.default_enable1);
    $("div#hellotoken-default_enable-form")
      .children("label[for='hellotoken_radio0']")
      .text(texts.default_enable0);
    $("h3#hellotoken-redirect-title").text(texts.redirect_type);
    // and on..
    $("label[for='hellotoken_redirect_type']").text(texts.redirect_type_desc);
    $("select#hellotoken_redirect_type")
      .children("option[value='0']").text(texts.redirect0);
    $("select#hellotoken_redirect_type")
      .children("option[value='1']").text(texts.redirect1);
    $("select#hellotoken_redirect_type")
      .children("option[value='2']").text(texts.redirect2);
    // Now the Advanced Options Page
    $("h3#hellotoken-demo-title").text(texts.demo);
    $("label[for='hellotoken_is_demo']").text(texts.is_demo);
    $("h3#hellotoken-extra-title").text(texts.extra);
    $("label[for='hellotoken_free_content_count']").text(texts.free_content_count);
    $("input[name='hellotoken_free_content_count']")
      .attr("title", texts.free_content_count);
    $("label[for='hellotoken_show_delay']").text(texts.show_delay);
    $("input[name='hellotoken_show_delay']")
      .attr("title", texts.show_delay);
    $("#hellotoken-form").show();

    // get controls from template
    var $form = $('form', this.el);
    this.form = { this: $form };

    for (var i in this.default_settings) {
      // adding cases for different form element types as we go
      // see also the SetSettings and GetSettings methods
      // TODO: standardize this to be agnostic of form type
      if ($('#hellotoken_' + i, $form).length > 0){
        this.form[i] = $('#hellotoken_' + i, $form);
      } else if ($('#hellotoken-' + i, $form).length > 0) {
        this.form[i] = $('#hellotoken-' + i, $form);
      } else if ($('.hellotoken_' + i, $form).length > 0) {
        this.form[i] = $('.hellotoken_' + i, $form);
      } else {
        this.form[i] = $([]);
      }

    }

    this.helloTokenSetSettings();

    // set change listener to hellotoken_redirect_type to add additional text input if custom url
    var $redirect_type = $('#hellotoken_redirect_type');
    if($redirect_type.val() != 2){
      $('#hellotoken_redirect_url').hide();
    }

    $redirect_type.change(function() {
      if($(this).val() == 2){
        $('#hellotoken_redirect_url').show();
      } else {
        $('#hellotoken_redirect_url').hide();
      }
    });

  };

  // set settings for controls on the form
  proto.helloTokenSetSettings = function(settings) {
    if (typeof settings !== 'object')
      settings = this.options.settings;

    for (var i in settings) {
      if (i == "choices" && this.form.hasOwnProperty(i)) {
        // deprecated!
      } else if (this.form.hasOwnProperty(i)) {
        this.helloTokenSetSetting($(this.form[i]), settings[i]);
      }
    }
  };

  proto.helloTokenSetSetting = function(el, val) {
    if (el.is("input[type='checkbox']")) {
      el.prop("checked", val == 1);
    } else if (el.children().is("input[type='radio']")) {
      el.children("input[type='radio']").each(function(index, radio) {
        if($(radio).val() == val)
          $(radio).prop('checked', true);
      });
    } else {
      el.val(val);
    }
  };

  // get settings
  proto.helloTokenGetSettings = function(question) {
    var settings = {};

    for (var i in this.default_settings) {
      settings[i] = this.helloTokenGetSetting($(this.form[i]));
    }

    return settings;
  };

  proto.helloTokenGetSetting = function(el) {
    if (el.is("input[type='checkbox']")) {
      return el.prop("checked") ? 1 : 0;
    }
    else if (el.children().is("input[type='radio']")) {
      var checkedRadio = $(el.children()[0]);
      el.children("input[type='radio']").each(function(index, radio) {
        if($(radio).prop('checked'))
          checkedRadio = $(radio);
      });
      return checkedRadio.val();
    }
    else {
      return el.val();
    }
  };

  proto.helloTokenGetClient = function() {
    return this.form.client_id.val();
  };

  proto.helloTokenCheckVersion = function() {
    return helloTokenVersion;
  };

  proto.helloTokenAnnounceSuccess = function() {
    if(this.errors.length === 0) {
      $('.hellotoken-form-success').show();
      $('.hellotoken-form-demo').hide();
      $('.hellotoken-show-amount').show();
      $('.hellotoken-append-message').not(":eq(0)").remove();
      $('.hellotoken-append-message').hide();
      if ($('#hellotoken_is_demo').prop("checked")) {
        console.log('HT: Demo mode enabled');
        $('.hellotoken-form-success').hide();
        $('.hellotoken-form-demo').show();
      }
      // if ($('#hellotoken-homepage_enable').prop("checked")){
      //   console.log('hi');
      //   $('.hellotoken-append-message').text(
      //     "You currently have HelloToken enabled on your homepage."
      //   );
      //   $('.hellotoken-append-message').show();
      //   this.helloTokenFadeMessage($('.hellotoken-append-message'));
      // }
    }
  };

  proto.helloTokenAnnounceIDFailure = function() {
    this.errors.push('client_id');
    this.helloTokenDisplayErrors();
  };

  proto.helloTokenAnnounceUrlFailure = function() {
    this.errors.push('homepage_url');
    this.helloTokenDisplayErrors();
  };

  proto.helloTokenFadeMessage = function($el) {
    setTimeout(function() {
      $el.fadeOut('fast', function(){
        $el.remove();
      });
    }, 10000);
  };

  proto.helloTokenDisplayErrors = function(errorMsg) {
    var errors = this.errors;

    if (errors.length > 0 || errorMsg) {
      $('html, body').animate({ scrollTop: this.el.offset().top });

      $('.hellotoken-form-id-errors').hide();
      $('.hellotoken-form-url-errors').hide();
      $('.hellotoken-form-errors').hide();
      $('.hellotoken-form-success').hide();
      $('.hellotoken-show-amount').hide();
      $('.hellotoken-form-demo').hide();
      $('.hellotoken-append-message').hide();

      if (errors.includes('homepage_url')){
        $('.hellotoken-form-url-errors').show();
      }
      if (errors.includes('client_id')){
        $('.hellotoken-form-id-errors').show();
      }
      if (errorMsg) {
        $('.hellotoken-form-errors').text(errorMsg);
        $('.hellotoken-form-errors').show();
      }
    } else {
      $('.hellotoken-form-id-errors').hide();
      $('.hellotoken-form-url-errors').hide();
      $('.hellotoken-form-errors').text("");
      $('.hellotoken-form-errors').hide();
    }
  };

  // do validation of controls on the form
  proto.helloTokenDoValidation = function() {
    this.errors = [];
    var errors = this.errors;

    var free_content_count = this.form.free_content_count.val();
    if (free_content_count < 0 || isNaN(free_content_count) || free_content_count > 20)
      errors.push('free_content_count');

    var show_delay = this.form.show_delay.val();
    if (show_delay < 0 || isNaN(show_delay) || show_delay > 20)
      errors.push('show_delay');

    this.helloTokenDisplayErrors();

    return true;
  };


  // extend jquery
  $.fn.extend({
    HelloTokenForm: function(options) {
      var inst = this.data('HelloTokenForm');

      // if valid instance then perform calls on the class
      if (inst && options) {
        if (inst[options]){
          return inst[options].apply(inst, Array.prototype.slice.call(arguments, 1));
        }

        return inst;
      } else {
        inst = new HelloTokenForm(this, options);
        this.data('HelloTokenForm', inst);
      }

      // keep chain
      return this;
    }
  });
});
