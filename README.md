## Stats Graphics Repository

This repository contains a TypeScript application designed to fetch, process, and generate CSV files containing player statistics for competitive matches. It leverages GraphQL to query match statistics, calculates averages, and groups players by their performance tiers.

### Features

- Fetch player match statistics using GraphQL.
- Calculate average player statistics across multiple matches.
- Group players by performance tiers.
- Generate CSV files with player statistics for easy analysis and sharing.

### How to Use

1. **Setup**: Ensure you have Node.js installed on your system. Clone this repository and run `yarn install` to install dependencies.

2. **Configuration**: Modify the `index.ts` file to specify the season, match days, and the number of top players per tier you want to fetch statistics for.

3. **Running the Application**: Execute `yarn start` to run the application. This will fetch the player statistics, process them, and generate a CSV file in the root directory of the project.

4. **CSV Output**: The generated CSV file will contain columns for Tier, Name, TeamClanName, MatchCount, Rating, Rounds (TRounds, CtRounds, Total Rounds), Ratings (TRating, CtRating, Average Rating), ADR (Adr, CtADR, TADR), Kills (Total Kills, TKills, CtKills), Deaths (Total Deaths, TDeaths, CtDeaths), and MatchDays.

### Dependencies

- TypeScript for application development.
- `ts-node` for executing TypeScript files directly.
- GraphQL for fetching player match statistics.

### Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues to suggest improvements or add new features.

### License

This project is licensed under the MIT License. See the LICENSE file for more details.
