<?php
define('HELLOTOKEN_VERSION', 1.49);

// Plugin Name: HelloToken
// Plugin URI: http://wordpress.org/plugins/hellotoken/
// Description: Beautifully ask readers questions and/or earn cold hard cash for each user that visits your site.
// Version: 1.49
// Author: hellotoken.com
// Author URI: http://hellotoken.com
// License: GPLv2 or later
// Text Domain: hellotoken


defined('ABSPATH') or die();

class HelloToken {
  // version of the plugin should be updated with header version
  const version = HELLOTOKEN_VERSION;

  // language domain, used for translation
  const ld = 'hellotoken';
  const nonce = 'hellotoken-nonce';

  private $_url, $_path, $settings;

  protected $default_settings;

  public function __construct() {
    // paths
    $this->_url = plugins_url('', __FILE__);
    $this->_path = dirname(__FILE__);

    // default settings definition, will be used as initial settings
    $this->default_settings = array(
      // crucial options
      'homepage_url' => get_site_url(),
      'company_name' => '',
      'company_logo' => '',
      'client_id' => '',
      'question' => '',

      // 0 - do nothing, 1 - home page, 2 - custom url
      'redirect_type' => '0',
      'redirect_url' => '',

      // 0 - new articles auto disabled, 1 - auto enabled
      'default_enable' => '1',

      // advanced options
      'homepage_enable' => '0',
      'free_content_count' => '0',
      'show_delay' => 0,
      'is_demo' => 0,

    );

    $this->settings = get_option(__class__.'_settings', $this->default_settings);

    // called to load appropriate language file
    add_action('plugins_loaded', array($this, 'plugins_loaded'));

    // add actions for the admin backend
    if (is_admin()) {
      add_action('admin_menu', array($this, 'admin_menu'));
      add_action('wp_ajax_'.__class__, array($this, 'ajax_action'));

      // add our own custom hellotoken column for bulk editing
      // possible screen hide on default in future
      add_filter('manage_pages_columns', array($this, 'hellotoken_columns'));
      add_filter('manage_pages_custom_column', array($this, 'custom_columns'), 10, 2);

      add_filter('manage_posts_columns', array($this, 'hellotoken_columns'));
      add_filter('manage_posts_custom_column', array($this, 'custom_columns'), 10, 2);

      add_action('bulk_edit_custom_box', array($this, 'display_custom_hellotoken'), 10, 2);

      // add scripts on the settings page
      add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));

      // alter post add/edit form
      add_action('edit_form_after_title', array($this, 'alter_post_edit_form'));

      // alter post row actions to handle monetize status
      add_filter('post_row_actions', array($this, 'alter_post_row_actions'), 10, 2);
      add_filter('page_row_actions', array($this, 'alter_post_row_actions'), 10, 2);

