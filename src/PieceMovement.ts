import {PieceType, PieceTypeWithBlank} from "./Piece";
export const rowSize = 8;
export const boardSize = rowSize**2;

export interface IMove {
    from:number;
    to:number;
    doubleStep?:boolean;
    enPassant?:number;
    promote?:PieceType;
}

export interface IGridInfo {
    type: PieceTypeWithBlank;
    highlight: boolean;
    moved?:boolean;
    lastMovementWasDoubleStep?:boolean;

}

export function applyMovement(pieces:IGridInfo[],move:IMove){
    // let copy : IGridInfo[] = JSON.parse(JSON.stringify(pieces));
    let copy : IGridInfo[] = clonePieceMap(pieces);
    copy[move.to] = copy[move.from];
    copy[move.to].moved = true;
    copy[move.to].lastMovementWasDoubleStep = move.doubleStep;
    if (move.promote){
        copy[move.to].type = move.promote;
    }
    if (move.enPassant){
        copy[move.enPassant] = {type:"_",highlight:false};
    }
    copy[move.from] = {type:"_",highlight:false};
    return copy;
}

function clonePieceMap(pieces:IGridInfo[]){
    let clone = new Array<IGridInfo>(boardSize);
    pieces.forEach((value, index) => {
        clone[index]={type:value.type,highlight:value.highlight,moved:value.moved}
    })
    return clone;
}

export function attemptMovePiece(pieces:IGridInfo[],index:number){
    let piece = pieces[index];
    let moveSet:Set<IMove> = new Set<IMove>();
    if (isQueen(piece)||isRook(piece)||isBishop(piece)){
        moveSet = generateSlideMove(pieces,index);
    }else if (isPawn(piece)){
        moveSet = generatePawnMove(pieces,index);
    }else if (isKnight(piece)){
        moveSet = generateKnightMove(pieces,index);
    }else if (isKing(piece)){
        moveSet = generateKingMove(pieces,index);
    }
    return moveSet;
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


export function generateKingMove(pieces:IGridInfo[],index:number){

    let moveSet = new Set<IMove>();

    kingMoveMap[index].filter(value => {
        return !isSameColor(pieces[index],pieces[value]);
    }).forEach( value => {
        moveSet.add({from: index, to: value});
    });
    return moveSet;
}

export function generateKnightMove(pieces:IGridInfo[],index:number){
    let moveSet = new Set<IMove>();

    knightMoveMap[index].filter(value => {
        return !isSameColor(pieces[index],pieces[value]);
    }).forEach( value => {
        moveSet.add({from: index, to: value});
    });
    return moveSet;
}
function generatePawnPromotion(from:number,to:number,isWhite:boolean,moveSet:Set<IMove>){
    moveSet.add({from:from,to:to,promote:isWhite ? "N":"n"})
    moveSet.add({from:from,to:to,promote:isWhite ? "Q":"q"})
}

export function generatePawnMove(pieces:IGridInfo[],index:number){
    let moveSet = new Set<IMove>();

    // let x = index%rowSize;
    let y = Math.floor(index/rowSize);

    let promoteRank = isWhite(pieces[index]) ? 0 : rowSize-1;
    let dir = isWhite(pieces[index]) ? -1 : 1;

    let frontTarget = index+rowSize*dir;
    if (isValidIndex(frontTarget) && isEmpty(pieces[frontTarget])){
        if (y+dir === promoteRank){
            // Promote to queen and knight;
            generatePawnPromotion(index,frontTarget,isWhite(pieces[index]),moveSet);
        }else {
            moveSet.add({from:index,to:frontTarget});
        }
    }
    let sideCapture = [index+(rowSize+1)*dir,index+(rowSize-1)*dir];

    sideCapture.forEach(value => {
        // let target_x = value%rowSize;
        let target_y = Math.floor(value/rowSize);

        if(Math.abs(target_y - y) !== 1 ||!isValidIndex(value)){
            return; // Wrong index, edge pawn;
        }

        let enPassantIndex = value-rowSize*dir;
        let enPassantCheck = isDifferentColor(pieces[index],pieces[enPassantIndex]) && pieces[enPassantIndex].lastMovementWasDoubleStep;

        if (enPassantCheck){
            moveSet.add({from: index, to: value,enPassant:enPassantIndex});
        }else if (isDifferentColor(pieces[index],pieces[value])) {
            if (target_y === promoteRank){
                generatePawnPromotion(index,value,isWhite(pieces[index]),moveSet);
            }else {
                moveSet.add({from: index, to: value});
            }
        }
    });

    // if (Math.floor(index/rowSize) === (isWhite(pieces[index]) ? 6 : 1)){
    if (!pieces[index].moved){
        let doubleFordward = index+8*dir*2;
        if (isEmpty(pieces[frontTarget])&&isEmpty(pieces[doubleFordward])){
            moveSet.add({from: index, to: doubleFordward,doubleStep:true});
        }
    }
    return moveSet;
}

export function generateSlideMove(pieces:IGridInfo[],index:number){
    let moveSet = new Set<IMove>();
    let startDirectionOffset = isBishop(pieces[index]) ? 4 : 0;
    let endDirectionOffset = isRook(pieces[index]) ? 4 : 8;

    for (let dir = startDirectionOffset; dir< endDirectionOffset; dir++){
        for (let i = 1; i <= edgeDistanceMap[index][dir];i++){
            let targetIndex = index+i*directionOffset[dir];

            if (isEmpty(pieces[targetIndex])) {
                moveSet.add({from: index, to: targetIndex});
                continue;
            }
            if (isDifferentColor(pieces[index],pieces[targetIndex])){
                moveSet.add({from:index,to:targetIndex});
            }
            break;
        }
    }
    return moveSet;
}



export function isBishop(piece:IGridInfo){
    return piece.type === "b" || piece.type === "B";
}
export function isKing(piece:IGridInfo){
    return piece.type === "k" || piece.type === "K";
}
export function isRook(piece:IGridInfo){
    return piece.type === "r" || piece.type === "R";
}
export function isQueen(piece:IGridInfo){
    return piece.type === "q" || piece.type === "Q";
}
export function isPawn(piece:IGridInfo){
    return piece.type === "p" || piece.type === "P";
}
export function isKnight(piece:IGridInfo){
    return piece.type === "n" || piece.type === "N";
}
export function isEmpty(piece:IGridInfo){
    return piece.type === "_";
}
export function isWhite(piece:IGridInfo){
    return piece.type === piece.type.toUpperCase() && !isEmpty(piece);
}
export function isBlack(piece:IGridInfo){
    return piece.type === piece.type.toLowerCase() && !isEmpty(piece);
}
export function isSameColor(a:IGridInfo, b:IGridInfo){
    return ((isWhite(a) && isWhite(b))||(isBlack(a) && isBlack(b)))&&(!isEmpty(a)&&!isEmpty(b));
}

export function isDifferentColor(a:IGridInfo, b:IGridInfo){
    return ((isWhite(a) && isBlack(b))||(isBlack(a) && isWhite(b)))&&(!isEmpty(a)&&!isEmpty(b));
}

export function isValidIndex(i:number){
    return i>=0 && i< boardSize;
}
