const fs = require('fs');

module.exports = class MessageWorker {
  constructor(path) {
    this.path = `${path}/`;
  }

  create = function(id, data) {
    const message = {
        id: id,
        from: data.from,
        message: data.message,
        date: data.date,
        token: data.token,
        file_name: data.file_name
    };

    fs.writeFile(this.path + message.id, JSON.stringify(message), function(err) {
        if (err) console.error(err);
    });

  }

  load = async function() {
    const { readdir } = require('fs').promises;
    const results = [];

    let items = await readdir(this.path);
    for (const item of items) {
        fs.readFile(this.path + item, 'utf8', function(err, message) {
            if (err) console.log(err);

            results.push(JSON.parse(message));
        });
    }

    return results;
  }

}