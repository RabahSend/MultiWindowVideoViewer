export class WindowManager {
  moves: string[] = [];

  constructor() {
    this.initializeMoves();
  }

  initializeMoves() {
    this.moves = [];
  }

  addMove(move: string) {
    this.moves.push(move);
  }

  // Basic movements
  moveTo(x: number, y: number) {
    this.addMove("M " + x.toString() + " " + y.toString());
    return this;
  }

  lineTo(x: number, y: number) {
    this.addMove("L " + x.toString() + " " + y.toString());
    return this;
  }

  closePath() {
    this.addMove('Z');
    return this;
  }

  // Output
  toString() {
    return this.moves.join(' ');
  }
}