import React from 'react';
import {Piece,IPieceProps,PieceType,PieceTypeWithBlank,isPiece,isPieceOrBlank} from './Piece';

const rowSize = 8;
const boardSize = rowSize**2;

interface IMove {
  from:number;
  to:number;
}

interface IBoardProps {
  FEN:string;
  startColor?:"w"|"b";
}

interface IGridInfo {
  type: PieceTypeWithBlank;
  highlight:boolean;
}
interface IBoardState {
  FEN:string;
  pieces:Array<IGridInfo>;
  turn:"w"|"b";
  selected:number;
}


const directionOffset = [-8,8,-1,1,7,-7,9,-9] as const;

const edgeDistanceMap = Array.from({length: boardSize}, (_, index) => {
  let x = index%rowSize;
  let y = Math.floor(index/rowSize);

  let northDistance = y;
  let southDistance = 7 - y;
  let westDistance = x;
  let eastDistance = 7 - x;
  return [
    northDistance,
    southDistance,
    westDistance,
    eastDistance,
    Math.min(southDistance,westDistance),
    Math.min(northDistance,eastDistance),
    Math.min(southDistance,eastDistance),
    Math.min(northDistance,westDistance),
  ];
});

const knightMoveMap = Array.from({length: boardSize}, (_, index) => {
  let x = index%rowSize;
  let y = Math.floor(index/rowSize);

  let move:number[] = [];

  for (let xx = 0;xx<rowSize;xx++){
    for (let yy = 0;yy<rowSize;yy++){
      let dx = Math.abs(x-xx);
      let dy = Math.abs(y-yy);
      if (dx >0 && dy >0 && dx+dy === 3){
        move = [...move,yy*rowSize+xx];
      }
    }
  }
  return move;
});


const kingMoveMap = Array.from({length: boardSize}, (_, index) => {
  let x = index%rowSize;
  let y = Math.floor(index/rowSize);

  let move:number[] = [];

  for (let xx = 0;xx<rowSize;xx++){
    for (let yy = 0;yy<rowSize;yy++){
      let dx = Math.abs(x-xx);
      let dy = Math.abs(y-yy);
      if ((dx === 1 && dy <=1) || (dx <=1 && dy === 1) ){
        move = [...move,yy*rowSize+xx];
      }
    }
  }
  return move;
});


function isBishop(piece:IGridInfo){
  return piece.type === "b" || piece.type === "B";
}
function isKing(piece:IGridInfo){
  return piece.type === "k" || piece.type === "K";
}
function isRook(piece:IGridInfo){
  return piece.type === "r" || piece.type === "R";
}
function isQueen(piece:IGridInfo){
  return piece.type === "q" || piece.type === "Q";
}
function isPawn(piece:IGridInfo){
  return piece.type === "p" || piece.type === "P";
}
function isKnight(piece:IGridInfo){
  return piece.type === "n" || piece.type === "N";
}
function isEmpty(piece:IGridInfo){
  return piece.type === "_";
}
function isWhite(piece:IGridInfo){
  return piece.type === piece.type.toUpperCase() && !isEmpty(piece);
}
function isBlack(piece:IGridInfo){
  return piece.type === piece.type.toLowerCase() && !isEmpty(piece);
}
function isSameColor(a:IGridInfo,b:IGridInfo){
  return ((isWhite(a) && isWhite(b))||(isBlack(a) && isBlack(b)))&&(!isEmpty(a)&&!isEmpty(b));
}

function isDifferentColor(a:IGridInfo,b:IGridInfo){
  return (!(isWhite(a) && isWhite(b)))&&(!isEmpty(a)&&!isEmpty(b));
}

function isValidIndex(i:number){
  return i>=0 && i< boardSize;
}


class Board extends React.Component<IBoardProps,IBoardState> {

