import React, { Component } from 'react';
import './home.css';

export class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {expanded: props.expanded,
                        bname: props.name,
                        switch_func: props.switch_func
        }
    }

    render() {
        //return <button onClick={() => this.state.switch_func()}></button>;
        if (this.state.expanded) {
            return (
            <div className={'fit'}>
                <table>
                    <tr>
                        <td><button className={'btn'} onClick={() => this.props.switch_func()}>Test</button></td>
                        <td><button className={'btn expandable'} onClick={() => this.props.switch_func()}>Test</button></td>
                        <td><button className={'btn expandable'} onClick={() => this.props.switch_func()}>Test</button></td>
                    </tr>
                    <tr>
                        <td><button className={'btn expandable'} onClick={() => this.props.switch_func()}>Test</button></td>
                        <td><button className={'btn expandable'} onClick={() => this.props.switch_func()}>Test</button></td>
                        <td><button className={'btn expandable'} onClick={() => this.props.switch_func()}>Test</button></td>
                    </tr>
                    <tr>
                        <td><button className={'btn expandable'} onClick={() => this.props.switch_func()}>Test</button></td>
                        <td><button className={'btn expandable'} onClick={() => this.props.switch_func()}>Test</button></td>
                        <td><button className={'btn expandable'} onClick={() => this.props.switch_func()}>Test</button></td>
                    </tr>
                </table>
            </div>);
        } else {
            return (
                <div className={'fit'}>
                    <button className={'expandable btn fit'}
                            onClick={() => this.setState({'expanded':true})}>
                        <span>{this.state.bname}Non expanded</span>
                    </button>
                </div>
            );
        }
    }
}

export default Home
