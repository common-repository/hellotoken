<?php defined('ABSPATH') or die(); ?>

<div>
  <h1><?php esc_html_e('HelloToken: Monetization Without Ads', self::ld); ?></h1>
  <p><?php esc_html_e("To activate questions, click the \"Activate with HelloToken\" option when composing a new post.", self::ld); ?></p>

  <div class="hellotoken-show-amount" style="display: none;"></div>
  <div class="hellotoken-append-message" style="display: none;"></div>
  <div class="hellotoken-form-success" style="display: none;">
    Your connection is active!
  </div>
  <div class="hellotoken-form-demo" style="display: none;">
    You are currently using Demo Mode. Only use this if you are testing the popup.
  </div>
  <div class="hellotoken-form-url-errors" style="display: none;">
    Wait! Your connection is not active. This blog URL does not match the URL in your  <a href = "https://www.hellotoken.com/publishers/edit" target = "_blank">HelloToken account</a>. Please update your profile.
  </div>
  <div class="hellotoken-form-id-errors" style="display: none;">
    Wait! Your connection is not active. Please verify your Client ID (get it from your <a href = "https://www.hellotoken.com/publishers/edit" target = "_blank">HelloToken profile</a>).
  </div>
  <div class="hellotoken-form-errors" style="display: none;">
  </div>

  <ul class="hellotoken-tabs">
    <li class="hellotoken-tab hellotoken-active-tab" data-for="general">
      <a href="#">General Options</a>
    </li>
    <li class="hellotoken-tab" data-for="advanced">
      <a href="#">Advanced Options</a>
    </li>
  </ul>

  <div id="hellotoken_form">
    <?php require_once dirname(__FILE__).'/settingsForm.php' ?>
  </div>

  <p class="hellotoken-submit hellotoken-wp-settings-page">
    <?php submit_button(__('Save Changes', self::ld), 'primary', 'hellotoken-save-settings', false); ?>
    <span class="hellotoken-save-message"><?php _e('Settings saved.', self::ld); ?></span>
    <span class="hellotoken-spinner"></span>
    <br class="clear" />
  </p>
</div>
