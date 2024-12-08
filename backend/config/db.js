require('dotenv').config();
const { Sequelize } = require('sequelize');

// PostgreSQL connection using Sequelize
const sequelize = new Sequelize(
  process.env.POSTGRES_DB,      // Database name
  process.env.POSTGRES_USER,    // User
  process.env.POSTGRES_PASSWORD,// Password
  {
    host: 'localhost',         // PostgreSQL host
    dialect: 'postgres',       // Dialect
    logging: false             // Disable logging
  }
);

sequelize.authenticate()
  .then(() => console.log("Postgresql connected"))
  .catch((error) => console.error("Error connecting to Postgresql:", error));

// Sync PostgreSQL database
sequelize.sync({alter : true})
.then(() => console.log('PostgreSQL synced successfully'))
.catch((err) => {
  console.error('PostgreSQL connection error:', err);
  process.exit(1); // Exit the process with an error code
});


module.exports = { sequelize }; // Export sequelize as an object
