const Pool = require('pg').Pool;
const fs = require('fs');
// const dotenv = require('dotenv');

// dotenv.config();


// Store the password in a environment variable
const psql_pass = process.env.REACT_APP_PSQL_PASS
const databaseIP = process.env.REACT_APP_DATABASE_IP
const psql_Port = process.env.REACT_APP_PSQL_PORT

const pool = new Pool({
    host : databaseIP,
    user: "kfoss",
    port: psql_Port,
    password: psql_pass,
    database: "api"
})

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users', (error, results) => {
        if (error) {
          throw error
        }
        response.status(200).json(results.rows)
      })
}

 // This is a paginated query that will get a specified page of the size pageSize of a given audio category
 const getAudioFiles = async(req, res) => {

  const {
    audioCategory, 
    page = 1,
    pageSize = 5 
  } = req.query

  let offset = (page - 1) * pageSize;

  let query = null;

  if (audioCategory !== 'all') {
    query = {
      text: `
        SELECT *
        FROM audio_files
        WHERE category = $1
        ORDER BY id
        LIMIT $2 OFFSET $3
      `,
      values: [audioCategory, pageSize, offset],
    }
  } else {
    query = {
      text: `
        SELECT *
        FROM audio_files
        ORDER BY id
        LIMIT $1 OFFSET $2
      `,
      values: [pageSize, offset],
    };
  }

  try {
    const result = await pool.query(query);

    if (result.rows.length === 0 && offset > 0) {
      // No data found for the requested page, and it's not the first page
      res.status(404).json({ error: 'Requested page not found' });
    } else {
      // Respond with the paginated data
      res.status(200).json({
        page,
        pageSize,
        totalItems: result.rows.length,
        data: result.rows,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAudioLength = async(req, res) => {
  const category = req.query.category
  console.log(`category is ${category}`)

  let query = ''

  if(category != 'all'){
    query = `
      SELECT COUNT(*) FROM audio_files WHERE category = '${category}'
    `;
  } else {
    query = `
      SELECT COUNT(*) FROM audio_files
    `;
  }

  try{
    const result = await pool.query(query);
    
    // Accessing the count directly from the result
    // const audioLength = result.rows[0].count;

    res.status(200).json({ result });
  } catch (error) {
    console.error("Error getting audio length:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }

}

module.exports = {
  getUsers,
  getAudioFiles,
  getAudioLength
}
