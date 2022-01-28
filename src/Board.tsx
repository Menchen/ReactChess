import React from 'react';
import {Piece,IPieceProps,PieceTypeWithBlank,isPiece,isPieceOrBlank} from './Piece';

const rowSize = 8;
const boardSize = rowSize**2;

interface IBoardProps {
  FEN:string;
  startColor?:"w"|"b";
}
interface IBoardState {
  FEN:string;
  pieces:Array<PieceTypeWithBlank>;
}
class Board extends React.Component<IBoardProps,IBoardState> {
  constructor(props:IBoardProps){
    super(props);
    this.state = {FEN:this.props.FEN, pieces: fen2pieces(this.props.FEN)};
  }
  render(){
    return renderPieces(this.state.pieces);
    // return renderBoard(this.props.FEN);
  }
}

function fen2pieces(fen:string){
  let pieces = new Array<PieceTypeWithBlank>(boardSize);
  fen.split("/").forEach((value,rowIndex) =>{
    value.split("").forEach((c,cIndex)=>{


      if (!isNaN(parseInt(c))){
        const startIndex = rowIndex*rowSize+cIndex;
        for (let i = 0; i < parseInt(c); i++) {

          pieces[startIndex+i] = "_" ;
        }
        return;
      }
      if (isPiece(c)){
        pieces[rowIndex*rowSize+cIndex] = c;
        return;
      }
      console.error(`Unknown piece type: ${c}`);
    })
  })
  console.log(pieces);
  return pieces;
}

function renderPieces(pieces:Array<PieceTypeWithBlank>){
  let board:JSX.Element[] = [];
  for (let i = 0; i  < boardSize; i +=rowSize) {
    let rowData = pieces.slice(i,i+8).map((p,cIndex)=>(<Piece key={i+cIndex} type={p}/>));
    board.push((<tr key={i} className={(i/rowSize)%2 ? "odd" : "even"}>{rowData}</tr>))
  }
  return (<table><tbody>{board}</tbody></table>);
}
export default Board;
