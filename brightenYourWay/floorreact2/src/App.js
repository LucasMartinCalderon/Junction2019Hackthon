import React, { Component } from 'react';
import './App.css';
import FloorRenderer from './floorrenderer.js';
import Home from './home';

class App extends Component {
    constructor(props){
        super(props);
        this.frenderer = <FloorRenderer render_floors={true}/>;
        //FloorRenderer.changeState();
    }

    render() {
        //const element = <h1>Hello, world</h1>;
        return (
            <div className="App">
                <header className="App-header">
                    <FloorRenderer render_floors={false}/>
                </header>
            </div>
        )
    }

    switchScene() {
        this.frenderer.changeState();
    }
}

export default App;
