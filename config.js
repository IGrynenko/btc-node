const config = {};

config.host = '127.0.0.1';
config.port = 3000;
config.tokenKey = '1a2b-3c4d-5e6f-7g8h';

config.tables = {};

config.tables.users = {};
config.tables.users.usersPath = 'D:\\BTC\\Users123.csv';
config.tables.users.headers = [
    { id: 'id', title: 'Id' },
    { id: 'name', title: 'Name' },
    { id: 'password', title: 'Password' },
    { id: 'created', title: 'Created' }
];

config.coinApi = {};
config.coinApi.path = 'https://rest.coinapi.io/';
config.coinApi.key = '36841ECC-2E4A-41ED-92BE-68372717978D';

module.exports = config;