      // save post data - eg. status for post
      add_action('save_post', array($this, 'save_post'));
    } else {
      // frontend integration
      if (isset($this->settings['client_id']) && $this->settings['client_id']) {
        // add frontend script files
        add_action('wp_enqueue_scripts', array($this, 'wp_enqueue_scripts'));
      }
    }

    // on activation and uninstallation (this hook must bind to a static method)
    register_activation_hook(__FILE__, array($this, 'activation'));
    register_uninstall_hook(__FILE__, array(__class__, 'uninstall'));
  }

  public function display_custom_hellotoken($column_name, $post_type) {
    // static $printNonce = TRUE;
    // if ( $printNonce ) {
    //     $printNonce = FALSE;
    //     wp_nonce_field( plugin_basename( __FILE__ ), 'book_edit_nonce' );
    // }
    if ( ! in_array($column_name, array('hellotoken_enabled')) )
      return;
    ?>

    <!-- avoid fieldset wordpress bug #29821 -->
    <div class="hellotoken-inline-edit-col-right hellotoken-inline-edit">
        <label class="hellotoken-inline-edit-group">
          <?php
          switch ( $column_name ) {
          case 'hellotoken_enabled':
          ?>
            <span class="hellotoken-title">HelloToken Status</span>
            <select name="hellotoken_enabled">
              <option value="-1">— No Change —</option>
              <option value="0">Disable Selected</option>
              <option value="1">Enable Selected</option>
            </select>
          <?php
            wp_nonce_field("hellotoken_bulkedit", "hellotoken_bulkedit_nonce", true, true);
            break;
          } ?>
        </label>
    </div>
    <?php
  }

  public function hellotoken_columns($columns) {
    return array_merge($columns, array(
      'hellotoken_enabled' => __('HelloToken?')
    ));
  }

  function custom_columns($column, $post_id) {
    switch ($column) {
    case 'hellotoken_enabled':
      $status = get_post_meta($post_id, '_hellotoken', true);
      echo ($status == '1') ? 'yes' : 'no';
      break;
    }
  }

  // on activation
  public function activation() {
    add_option(__class__.'_settings', $this->default_settings);
  }

  // on uninstallation
  static function uninstall() {
    delete_option(__class__.'_settings');
  }

  // when all plugins are loaded
  public function plugins_loaded() {
    load_plugin_textdomain(self::ld, false, dirname(plugin_basename(__FILE__)).'/languages/');
  }

  // add submenu item to the settings menu
  public function admin_menu() {
    add_options_page(__('HelloToken', self::ld), __('HelloToken', self::ld), 'manage_options', __class__, array($this, 'settings_page'));
    add_filter('plugin_action_links_'.plugin_basename(__FILE__), array(&$this, 'filter_plugin_actions'), 10, 2);
  }

  // add a shortcut to the settings page on the plugins page
  public function filter_plugin_actions($l, $file) {
    $settings_link = '<a href="options-general.php?page='.__class__.'">'.__('Settings').'</a>';
    array_unshift($l, $settings_link);
    return $l;
  }

  // enqueue scripts and styles
  public function admin_enqueue_scripts($hook) {
    $screen = get_current_screen();

    if ($hook == 'settings_page_'.__class__) {
      add_thickbox();
      wp_enqueue_media();

      // form
      wp_enqueue_style(__class__.'_form', $this->_url.'/form/form.css', array(), self::version, 'all');
      wp_enqueue_script(__class__.'_form', $this->_url.'/form/form6.js', array('jquery'), self::version, false);

      // settings
      wp_enqueue_style(__class__.'_styles', $this->_url.'/admin/settings.css', array(), self::version, 'all');
      wp_enqueue_script(__class__, $this->_url.'/admin/settings6.js', array('jquery'), self::version, false);

      // hellotoken
      wp_enqueue_script(__class__.'_hellotoken', $this->_url.'/hellotoken/hellotoken49.js', array('jquery'), self::version, false);
      wp_enqueue_script(__class__.'_analytics', $this->_url.'/3rdparty/analytics.js', array('jquery'), self::version, false);

      // this is a regular way how to pass variables from PHP to Javascript
      wp_localize_script(__class__, __class__, array(
        'version' => HELLOTOKEN_VERSION,
        'action_url' => admin_url('admin-ajax.php?action='.__class__),
        'clientID' => $this->getSetting('client_id'),
        'nonces' => array(
          'settings' => wp_create_nonce('hellotoken_settings'),
        ),
        'settings' => get_option(__class__.'_settings', $this->default_settings),
        'texts' => array(
          'connect' => __('Connect', self::ld),
          'your_homepage' => __('Your Homepage', self::ld),
          'here' => __('here', self::ld),
          'optional' => __('Optional', self::ld),
          'customize' => __('Customize', self::ld),
          'monetize' => __('Monetize', self::ld),
          'company' => __('Company', self::ld),
          'company_logo' => __('Company Logo', self::ld),
          'please_select' => __('Please select', self::ld),
          'free_content_count' => __('Free Content Count', self::ld),
          'free_content_count_desc' => __('Number of articles user has to click before the HelloToken dialog box is shown.', self::ld),
          'sign' => __('$', self::ld),
          'show_delay' => __('Paywall show delay', self::ld),
          'show_delay_desc' => __('Delay showing the paywall by a specified amount of time. By default the paywall is shown immediately.', self::ld),
          'seconds' => __('second(s)', self::ld)
        ),
        'text' => array(
          'ajax_error' => __('An error occurred during the AJAX request, please try again later.', self::ld),
          'media_upload_title' => __('Please select company logo', self::ld),
          'please_select' => __('Please select', self::ld)
        )
      ));
    }
    else
    if (($hook == 'edit.php' || $hook == 'post-new.php' || $hook == 'post.php') && in_array($screen->post_type, array('page', 'post')))
    {
      wp_enqueue_style(__class__.'_styles', $this->_url.'/admin/postedit.css', array(), self::version, 'all');
      wp_enqueue_script(__class__, $this->_url.'/admin/postedit.js', array('jquery'), self::version, false);
      wp_localize_script(__class__, __class__, array(
        'action_url' => admin_url('admin-ajax.php?action='.__class__),
        'text' => array(
          'monetize_with_ht' => __('Activate with HelloToken', self::ld)
        ),
        'quickedit_nonce' => wp_create_nonce('hellotoken_quickedit'),
        // I don't actually use the "edit_nonce" (I create a hidden field instead,
        // since these values use save_post instead of AJAX to update)
        // but for consistency, might be useful to keep this
        'edit_nonce' => wp_create_nonce('hellotoken_edit'),
        // same idea here
        'bulkedit_nonce' => wp_create_nonce('hellotoken_bulkedit'),
        'post_type' => $screen->post_type
      ));
    }
  }

  // helper function to get setting if exists and if not then return default
  protected function getSetting($name) {
    if ($name=="choices")
      return $this->settings[$name];

    if (isset($this->settings[$name])){
      return self::strip(stripslashes($this->settings[$name]));
    }

    return $this->default_settings[$name];
  }

  protected function is_valid_settings($settings) {
    $allowed_keys = array_merge($this->default_settings, array("settings_nonce" => NULL));
    foreach ($settings as $setting => $val) {
      if (!array_key_exists($setting, $allowed_keys)){
        return false;
      }
      switch($setting) {
        case "redirect_type":
          // inconsistent with int/str so loose check
          if (!in_array($val, array("0", "1", "2")))
            return false;
          break;
        case "redirect_url":
          if (strlen($val) > 84)
            return false;
          break;
        case "default_enable":
        case "is_demo":
        case "homepage_enable":
          if (!in_array($val, array("0", "1")))
            return false;
          break;
        // there are other possible setting keys, but we either
        // don't care about them, or can just sanitize them out later
      }
    }

    // require, at minimum, a client_id be stored
    // (also how we check that we're trying to update settings!)
    return isset($settings['client_id']);
  }

  protected function sanitized_settings($settings) {
    // intval casts non-ints to 0, which we're okay with as default
    $settings['show_delay'] = absint(intval($settings['show_delay']));
    $settings['free_content_count'] = absint(intval($settings['free_content_count']));
    $settings['redirect_url'] = esc_url_raw($settings['redirect_url']);
    return $settings;
  }

  // page to show settings in the admin backend
  public function settings_page() {
    require_once $this->_path.'/admin/settings.php';
  }

  // handle admin ajax actions
  public function ajax_action() {
    header('Content-Type: application/json');

    if (isset($_POST['toggle_all_ht'])){
      // screw it, let's just overload the settings nonce
      check_ajax_referer( 'hellotoken_settings', 'settings_nonce' );
      if ($this->getSetting('client_id') == $this->default_settings['client_id'])
        exit;
      if (!in_array($_POST['toggle_all_ht'], array("0", "1")))
        exit;
      $this->bulk_save_ht_status(get_posts(), $_POST['toggle_all_ht']);
    }
    // save settings form
    else if ($this->is_valid_settings($_POST)){
      check_ajax_referer( 'hellotoken_settings', 'settings_nonce' );
      update_option(__class__.'_settings', $this->sanitized_settings($_POST));
    }
    // save monetize option per post (quick edit)
    else if (isset($_POST['monetize']) && isset($_POST['post_id'])
        && in_array($_POST['monetize'], array("", "0", "1"), true)) {
      check_ajax_referer( 'hellotoken_quickedit', 'quickedit_nonce' );
      update_post_meta($_POST['post_id'], '_hellotoken', $_POST['monetize']);
    }

    // trigger toggle on all posts
    // this ability has been temporarily removed: see commit 23218880c47e449d2c42151083b57925cb6c0815
    // if (isset($_POST['toggle_all_ht'])){
    //   $opposite_status = ($_POST['toggle_all_ht'] === "1" ? "0" : "1"); // stupid, but works
    //   $this->bulk_save_ht_status($this->get_ht_posts($opposite_status,
    //                                             $_POST['post_type'],
    //                                             $_POST['category_id']),
    //                                             $_POST['toggle_all_ht']);
    // }

    exit;
  }

  // alter post add/edit form
  public function alter_post_edit_form($post)
  {
    if ($post && in_array($post->post_type, array('post', 'page'))) {
      $state = get_post_meta($post->ID, '_hellotoken', true);
      $screen = get_current_screen();
      // Blank string is default value i.e. when never set before
      // Use strict comparison since otherwise would be confused with 0
      if ($state === "") {
        // If we're on an "add post" page
        if ($screen->action == "add") {
          $state = $this->getSetting("default_enable"); // go by settings
        } else {
          $state = "0"; // default to not active for other posts (i.e. posts created before HT installed)
        }
      }
      $hellotoken_monetize_hidden = '<input type="hidden" name="hellotoken_monetize" value="'.$state.'" />';
      $hellotoken_edit_nonce = wp_nonce_field("hellotoken_edit", "hellotoken_edit_nonce", true, false);
      echo $hellotoken_monetize_hidden.$hellotoken_edit_nonce;
    }
  }

  // alter post row actions - add info about monetize for listed post (in each row)
  public function alter_post_row_actions($actions, $post)
  {
    if (in_array($post->post_type, array('post', 'page')))
    {
      $state = get_post_meta($post->ID, '_hellotoken', true);
      // Blank string is default value i.e. when never set before
      // Use strict comparison since otherwise would be confused with 0
      if ($state === ""){
        // if (($post->post_type) === 'post'){
        //   $state = "1"; // Enable for posts by default
        // }
        // else{
        //   $state = "0"; // Disable for pages by default
        // }
        $state = "0";
      }
      $actions = array_merge(array(
        'hellotoken_hidden' => '<input type="hidden" name="hellotoken_monetize" value="'.$state.'" />'
      ), $actions);
    }

    return $actions;
  }

  // trigger toggle on bulk posts
  public function bulk_save_ht_status($posts, $status) {
    foreach($posts as $post){
      update_post_meta($post->ID, '_hellotoken', $status);
    }
  }

  // save post data - eg. status of for saved post
  public function save_post($post_id)
  {
    // bulk edit (from posts/pages quickaccess)
    if (isset($_GET['hellotoken_enabled']) &&
        isset($_GET['bulk_edit']) &&
        isset($_GET['post']) &&
        is_array($_GET['post'])) {
      // avoid annoying notices in certain enviornments
      $status = @$_GET['hellotoken_enabled'];
      // validate status value
      if (in_array($status, array("0", "1"), true)) {
        // validate nonce
        check_admin_referer('hellotoken_bulkedit', 'hellotoken_bulkedit_nonce');
        // and update every requested post
        foreach($_GET['post'] as $id) {
          update_post_meta($id, '_hellotoken', $status);
        }
      }
    }

    if (!in_array(@$_POST['post_type'], array('post', 'page')) ||
        !current_user_can('edit_post', $post_id) ||
        !current_user_can('edit_page', $post_id))
      return;

    // 1 enabled, 0 disabled
    if (isset($_POST['hellotoken_monetize']) &&
        in_array($_POST['hellotoken_monetize'], array("", "0", "1"), true)){
      check_admin_referer('hellotoken_edit', 'hellotoken_edit_nonce');
      // notably uses hidden field value, and not the checkbox value itself
      update_post_meta($post_id, '_hellotoken', $_POST['hellotoken_monetize']);
    }
  }

  // add scripts to the frontend
  public function wp_enqueue_scripts() {
    global $post;

    // only if is enabled for this post or page
    // post_meta uses strict comparison, since default for the meta is a blank string

    // Don't show by default, but do if activated
    $show_hellotoken = false;
    if (is_home() && $this->getSetting('homepage_enable') == "1") {
      $show_hellotoken = true;
    } elseif ((is_single() || is_page()) &&
              (get_post_meta($post->ID, '_hellotoken', true) === "1")) {
      $show_hellotoken = true;
    }

    if (!$show_hellotoken) { return; }

    wp_enqueue_script(__class__.'_hellotoken', $this->_url.'/hellotoken/hellotoken49.js', array('jquery'), self::version, false);
    wp_enqueue_style(__class__.'_style', $this->_url.'/hellotoken/style1.css', array(), self::version, false);
    wp_enqueue_script(__class__.'_analytics', $this->_url.'/3rdparty/analytics.js', array('jquery'), self::version, false);
    wp_enqueue_script(__class__, $this->_url.'/hellotoken.js', array('jquery'), self::version, false);

    wp_localize_script(__class__, __class__, array(
      'clientID' => $this->getSetting('client_id'),
      'numberClickedNeedBuy' => $this->getSetting('free_content_count'),
      'question' => $this->getSetting('question'),
      'homeLink' => $this->getSetting('homepage_url'),
      'show_delay' => (int)$this->getSetting('show_delay'),
      'is_demo' => $this->getSetting('is_demo'),
      'redirect_type' => $this->getSetting('redirect_type'),
      'redirect_url' => $this->getSetting('redirect_url'),
      'default_enable' => $this->getSetting('default_enable'),
    ));
  }

  // helper strip function
  static function strip($t)
  {
    return htmlentities($t, ENT_COMPAT, 'UTF-8');
  }

  /**
   * get all posts from a category with a certain ht_state
   * -1 or empty for category to get all posts
   * ht_state should be 0 (currently off) or 1 (currently on)
   */
  static function get_ht_posts($ht_state, $post_type = 'post', $category_id = 0, $include_unset = true)
  {
    if ($include_unset){
      $ht_status_query = array(
          'relation' => 'OR',
          array(
            'key'     => '_hellotoken',
            'value'   => 'wordpress bug #23268', // requires a value on WP versions <3.9
            'compare' => 'NOT EXISTS'
          ),
          array(
            'key'   => '_hellotoken',
            'value' => $ht_state
          ),
      );
    } else {
      $ht_status_query =
        array(
          array(
            'key'   => '_hellotoken',
            'value' => $ht_state
          )
      );
    }

    $args = array(
      'meta_query'  => $ht_status_query,
      'post_type'   => $post_type
    );

    if ($category_id != 0) {
      $args = array_merge($args,array('cat' => $category_id));
    }

    return get_posts($args);
  }


  /**
   * Send debug code to the Javascript console
   */
  static function debug_to_console($data) {
    if(is_array($data) || is_object($data)) {
      echo("<script>console.log('PHP: ".json_encode($data)."');</script>");
    } else {
      echo("<script>console.log('PHP: ".$data."');</script>");
    }
  }
}

new HelloToken();
