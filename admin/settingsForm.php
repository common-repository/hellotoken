<!-- see form6.js for appropriate values being filled in-->
<form class="hellotoken-form">
  <input type="hidden" name="hellotoken_form" value="1" />
  <div class="hellotoken-tab-content hellotoken-active-tab-content" data-section="general">
    <h3 id="hellotoken-necessary-title"></h3>
    <table class="hellotoken-form-table">
      <tr>
        <th>
          <label for="hellotoken_client_id"></label>
        </th>
        <td>
          <input type="text" class="hellotoken-website"
                 name="hellotoken_client_id" id="hellotoken_client_id"
                 value="" placeholder="ClientID from HelloToken profile" />
        </td>
      </tr>
      <tr>
        <th></th>
        <td class="hellotoken-table-padding">
          <i>You can obtain your Client ID from your<br>
            HelloToken profile page.</i>
        </td>
      </tr>
    </table>
    <h3 id="hellotoken-default_enable-title"></h3>
    <table class="hellotoken-form-table">
      <tr>
        <td id="hellotoken_redirect_container">
          <div name="hellotoken-form" class="hellotoken_default_enable" id="hellotoken-default_enable-form">
            <input type="radio" name="hellotoken_default_enable" id="hellotoken_radio1" value="1">
              <label for="hellotoken_radio1"></label></br>
            <input type="radio" name="hellotoken_default_enable" id="hellotoken_radio0" value="0">
              <label for="hellotoken_radio0"></label></br>
          </div>
        </td>
      </tr>
    </table>
    <h3 id="hellotoken-redirect-title"></h3>
    <table class="hellotoken-form-table">
      <tr>
        <th>
          <label for="hellotoken_redirect_type"></label>
        </th>
      </tr>
      <tr>
        <td id="hellotoken_redirect_container">
          <select id="hellotoken_redirect_type" name="hellotoken_redirect_type" form="hellotoken-form">
            <option value="0"></option>
            <option value="1"></option>
            <option value="2"></option>
          </select>
          <input type="text" id="hellotoken_redirect_url" name="hellotoken_redirect_url" placeholder="Put custom URL here" size="84">
        </td>
      </tr>
    </table>
  </div>

  <!-- TAB TWO -->

  <div class="hellotoken-tab-content" data-section="advanced">
    <h3 id="hellotoken-demo-title"></h3>
    <table class="hellotoken-form-table">
      <tr>
        <th>
          <label for="hellotoken_is_demo"></label>
        </th>
        <td>
          <input type="checkbox" title="Demo?" class="hellotoken-demo"
                 name="hellotoken_is_demo" id="hellotoken_is_demo">
        </td>
      </tr>
    </table>
    <h3 id="hellotoken-extra-title"></h3>
    <table class="hellotoken-form-table">
        <tr>
          <th>
            Enable HelloToken on your homepage?
          </th>
          <td>
            <input type="checkbox" class="hellotoken-homepage_enable"
                   name="hellotoken-homepage_enable"
                   id="hellotoken-homepage_enable"
                   value="1">
          </td>
        </tr>
      <tr>
        <th>
            <label for="hellotoken_free_content_count"></label>
        </th>
        <td>
          <input type="number" class="hellotoken-pass"
                 name="hellotoken_free_content_count"
                 id="hellotoken_free_content_count"
                 value="" min="0" max="20" step="1"
                 title="[template]texts.free_content_count_desc" />
        </td>
      </tr>
        <th>
            <label for="hellotoken_show_delay"></label>
        </th>
        <td>
          <input type="number" class="hellotoken-pass"
                 name="hellotoken_show_delay" id="hellotoken_show_delay"
                 value="" min="0" max="20" step="1"
                 title="[template]texts.show_delay_desc" /> second(s)
        </td>
      </tr>
      <tr>
        <th>
          <label>Enable/disable HelloToken on all articles (only affects Posts)</label>
        </th>
        <td>
          <!-- for some freaky reason, actually making these buttons
               causes the page to change, so just pretend they're buttons -->
          <div class="button hellotoken-button-green"
               id="hellotoken-all-enable">Enable on all</div>
          <div class="button hellotoken-button-red"
               id="hellotoken-all-disable">Disable on all</div>
        </td>
      </tr>
    </table>
  </div>
</form>
