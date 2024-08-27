const DOMAIN = "instance_name.service-now.com";
const CLIENT_ID = "your application client id";
const CLIENT_SECRET = "your application client secret";

/**
 * Handles GET requests to the web app.
 * 
 * This function manages the authentication flow, logout process, and renders
 * appropriate HTML based on the user's authentication status and actions.
 * 
 * @param {Object} e - The event object passed to the function.
 * @param {Object} e.parameter - The URL parameters passed to the function.
 * @param {string} [e.parameter.action] - The action parameter, used to trigger logout.
 * 
 * @returns {GoogleAppsScript.HTML.HtmlOutput} The HTML content to be displayed.
 */
function doGet(e) {
  const service = getService_();
  const scriptUrl = ScriptApp.getService().getUrl();
  if (service.hasAccess() && e.parameter.action !== "logout") {
    console.log(service);
    const resetHTML = `<button onclick="logout()">Logout</button>
    <button onClick="action()">Auth check(API Test)</button>
    <div id="log"></div>
    <script>
        function logout() {
          window.top.location.href = '${scriptUrl}?action=logout';
        }
        const log = document.querySelector("#log");
        const action = () => google.script.run
          .withSuccessHandler((e)=>log.innerHTML = "<pre>" + e + "</pre>")
          .withFailureHandler((e)=>log.innerHTML = e)
          .apiTest();
      </script>
    `;
    return HtmlService.createHtmlOutput(`<h1>Success</h1>${resetHTML}`);
  } else if (e.parameter.action === "logout"){
    console.log(`token is reset.`);
    service.reset();
    return HtmlService.createHtmlOutput(`
      <p>You have been logged out.</p>
      <p><a href="javascript:void(0);" onClick="redirect()">Return to login screen</a></p>
      <script>
        const redirect = () => window.top.location.href = "${scriptUrl}";
      </script>
    `);
  }
  // Not authentication
  const authorizationUrl = service.getAuthorizationUrl();
  const template = '<a href="' + authorizationUrl + '" target="_blank">Authenticate with ServiceNow</a>';
  return HtmlService.createHtmlOutput(template);
}

/**
 * Creates and configures an OAuth2 service for ServiceNow.
 * 
 * This function sets up the OAuth2 service with the necessary parameters
 * for authenticating with ServiceNow. It uses predefined constants for
 * the ServiceNow domain, client ID, and client secret.
 * 
 * @returns {OAuth2.Service} A configured OAuth2 service object for ServiceNow.
 * 
 * @see {@link https://github.com/googleworkspace/apps-script-oauth2 | OAuth2 Library}
 */
function getService_(){
  // create OAuth2 service
  return OAuth2.createService('servicenow')
    .setAuthorizationBaseUrl(`https://${DOMAIN}/oauth_auth.do`)
    .setTokenUrl(`https://${DOMAIN}/oauth_token.do`)
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)
    .setCallbackFunction('authCallback_')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setGrantType('authorization_code') 
    .setScope('useraccount');
}

/**
 * Handles the OAuth2 callback after user authorization.
 * 
 * This function is called by the OAuth2 service after the user has granted or denied
 * permission. It processes the authorization response and provides appropriate feedback
 * to the user.
 * 
 * @param {Object} request - The request object containing the OAuth2 callback parameters.
 * @returns {GoogleAppsScript.HTML.HtmlOutput} An HTML output with a message indicating 
 *                                             the success or failure of the authentication.
 */
function authCallback_(request) {
  const service = getService_();
  const authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Authentication was successful, please close the window.');
  }
  return HtmlService.createHtmlOutput(`Authentication failed, please close the window. If you don't know why, contact your administrator.`);
}

/**
 * Performs a test API call to ServiceNow to fetch user group information.
 * 
 * This function authenticates with ServiceNow using OAuth2, then makes an API call
 * to retrieve information about user groups. It fetches the name, active status,
 * creation details, and limits the results to 10 entries.
 * 
 * @returns {string} A JSON string containing the fetched user group data, formatted with indentation.
 * @throws {Error} Throws an error if the API call fails or if parsing the response fails.
 */
function apiTest() {
  const service = getService_();
  const token = service.getAccessToken();
  const appUrl = `https://${DOMAIN}/api/now/table/sys_user_group?sysparm_fields=name%2Cactive%2Csys_created_by%2Csys_created_on&sysparm_limit=10`;
  const response = UrlFetchApp.fetch(appUrl,
    {
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
  const result = JSON.parse(response.getContentText());
  const data = JSON.stringify(result.result, null, 2);
  return data;
}
