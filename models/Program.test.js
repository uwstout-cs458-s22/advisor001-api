global.jest.init(false); // Init without models
global.jest.init_db();
const { dataForGetProgram, db } = global.jest;

const Program = require('./Program');

