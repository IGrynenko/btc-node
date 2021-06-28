# btc-node

## API

**/user/create**
Allows to create a new user by sending a User-type object, containing fields 'name' and 'password.

**/user/login**
Allows to get a valid token if a user exists. Requires a User-type object, containing fields 'name' and 'password.

**/btcRate**
Fetches a latest BTC/UAH rate. Requires a valid token to proceed.