  pieceCallback = (index:number)=>{
    console.log(index);
    if (this.state.selected === -1){

      let moveSet:Set<IMove> = new Set<IMove>();
      let piece = this.state.pieces[index];

      if (isQueen(piece)||isRook(piece)||isBishop(piece)){
        moveSet = generateSlideMove(this.state.pieces,index);
      }else if (isPawn(piece)){
        moveSet = generatePawnMove(this.state.pieces,index);
      }else if (isKnight(piece)){
        moveSet = generateKnightMove(this.state.pieces,index);
      }else if (isKing(piece)){
        moveSet = generateKingMove(this.state.pieces,index);
      }

      if (moveSet.size>0){
        this.state = {...this.state,selected:index};
      }
      highlightMoves(this.state.pieces,moveSet);
    }else{
      if (this.state.pieces[index].highlight){
        this.state.pieces[index].type = this.state.pieces[this.state.selected].type;
        this.state.pieces[this.state.selected].type = "_";
      }
      this.state = {...this.state,selected:-1};
      clearHighligh(this.state.pieces);
    }
    this.setState(this.state);
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
    this.state = {selected:-1, FEN:this.props.FEN, pieces: this.fen2pieces(this.props.FEN),turn:this.props.startColor?this.props.startColor:"w"};
  }
  render(){
    return this.renderPieces(this.state.pieces);
    // return renderBoard(this.props.FEN);
  }

}


function clearHighligh(pieces:IGridInfo[]){
  pieces.forEach(value => value.highlight=false);
}

function generateKingMove(pieces:IGridInfo[],index:number){

  let moveSet = new Set<IMove>();

  kingMoveMap[index].filter(value => {
    return !isSameColor(pieces[index],pieces[value]);
  }).forEach( value => {
    moveSet.add({from: index, to: value});
  });
  return moveSet;
}

function generateKnightMove(pieces:IGridInfo[],index:number){
  let moveSet = new Set<IMove>();

  knightMoveMap[index].filter(value => {
    return !isSameColor(pieces[index],pieces[value]);
  }).forEach( value => {
    moveSet.add({from: index, to: value});
  });

  // for (let i =0;i<kMove.length;i++){
  //   let target = index+kMove[i];
  //   if(target <boardSize && target>=0 && !isSameColor(pieces[index],pieces[target])){
  //     moveSet.add({from: index, to: target});
  //   }
  // }

  return moveSet;
}
function generatePawnMove(pieces:IGridInfo[],index:number){
  let moveSet = new Set<IMove>();
  let dir = isWhite(pieces[index]) ? -1 : 1;

  let frontTarget = index+8*dir;
  if (isValidIndex(frontTarget) && isEmpty(pieces[frontTarget])){
    moveSet.add({from:index,to:frontTarget});
  }
  let sideCapture = [index+9*dir,index+7*dir];

  sideCapture.filter(value => {
    // return true;
    return Math.abs(Math.floor(value/rowSize)-Math.floor(index/rowSize)) === 1
        &&isValidIndex(value)&&!isEmpty(pieces[value]) && isDifferentColor(pieces[index],pieces[value]);
  }).forEach( value => {
    moveSet.add({from: index, to: value});
  });

  if (Math.floor(index/rowSize) === (isWhite(pieces[index]) ? 6 : 1)){
    let doubleFordward = index+8*dir*2;
    if (isEmpty(pieces[frontTarget])&&isEmpty(pieces[doubleFordward])){
      moveSet.add({from: index, to: doubleFordward});
    }
  }

  return moveSet;
}

function generateSlideMove(pieces:IGridInfo[],index:number){
  let moveSet = new Set<IMove>();
  let startDirectionOffset = isBishop(pieces[index]) ? 4 : 0;
  let endDirectionOffset = isRook(pieces[index]) ? 4 : 8;

  for (let dir = startDirectionOffset; dir< endDirectionOffset; dir++){
    for (let i = 1; i <= edgeDistanceMap[index][dir];i++){
      let targetIndex = index+i*directionOffset[dir];

      if (isEmpty(pieces[targetIndex])){
        moveSet.add({from:index,to:targetIndex});
      }else {
        if (isDifferentColor(pieces[index],pieces[targetIndex])){
          moveSet.add({from:index,to:targetIndex});
        }
        break;
      }


    }
  }
  return moveSet;
}

function highlightMoves(pieces:IGridInfo[],moveSet:Set<IMove>, clear = true){
  if (clear){
    clearHighligh(pieces);
  }
  moveSet.forEach(value => pieces[value.to].highlight=true);
}

export default Board;
