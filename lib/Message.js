module.exports = class Message {
    constructor(id, from) {
    	this.id = this._generateID(5)
        this.from = from
        this.created = (new Date()).toUTCString()
    }

    getMessages = function() {
        return JSON.stringify({

        })
    }

    _generateID = function(length) {
        let id = ''
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let charactersLength = characters.length
    
        for (let i = 0; i < length; i++) {
            id += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
    
        return id
    }   



}
