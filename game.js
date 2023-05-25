const crypto = require("crypto");

class Game {
  constructor(moves) {
    this.moves = moves;
    this.table = this.generateTable();
  }

  generateTable() {
    const table = [["\\", ...this.moves]];

    for (let i = 0; i < this.moves.length; i++) {
      const row = [this.moves[i]];
      for (let j = 0; j < this.moves.length; j++) {
        row.push(this.calculateResult(i, j));
      }
      table.push(row);
    }

    return table;
  }

  calculateResult(move1, move2) {
    if (move1 === move2) {
      return "Draw";
    }

    const half = this.moves.length / 2;

    if (
      (move1 < move2 && move2 <= move1 + half) ||
      (move1 > move2 && move1 + half < move2)
    ) {
      return "Win!";
    }

    return "Lose";
  }

  printTable() {
    const maxLength = Math.max(...this.moves.map((move) => move.length));
    const formattedTable = this.table.map((row) =>
      row.map((cell) => cell.padEnd(maxLength)).join(" | ")
    );

    console.log(formattedTable);
  }
}

class Hash {
  static hashgenerator() {
    return crypto.randomBytes(32).toString("hex");
  }

  static HMAC(input, key) {
    const hmac = crypto.createHmac("sha256", key);
    hmac.update(input);
    return hmac.digest("hex");
  }
}

class GameRun {
  constructor(moves) {
    this.game = new Game(moves);
    this.key = Hash.hashgenerator();
  }

  generateComputerMove() {
    const indexMove = Math.floor(Math.random() * this.game.moves.length);
    return this.game.moves[indexMove];
  }

  printMenu() {
    console.log("Available moves:");
    this.game.moves.forEach((move, index) => {
      console.log(`${index + 1} - ${move}`);
    });
    console.log("0 - exit");
    console.log("? - help");
  }

  printWinner(userMove, computerMove) {
    const result =
      this.game.table[this.game.moves.indexOf(userMove) + 1][
        this.game.moves.indexOf(computerMove) + 1
      ];

    console.log(result);

    if (result === "Win") {
      console.log("You win!");
    } else if (result === "Lose") {
      console.log("You lose!");
    } else {
      console.log("It's a draw!");
    }

    console.log(`HMAC key: ${this.key}`);
  }

  run() {
    const computerMove = this.generateComputerMove();
    const hmac = Hash.HMAC(computerMove, this.key);

    console.log(`HMAC: ${hmac}`);
    this.printMenu();
    this.userMove(computerMove);
  }

  userMove(computerMove) {
    const stdin = process.stdin;
    stdin.setEncoding("utf8");

    stdin.on("data", (input) => {
      input = input.trim();

      if (input === "0") {
        console.log("Exiting the game.");
        process.exit(0);
      } else if (input === "?") {
        this.game.printTable();
      } else if (
        !isNaN(input) &&
        input >= 1 &&
        input <= this.game.moves.length
      ) {
        const userMove = this.game.moves[input - 1];
        this.printMoves(userMove, computerMove);
        this.printWinner(userMove, computerMove);
      } else {
        console.log("Invalid input. Please try again.");
      }
    });

    console.log("Enter your move:");
  }

  printMoves(userMove, computerMove) {
    console.log(`Your move: ${userMove}`);
    console.log(`Computer move: ${computerMove}`);
  }
}

const moves = process.argv.slice(2);

if (
  moves.length < 3 ||
  moves.length % 2 !== 1 ||
  new Set(moves).size !== moves.length
) {
  console.log(
    "Invalid arguments. Please provide an odd number of unique moves."
  );
} else {
  const gameRunner = new GameRun(moves);
  gameRunner.run();
}
