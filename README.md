# rest-it
REST API testing made easy. Uses `Cucumber` for BDD styled testing and visionmedia's `Superagent` to make requests.
With this style, tests should be fairly easy to read and maintain. Once basic setup is done, not much programming required to actually write the tests.

Project is in very early stages. Currently, working on a better matcher and working examples.

### How to use

All this project has are basic steps (i.e step definitions) required for any REST api such as making requests with various verbs, checking error codes, matching responses, etc. Any custom steps, such as using dummy users can be added easily by adding steps in the step definitions. 

The `world.js` file is pretty much a stub and you should use it for your setup/teardown functions.

You can extract and inject variables into requests and responses. This allows you to chain multiple requests where you can use the response of a request to make another request.

`${variableName}` - extract the value from a response

`$variableName` - apply the value in a request/response

### Example

Here is a sample of how an test for an OAuth 2.0 Client Credential flow would look like. Since the routes are just representative and not real, this test would never run.

```gerkhin
@ClientCredential
Feature: The OAuth 2.0 Client Credential credentials flow       

    Scenario: provides tokens to registered clients
        When the user requests "POST" "http://localhost:8081/api/client/register" with data
        """
        {
            "clientName": "test-client",
            "scopes": [
                "read",
                "write"
            ]
        }
        """ 
        Then the response should be
        """
        {
          "clientName": "test-client",
          "scopes": [
            "read",
            "write"
          ],
          "clientId": "${clientId}", // save the actual client ID and secret
          "clientSecret": "${clientSecret}"
        }
        """
        Then the user requests "POST" "http://localhost:8081/api/oauth/token" with data
        """
        {
            "grant_type": "client_credentials",
            "client_id": "$clientId", // use the saved ID and secret
            "client_secret": "$clientSecret"
        }
        """
        And headers
        """
        {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        """
        Then the response should be
        """
        {
          "access_token": "${accessToken}",
          "token_type": "Bearer",
          "expires_in": 3600,
          "scope": "read write"
        }
        """
        When the user requests "DELETE" "http://localhost:8081/api/client/$clientId"
        Then the response should be
        """
        {
          "title": "Success",
          "message": "Client with id $clientId deleted successfully."
        }
        """

    Scenario: example token usage (with sufficient permissions)
        When the user requests "POST" "http://localhost:8081/api/client/register" with data
        """
        {
            "clientName": "test-client",
            "scopes": [
                "read",
                "write"
            ]
        }
        """ 
        Then the response should be
        """
        {
          "clientName": "test-client",
          "scopes": [
            "read",
            "write"
          ],
          "clientId": "${clientId}",
          "clientSecret": "${clientSecret}"
        }
        """
        Then the user requests "POST" "http://localhost:8081/api/oauth/token" with data
        """
        {
            "grant_type": "client_credentials",
            "client_id": "$clientId",
            "client_secret": "$clientSecret"
        }
        """
        And headers
        """
        {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        """
        Then the response should be
        """
        {
          "access_token": "${accessToken}",
          "token_type": "Bearer",
          "expires_in": 3600,
          "scope": "read write"
        }
        """
        Then the user requests "GET" "http://localhost:8081/api/services/hello"
        And headers
        """
        {
            "Authorization": "Bearer $accessToken",
            "Accept": "text/plain" 
        }
        """
        Then the response should be
        """
        {
            "hello": "world"
        }
        """
        And the user requests "DELETE" "http://localhost:8081/api/client/$clientId"
        Then the response should be
        """
        {
          "title": "Success",
          "message": "Client with id $clientId deleted successfully."
        }
        """

    Scenario: example token usage (with insufficient permissions)
        When the user requests "POST" "http://localhost:8081/api/client/register" with data
        """
        {
            "clientName": "test-client-2",
            "scopes": [
                "read"
            ]
        }
        """ 
        Then the response should be
        """
        {
          "clientName": "test-client-2",
          "scopes": [
            "read"
          ],
          "clientId": "${clientId}",
          "clientSecret": "${clientSecret}"
        }
        """
        Then the user requests "POST" "http://localhost:8081/api/oauth/token" with data
        """
        {
            "grant_type": "client_credentials",
            "client_id": "$clientId",
            "client_secret": "$clientSecret"
        }
        """
        And headers
        """
        {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        """
        Then the response should be
        """
        {
          "access_token": "${accessToken}",
          "token_type": "Bearer",
          "expires_in": 3600,
          "scope": "read"
        }
        """
        Then the user requests "GET" "http://localhost:8081/api/services/hello"
        And headers
        """
        {
            "Authorization": "Bearer $accessToken",
            "Accept": "text/plain" 
        }
        """
        Then the response with code "403" should be
        """
        {

        }
        """
        And the user requests "DELETE" "http://localhost:8081/api/client/$clientId"
        Then the response should be
        """
        {
          "title": "Success",
          "message": "Client with id $clientId deleted successfully."
        }
        """
```

### Need Help?

I know the documentation is very limited, mainly due to a complete lack of working examples. I will try adding some meaningful tests that you can run asap. Till then, feel free to open an issue and post your query.

### Contribution

Feel free to make this project your own. There is plenty of scope to optimize the code and many cases that it does not cover. Even the matcher that is used to match responses can be improved. So feel free to contribute.
