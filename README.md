# servicenow-gas-oauth-sample

ServiceNow OAuth implementation example using GAS.

## Setup

### first step - GAS

1. [Create Project](https://script.new)
2. Make a note of the script ID from Settings > ID
      It will appear in step 4 of the next step.

### second step - ServiceNow

1. Log in to your ServiceNow instance
2. Access All > System OAuth > Application Registry
3. Create a record and select the "Create an OAuth API endpoint for external clients"
4. Enter the values as follows:
   | Field name | Value |
   | ---------- | ----- |
   | Name       | Any value |
   | Client Secret | Optional (ServiceNow will generate a random one if you don't enter one) |
   | Redirect URL | Copy the script ID created in GAS and enter "https://script.google.com/macros/d/<<GAS_SCRIPT_URL>>/usercallback". |
6. Click Submit to save.
7. Note down your Client ID and Client Secret
     It will appear in step 2 of the next step.

### last step - GAS

1. Script Copy and paste `./example/code.js`
2. Replace lines 1 to 3 with your instance's Client ID and Client Secret from the previous step.

Setup completed.
Try deploying it as a web application

## Using library 
- [googleworkspace/apps\-script\-oauth2: An OAuth2 library for Google Apps Script\.](https://github.com/googleworkspace/apps-script-oauth2)
