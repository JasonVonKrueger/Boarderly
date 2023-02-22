const fs = require('fs');

module.exports = class EventWorker {
  constructor(path) {
    this.path = `${path}/`;
  }

  create = function(id, data) {
    const event = {
        id: id,
        event: data.event,
        date: data.date,
        time: data.time,
        created_on: data.created_on,
        created_by: data.created_by,
        status: 'new',
        token: data.token
    }

    fs.writeFile(this.path + event.id, JSON.stringify(event), function(err) {
        if (err) console.error(err);
    });
  }

  complete = function(id) {
    const event_file = this.path + id;

    fs.readFile(event_file, 'utf8', function(err, t) {
        if (err) console.log(err);

        let event = JSON.parse(t);
        event.status = 'complete';

        fs.writeFile(event_file, JSON.stringify(event), function(err) {
            if (err) console.error(err);
        });

    });
  }

  load = async function() {
      const { readdir } = require('fs').promises;
      const results = [];

      let items = await readdir(this.path);
      for (const item of items) {
        fs.readFile(this.path + item, 'utf8', function(err, event) {
          if (err) { console.log(err); }
          results.push(JSON.parse(event));
        });
      }
    
      return results;
  }
}