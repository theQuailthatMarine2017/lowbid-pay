const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;

if (cluster.isMaster) {

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {

    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {

    const express = require('express');
    var cors = require('cors');
    var bodyParser = require('body-parser');
    const app = express();
    const port = 4001;

    var origins = ['https://lowbids.co.ke'];

    app.use(cors({
      origin: origins
    }));

    app.use(bodyParser.json({limit: '50mb'}));
    app.use(express.urlencoded({ extended: true },{limit: '50mb'}));

    require('./routes/routes')(app);

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`)
    });

  console.log(`Worker ${process.pid} started`);
}