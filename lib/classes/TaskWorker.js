const fs = require('fs');

module.exports = class TaskWorker {
  constructor(path) {
    this.path = `${path}/`;
  }

  create = function(id, data) {
    const task = {
        id: id,
        task: data.task,
        date: data.date,
        created_by: data.created_by,
        status: 'new',
        token: data.token
    }

    fs.writeFile(this.path + task.id, JSON.stringify(task), function(err) {
        if (err) console.error(err);
    });
  }

  complete = function(id) {
    const task_file = this.path + id;

    fs.readFile(task_file, 'utf8', function(err, t) {
        if (err) console.log(err);

        let task = JSON.parse(t);
        task.status = 'complete';

        fs.writeFile(task_file, JSON.stringify(task), function(err) {
            if (err) console.error(err);
        });

    });
  }

  load = async function() {
      const { readdir } = require('fs').promises;
      const results = [];

      let items = await readdir(this.path);
      for (const item of items) {
        fs.readFile(this.path + item, 'utf8', function(err, task) {
          if (err) { console.log(err); }
          results.push(JSON.parse(task));
        });
      }
    
      return results;
  }
}