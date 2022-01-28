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

const piece2Color = new Map<PieceTypeWithBlank,string>([
  ["K","white"],
  ["Q","white"],
  ["R","white"],
  ["B","white"],
  ["N","white"],
  ["P","white"],
  ["_",""],
  ["k","black"],
  ["q","black"],
  ["r","black"],
  ["b","black"],
  ["n","black"],
  ["p","black"],
]);

class Piece extends React.Component<IPieceProps> {
  render(){
    return (<td className={`Piece noselect ${piece2Color.get(this.props.type)}`}>{piece2Symbol.get(this.props.type)}</td>);
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
