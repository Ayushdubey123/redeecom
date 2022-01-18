
let mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
    console.info('Well! server is connected with database!');
}).on('error', error => {
    console.log('mongoConnection Error: ' + error);
});

module.exports = mongoose;