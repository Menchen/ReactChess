import React from 'react';
import './Piece.css';

const pieces = ["p","n","b","r","q","k","P","N","B","R","Q","K"] as const;
type PieceType = typeof pieces[number];
type PieceTypeWithBlank = PieceType | "_";


interface IPieceProps{
// Forsyth–Edwards Notation
  type:PieceTypeWithBlank;
}
const piece2Symbol = new Map<PieceTypeWithBlank,string>([
  ["K","♔"],
  ["Q","♕"],
  ["R","♖"],
  ["B","♗"],
  ["N","♘"],
  ["P","♙"],
  ["_"," "],
  ["k","♚"],
  ["q","♛"],
  ["r","♜"],
  ["b","♝"],
  ["n","♞"],
  ["p","♟︎"],
]);

class Piece extends React.Component<IPieceProps> {
  render(){
    return (<td className="Piece noselect">{piece2Symbol.get(this.props.type)}</td>);
  }
}

export function isPiece(arg: string): arg is PieceType {
  return pieces.includes(arg as PieceType);
}
export function isPieceOrBlank(arg: string): arg is PieceTypeWithBlank {
  return arg === "_" || pieces.includes(arg as PieceType);
}

export {Piece}
export type {IPieceProps,PieceType,PieceTypeWithBlank};
