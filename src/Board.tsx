import React from 'react';
import {Piece,IPieceProps,PieceType,PieceTypeWithBlank,isPiece,isPieceOrBlank} from './Piece';
import {
  applyMovement,
  attemptMovePiece,
  boardSize,
  generateKingMove,
  generateKnightMove,
  generatePawnMove,
  generateSlideMove,
  IGridInfo,
  IMove,
  isBishop,
  isBlack, isKing, isKnight,
  isPawn,
  isQueen,
  isRook,
  isWhite, rowSize
} from './PieceMovement';

interface IBoardProps {
  FEN:string;
  startColor?:"w"|"b";
}


interface IBoardState {
  // FEN:string;
  pieces:IGridInfo[];
  turn:"w"|"b";
  selected:number;
  movementMap:IMove[];
}


class Board extends React.Component<IBoardProps,IBoardState> {

  pieceCallback = (index:number)=>{
    console.log(index);
    let selected = this.state.selected;
    let pieces = this.state.pieces;
    let turn = this.state.turn;
    let movementMap:IMove[] = this.state.movementMap;
    if (selected === -1){
      let piece = pieces[index];
      if (turn === "w"? !isWhite(piece):!isBlack(piece)){
        return;
      }
      let moveSet = attemptMovePiece(pieces,index);
      if (moveSet.size>0){
        selected = index;
        highlightMoves(pieces,moveSet);
        movementMap = mapMovesToArray(moveSet);
      }
    }else{
      if (movementMap[index]){
        // Move available for selected piece
        pieces = applyMovement(pieces,movementMap[index]);

        // Flip turn
        turn = turn === "w" ? "b": "w";
      }

      // Clear selection if clicked on non-move piece
      selected = -1;
      movementMap = []
      clearHighligh(pieces);
    }
    this.setState({selected:selected,pieces:pieces,turn:turn,movementMap:movementMap}); // Tell react to update our state
  }


  fen2pieces(fen:string){
    let pieces = new Array<IGridInfo>(boardSize);
    fen.split("/").forEach((value,rowIndex) =>{
      value.split("").forEach((c,cIndex)=>{

        if (!isNaN(parseInt(c))){
          const startIndex = rowIndex*rowSize+cIndex;
          for (let i = 0; i < parseInt(c); i++) {

            pieces[startIndex+i] = {type:"_",highlight:false} ;
          }
          return;
        }
        if (isPiece(c)){
          pieces[rowIndex*rowSize+cIndex] = {type:c,highlight:false};
          return;
        }
        console.error(`Unknown piece type: ${c}`);
      })
    })
    console.log(pieces);
    return pieces;
  }

  renderPieces(pieces:Array<IGridInfo>){
    let board:JSX.Element[] = [];
    for (let i = 0; i  < boardSize; i +=rowSize) {
      let rowData = pieces.slice(i,i+8).map((p,cIndex)=>(
          <Piece key={i+cIndex} callback={this.pieceCallback} index={i+cIndex} type={p.type} hightlight={p.highlight}/>
      ));
      board.push((<tr key={i} className={(i/rowSize)%2 ? "odd" : "even"}>{rowData}</tr>))
    }
    return (<table><tbody>{board}</tbody></table>);
  }

  constructor(props:IBoardProps){
    super(props);
    this.state = {selected:-1, movementMap:[], pieces: this.fen2pieces(this.props.FEN),turn:this.props.startColor?this.props.startColor:"w"};
  }
  render(){
    return this.renderPieces(this.state.pieces);
    // return renderBoard(this.props.FEN);
  }

}

function clearHighligh(pieces:IGridInfo[]){
  pieces.forEach(value => value.highlight=false);
}


function highlightMoves(pieces:IGridInfo[],moveSet:Set<IMove>, clear = true){
  if (clear){
    clearHighligh(pieces);
  }
  moveSet.forEach(value => pieces[value.to].highlight=true);
}

function mapMovesToArray(moveSet:Set<IMove>){
  let map = new Array<IMove>(boardSize);
  moveSet.forEach(value => map[value.to]=value);
  return map;
}

export default Board;
