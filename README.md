# Formula 1 Data API

## Overview

This project is an API for querying F1 data including circuits, constructors, drivers, races and results. The API is built using Node.js and Express, with data stored in an SQLite database containing historical Formula 1 racing information.

## Built with

**Node.js** - JS runtime  
**Express** - Routing  
**SQLite3** - For deployment using the provided F1 database  

## API Endpoints

| API Endpoint | Description |
|-------------|-------------|
| `/api/circuits` | Get all circuits |
| `/api/circuits/:ref` | Get circuit by ID (e.g., monaco) |
| `/api/circuits/season/:year` | Get all circuits used in a given season |
| `/api/constructors` | Get all constructors |
| `/api/constructors/:ref` | Get constructor by reference (e.g., mclaren) |
| `/api/drivers` | Get all drivers |
| `/api/drivers/:ref` | Get driver by reference (e.g., hamilton) |
| `/api/drivers/search/:substring` | Get drivers whose surname begins with substring |
| `/api/drivers/race/:raceId` | Get all drivers in a specific race |
| `/api/races/:raceId` | Get race details with circuit information |
| `/api/races/season/:year` | Get all races in a season ordered by round |
| `/api/races/season/:year/:round` | Get specific race by season and round number |
| `/api/races/circuits/:ref` | Get all races for a circuit ordered by year |
| `/api/races/circuits/:ref/season/:start/:end` | Get races for a circuit between years |
| `/api/results/:raceId` | Get race results with driver and constructor details |
| `/api/results/driver/:ref` | Get all results for a specific driver |
| `/api/results/drivers/:ref/seasons/:start/:end` | Get driver results between seasons |
| `/api/qualifying/:raceId` | Get qualifying results for a race |
| `/api/standings/drivers/:raceId` | Get driver standings after a specific race |
| `/api/standings/constructors/:raceId` | Get constructor standings after a specific race |

## Example API Requests

### Test Links

- [/api/circuits](http://localhost:3000/api/circuits)
- [/api/circuits/monza](http://localhost:3000/api/circuits/monza)
- [/api/circuits/calgary](http://localhost:3000/api/circuits/calgary)
- [/api/constructors](http://localhost:3000/api/constructors)
- [/api/constructors/ferrari](http://localhost:3000/api/constructors/ferrari)
- [/api/drivers](http://localhost:3000/api/drivers)
- [/api/drivers/Norris](http://localhost:3000/api/drivers/Norris)
- [/api/drivers/norris](http://localhost:3000/api/drivers/norris)
- [/api/drivers/connolly](http://localhost:3000/api/drivers/connolly)
- [/api/drivers/search/sch](http://localhost:3000/api/drivers/search/sch)
- [/api/drivers/search/xxxxx](http://localhost:3000/api/drivers/search/xxxxx)
- [/api/drivers/race/1069](http://localhost:3000/api/drivers/race/1069)
- [/api/races/1034](http://localhost:3000/api/races/1034)
- [/api/races/season/2021](http://localhost:3000/api/races/season/2021)
- [/api/races/season/1800](http://localhost:3000/api/races/season/1800)
- [/api/races/season/2020/5](http://localhost:3000/api/races/season/2020/5)
- [/api/races/season/2020/100](http://localhost:3000/api/races/season/2020/100)
- [/api/races/circuits/7](http://localhost:3000/api/races/circuits/7)
- [/api/races/circuits/7/season/2015/2022](http://localhost:3000/api/races/circuits/7/season/2015/2022)
- [/api/races/circuits/7/season/2022/2022](http://localhost:3000/api/races/circuits/7/season/2022/2022)
- [/api/results/1106](http://localhost:3000/api/results/1106)
- [/api/results/driver/max_verstappen](http://localhost:3000/api/results/driver/max_verstappen)
- [/api/results/driver/connolly](http://localhost:3000/api/results/driver/connolly)
- [/api/results/drivers/sainz/seasons/2021/2022](http://localhost:3000/api/results/drivers/sainz/seasons/2021/2022)
- [/api/results/drivers/sainz/seasons/2035/2022](http://localhost:3000/api/results/drivers/sainz/seasons/2035/2022)
- [/api/qualifying/1106](http://localhost:3000/api/qualifying/1106)
- [/api/standings/drivers/1120](http://localhost:3000/api/standings/drivers/1120)
- [/api/standings/constructors/1120](http://localhost:3000/api/standings/constructors/1120)
- [/api/standings/constructors/asds](http://localhost:3000/api/standings/constructors/asds)

## Project Structure

| File | Description |
|------|-------------|
| `server.js` | Main server file containing all API routes and database queries |
| `data/f1.db` | SQLite database containing F1 data including circuits, drivers, constructors, races, results, qualifying, and standings |
| `package.json` | Node.js dependencies and project configuration |
| `README.md` | Project documentation (this file) |

## Installation & Setup

1. Clone the repository
```bash
git clone [repository-url]
cd [project-directory]
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
node server.js
```

The API will be available at `http://localhost:3000`

## Database Schema

The SQLite database contains the following main tables:
- **circuits**: Race track information
- **constructors**: Team/constructor data  
- **drivers**: Driver information
- **races**: Individual race details
- **results**: Race results including positions and points
- **qualifying**: Qualifying session results
- **driverStandings**: Championship standings for drivers
- **constructorStandings**: Championship standings for constructors
- **status**: Race finish status types

## Error Handling

The API implements comprehensive error handling:
- Returns 404 with JSON error message for not found resources
- Returns 400 for invalid parameters (e.g., non-integer IDs, invalid date ranges)
- All responses are in JSON format for consistency

## Testing

Test the API endpoints using:
- Browser for GET requests
- Postman or similar API testing tools
- curl commands from terminal

Example:
```bash
curl http://localhost:3000/api/drivers/hamilton
```

## Notes

- Data coverage is most complete for seasons 2019-2023
- All date comparisons are inclusive
- Sorting follows F1 conventions (grid/position ascending = 1st place first)
- Case-insensitive surname searches supported
