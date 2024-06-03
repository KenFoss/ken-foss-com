const Pool = require('pg').Pool;
// const dotenv = require('dotenv');

// dotenv.config();

// Store the password in a environment variable
const psql_pass = process.env.REACT_APP_PSQL_PASS
const databaseIP = process.env.REACT_APP_DATABASE_IP
const psqlPort = process.env.REACT_APP_PQL_PORT

const pool = new Pool({
    host : databaseIP,
    user: "kfoss",
    port: psqlPort,
    password: psql_pass,
    database: "api"
})

const createPassingStats = async (req, res) => {
    const reqData = JSON.parse(decodeURIComponent(req.query.data))
    const {
      year, player, player_id, position, team_name, player_game_count, accuracy_percent,
      aimed_passes, attempts, avg_depth_of_target, avg_time_to_throw, bats, big_time_throws,
      btt_rate, completion_percent, completions, declined_penalties, def_gen_pressures,
      drop_rate, dropbacks, drops, first_downs, franchise_id, grades_hands_fumble,
      grades_offense, grades_pass, grades_run, hit_as_threw, interceptions, passing_snaps,
      penalties, pressure_to_sack_rate, qb_rating, sack_percent, sacks, scrambles, spikes,
      thrown_aways, touchdowns, turnover_worthy_plays, twp_rate, yards, ypa
    } = reqData;
    console.log(year)
    console.log(reqData)
  
    // Define the SQL query with placeholders for values
    const insertQuery = `
      INSERT INTO passing_stats
      (year, player, player_id, position, team_name, player_game_count, accuracy_percent,
      aimed_passes, attempts, avg_depth_of_target, avg_time_to_throw, bats, big_time_throws,
      btt_rate, completion_percent, completions, declined_penalties, def_gen_pressures,
      drop_rate, dropbacks, drops, first_downs, franchise_id, grades_hands_fumble,
      grades_offense, grades_pass, grades_run, hit_as_threw, interceptions, passing_snaps,
      penalties, pressure_to_sack_rate, qb_rating, sack_percent, sacks, scrambles, spikes,
      thrown_aways, touchdowns, turnover_worthy_plays, twp_rate, yards, ypa)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
      $41, $42, $43)
      RETURNING *;
    `;
  
    const values = [
      year, player, player_id, position, team_name, player_game_count, accuracy_percent,
      aimed_passes, attempts, avg_depth_of_target, avg_time_to_throw, bats, big_time_throws,
      btt_rate, completion_percent, completions, declined_penalties, def_gen_pressures,
      drop_rate, dropbacks, drops, first_downs, franchise_id, grades_hands_fumble,
      grades_offense, grades_pass, grades_run, hit_as_threw, interceptions, passing_snaps,
      penalties, pressure_to_sack_rate, qb_rating, sack_percent, sacks, scrambles, spikes,
      thrown_aways, touchdowns, turnover_worthy_plays, twp_rate, yards, ypa
    ];
  
    try {
      const result = await pool.query(insertQuery, values);
      res.status(201).send(`Data added with ID: ${result.rows[0].id}`);
    } catch (error) {
      console.error('Error adding data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const createRushingStats = async (req, res) => {

    const reqData = JSON.parse(decodeURIComponent(req.query.data))
    // In the res data the 'data' portion of the url (so ?data=) will pass a dictionary object
    // with mappings of all the constants seen below (so "year" : 2008, "player": "Tom Brady")
    const {
        year, player, player_id, position, team_name, player_game_count, attempts, avoided_tackles, 
        breakaway_attempts, breakaway_percent, breakaway_yards, declined_penalties, designed_yards,
        drops, elu_recv_mtf, elu_rush_mtf, elu_yco, elusive_rating, explosive, first_downs, franchise_id,
        fumbles, gap_attempts, grades_hands_fumble, grades_offense, grades_offense_penalty, grades_pass, 
        grades_pass_block, grades_pass_route, grades_run, grades_run_block, longest, penalties, rec_yards,
        receptions, routes, run_plays, scramble_yards, scrambles, targets, total_touches, touchdowns, yards,
        yards_after_contact, yco_attempt, ypa, yprr, zone_attempts
    } = reqData;
  
    // Define the SQL query with placeholders for values
    const insertQuery = `
      INSERT INTO rushing_stats
      (year, player, player_id, position, team_name, player_game_count, attempts, avoided_tackles, 
      breakaway_attempts, breakaway_percent, breakaway_yards, declined_penalties, designed_yards,
      drops, elu_recv_mtf, elu_rush_mtf, elu_yco, elusive_rating, explosive, first_downs, franchise_id,
      fumbles, gap_attempts, grades_hands_fumble, grades_offense, grades_offense_penalty, grades_pass, 
      grades_pass_block, grades_pass_route, grades_run, grades_run_block, longest, penalties, rec_yards,
      receptions, routes, run_plays, scramble_yards, scrambles, targets, total_touches, touchdowns, yards,
      yards_after_contact, yco_attempt, ypa, yprr, zone_attempts)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
      $41, $42, $43, $44, $45, $46, $47, $48)
      RETURNING *;
    `;
        
    // Take the constantts defined from the data section of the url query and pass them to an array of values
    // in order, as they will fill the $NUMBER as seen in the insertquery above
    const values = [
        year, player, player_id, position, team_name, player_game_count, attempts, avoided_tackles, 
        breakaway_attempts, breakaway_percent, breakaway_yards, declined_penalties, designed_yards,
        drops, elu_recv_mtf, elu_rush_mtf, elu_yco, elusive_rating, explosive, first_downs, franchise_id,
        fumbles, gap_attempts, grades_hands_fumble, grades_offense, grades_offense_penalty, grades_pass, 
        grades_pass_block, grades_pass_route, grades_run, grades_run_block, longest, penalties, rec_yards,
        receptions, routes, run_plays, scramble_yards, scrambles, targets, total_touches, touchdowns, yards,
        yards_after_contact, yco_attempt, ypa, yprr, zone_attempts
    ];
  
    try {
      const result = await pool.query(insertQuery, values);
      res.status(201).send(`Data added with ID: ${result.rows[0].id}`);
    } catch (error) {
      console.error('Error adding data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const addAudioFile = async (req, res) => {
    
    const reqQueryData = decodeURIComponent(req.query);

    const {
      isPodcast, isSong, isDaily, newName, location
    } = req.query;

    const insertQuery = `
      INSERT INTO audio_files 
      (category, daily, name, location)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    let newCategory = 'uncategorized';

    if (isSong == 'true') {
      newCategory = 'song'
    } else if (isPodcast == 'true') {
      newCategory = 'podcast'
    }

    const values = [
      newCategory, isDaily, newName, location
    ]

    try {
      const result = await pool.query(insertQuery, values);
      res.status(201).send(`Audio file added with ID: ${result.rows[0].id}`);
    } catch (error) {
      console.error('Error adding data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

  } 

  const removeAudioFile = async(req, res) => {
    audio_id = req.query.audio_id
    
    const deleteQuery = `
      DELETE FROM audio_files
      WHERE id = $1
      RETURNING *
    `
    try {
      const result = await pool.query(deleteQuery, [audio_id]);
      
      if (result.rows.length === 0) {
        // If no rows were affected, it means the resource was not found
        res.status(404).json({
          error: "Resource not found. Unable to delete."
        });
      } else {
        // Successful deletion
        res.status(203).json({
          id: result.rows[0].id,
          message: `Resource with name ${result.rows[0].name} successfully deleted`
        });
      }
    } catch (error) {
      // Handle other types of errors (e.g., database connection issues)
      res.status(500).json({
        error: "Internal Server Error"
      });
    }

  }


module.exports = {
    createPassingStats,
    createRushingStats,
    addAudioFile,
    removeAudioFile
}
