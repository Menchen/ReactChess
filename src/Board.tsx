import React from 'react';
import {Piece,IPieceProps,PieceTypeWithBlank,isPiece,isPieceOrBlank} from './Piece';

interface IBoardProps {
  FEN:string;
  startColor?:"w"|"b";
}
interface IBoardState {
  FEN:string;
  pieces:IPieceProps;
}
class Board extends React.Component<IBoardProps,IBoardState> {
  constructor(props:IBoardProps){
    super(props);

  }
  render(){
    return renderBoard(this.props.FEN);
  }
}

function renderBoard(fen:string){
  let tr = fen.split("/").map((row,index)=>{
    return renderRow(row,index);
  });
  return (<div>{tr}</div>);
}

function renderRow(rowFen:string,index:number) {
  let td = rowFen.split("").map(c =>{
    if (!isNaN(parseInt(c))){
      return (<>
      {[...Array(parseInt(c))].map(_=><Piece type="_"/>)
        }
        </>);
    }
    if (isPiece(c)){
      return (<Piece type={c}/>);
    }
    return (<>"?"</>);
  });

  return (<tr className={index%2 ? "odd" : "even"}>
  {td}
  </tr>)

}

export default Board;
