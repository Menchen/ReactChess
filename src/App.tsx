import React from 'react';
import logo from './logo.svg';
import './App.css';
import Board from './Board';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                {/*<Board FEN="q7/8/8/8/8/8/PPPPPPPP/RNBQKBNR" />*/}
                <Board FEN="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" />
            </header>
        </div>
    );
}

export default App;
