module.exports = class User {
    constructor(id, name, password, created) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.created = created;
    }
}