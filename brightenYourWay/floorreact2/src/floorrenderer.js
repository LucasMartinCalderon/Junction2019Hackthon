import React, { Component } from 'react';
import floor from "./Paths2.svg";
import roof from "./roof2.svg";
import walls from "./Walls2.svg";
import linetemplate from "./line_template.svg";
import combined_struct from "./complete.svg";
import ReactSVG from 'react-svg';
import Victor from 'victor';
import ReactCursorPosition from 'react-cursor-position';
import './floorrenderer.css';
import Home from './home.js';

function updateState(text){
    //this.setState({text})
    console.log("Update!");
}

class FloorRenderer extends React.Component {
    tiles;
    ivecs;
    t = 0;
    travel_path;

    constructor(props) {
        super(props);
        this.state = {
            elementDimensions: {
                width: 0,
                height: 0
            },
            isPositionOutside: true,
            position: {
                x: 0,
                y: 0
            },
            render_floors: props.render_floors,
        }
        this.changeState = this.changeState.bind(this)
        this.svg_bounds = [-1311.954, -761.3192, 4761.9694, 4088.5184];
    }

    changeState() {
        console.log("change_state!");
        this.setState({render_floors: true});
        //this.state.render_floors = true;
    }

    render() {
        if (this.state.render_floors) {
            return (
                <div  className={'main_f'}>
                    <h1 className={'Leftalign'}>Follow the <span style={{color: '#ffa700'}}>Orange</span> <br></br>Light</h1>
                    <h2 className={'infobox'}>The lights will guide you <br></br>to your selected destination. <br></br>Wherever you are, it will show you the way.</h2>
                <div className={'flex'}>
                    <ReactCursorPosition style={{width: "800px", height: "600px"}}{...{
                    onPositionChanged: props => this.mouse_move(props, this.person_indicator, this.svg_bounds)
                }}
                >

                    <div style={{width: "800px", height: "600px"}} className={'building'}>
                        <ReactSVG src={combined_struct}
                                  beforeInjection={svg => {
                                      svg.classList.add('svg-class-name')
                                      svg.setAttribute('width', '');
                                      svg.setAttribute('height', '');
                                      svg.setAttribute('style', 'left: 0px; top: 0px; width: 800px; height: 600px; position: absolute');
                                      //svg.setAttribute('viewBox', '-1011.954 -361.3192 4461.9694 2965.88');
                                      svg.setAttribute('viewBox', this.svg_bounds[0] + " " + this.svg_bounds[1] + " " + this.svg_bounds[2] + " " + this.svg_bounds[3]);
                                  }}
                                  afterInjection={(error, svg) => {
                                      if (error) {
                                          console.error(error)
                                          return
                                      }
                                      console.log(svg)
                                      console.log(svg.getElementById('caras_bordes.Plane.001').childNodes[1].getAttribute('points'));

                                      var svg_elements = svg.getElementById('caras_bordes.Plane.001').childNodes;

                                      //[this.travel_path, this.tiles, this.ivecs]
                                      this.travel_path = this.extract_graph_from_svg(svg_elements);
                                      console.log(this.travel_path);
                                      beautify_graph(svg);
                                      console.log("Loaded scene");
                                      setup_route(this.svg_path, this.travel_path);
                                  }}
                        />
                        <ReactSVG src={linetemplate}
                                  beforeInjection={svg => {
                                      svg.classList.add('svg-class-name')
                                      svg.setAttribute('width', '');
                                      svg.setAttribute('height', '');
                                      svg.setAttribute('style', 'left: 0px; top: 0px; width: 800px; height: 600px; position: absolute');
                                      //svg.setAttribute('style', 'left: 0px; top: 0px; width: 800px; height: 600px; position: absolute');
                                      //svg.setAttribute('viewBox', '-1011.954 -361.3192 4461.9694 2965.88');
                                      svg.setAttribute('viewBox', this.svg_bounds[0] + " " + this.svg_bounds[1] + " " + this.svg_bounds[2] + " " + this.svg_bounds[3]);
                                  }}
                                  afterInjection={(error, svg) => {
                                      this.svg_path = svg;
                                      console.log("Loaded path");
                                      this.person_indicator = svg.getElementById("person_indicator")
                                  }}
                        />
                    </div>
                </ReactCursorPosition>
                </div>
                </div>
            )
        } else {
            return (
                <div className={'main_container'}>
                    <h1>Where do you want to go?</h1>
                    <div className={'selection_screen'}>
                        <table className={'ftable'}>
                            <tr>
                                <td><button onClick={() => this.changeState()}><span>Anesthetics</span></button></td>
                                <td><button onClick={() => this.changeState()}><span>Cardiology</span></button></td>
                                <td><button onClick={() => this.changeState()}><span>Critical Care</span></button></td>
                            </tr>
                            <tr>
                                <td><button onClick={() => this.changeState()}><span>Gynecology</span></button></td>
                                <td><button onClick={() => this.changeState()}><span>Onocology</span></button></td>
                                <td><button onClick={() => this.changeState()}><span>Pharmacy</span></button></td>
                            </tr>
                            <tr>
                                <td><button onClick={() => this.changeState()}><span>Radiology</span></button></td>
                                <td><button onClick={() => this.changeState()}><span>Haematology</span></button></td>
                                <td><button onClick={() => this.changeState()}><span>Neurology</span></button></td>
                            </tr>
                        </table>

                    </div>
                </div>
            )
        }
    }

    /*
    light_animator() {
        console.log(this.testval);
        this.t ++;
        //console.log(this.travel_path);
        if (this.travel_path != undefined) {
            var len = this.travel_path.length;
            this.travel_path[0].id.me.setAttribute('opacity', '0.0');

        }
        //this.active_path
        //this.travel_path
    }
     */

    extract_graph_from_svg(dom){
        var aStar = require('ngraph.path').aStar;
        var createGraph = require('ngraph.graph');
        var toDot = require('ngraph.todot');

        //var tiles = [];
        this.tiles = new Array(170).fill(null).map(item =>(new Array(170).fill(null)));
        var bounds = new Bound();
        var newbounds = new Bound();
        //var ivecs;

        for (var i = 0; i < dom.length; i++){
            var poly = dom[i * 2 + 1];
            if (poly) {
                if (poly.nodeName == 'polygon') {
                    var points = poly.getAttribute('points');
                    var coords = points.split(' ');

                    var mid = calc_mid(coords);

                    bounds.update(coords[0]);
                    bounds.update(coords[1]);
                    bounds.update(coords[2]);
                    bounds.update(coords[3]);
                    //bounds.update(mid[0] + "," + mid[1]);

                    var spos = sort_point(coords);

                    //console.log(points);
                    if (i == 0) {

                        this.ivecs = calc_vectors(spos);
                        //console.log(spos);
                        //console.log(ivecs);
                        //console.log(XYtoUV(spos[0], ivecs));
                        //console.log(XYtoUV(new Victor(0,0), ivecs));
                        //console.log(XYtoUV(new Victor(ivecs[1].x * 2 + ivecs[0].x,ivecs[1].y * 2 + ivecs[0].y), ivecs));
                        //tilesize = [Math.abs(parseFloat(coords[0].split(',')[0]) - mid[0]) * 2.0,
                        //    Math.abs(parseFloat(coords[0].split(',')[1]) - mid[1]) * 2.0];
                    }

                    var uvcoords = XYtoUV(new Victor(mid[0], mid[1]), this.ivecs);
                    //tiles[20][41] = 1;
                    this.tiles[100 + parseInt(Math.floor(uvcoords.x))][100 + parseInt(Math.floor(uvcoords.y))] =
                        new Tile("Test", poly, new Victor(mid[0], mid[1]));
                    /*if (i == 0) {
                        console.log("Coords:");
                        console.log(Math.floor(uvcoords.x));
                        console.log(Math.floor(uvcoords.y));
                    }*/
                    poly.setAttribute('data', Math.floor(uvcoords.x) + "," + Math.floor(uvcoords.y));
                    newbounds.update(Math.floor(uvcoords.x)+","+Math.floor(uvcoords.y));


                    //console.log(Math.floor(uvcoords.x));
                    //console.log(Math.floor(uvcoords.y));
                }
                //console.log(poly.nodeName);
            }

            //var points = poly.getAttribute('points');
            //console.log(dom[i * 2 + 1]);
        }

        bounds.print();

        this.graph = createGraph();

        for (var u = 0; u < this.tiles.length; u++){
            for (var v = 0; v < this.tiles[0].length; v++){
                if(this.tiles[u][v] != null) {
                    if(this.tiles[u][v - 1] != null){
                        this.tiles[u][v].neighbours[0] = this.tiles[u][v - 1];
                    }
                    if(this.tiles[u + 1][v] != null){
                        this.tiles[u][v].neighbours[1] = this.tiles[u + 1][v];
                    }
                    if(this.tiles[u][v + 1] != null){
                        this.tiles[u][v].neighbours[2] = this.tiles[u][v + 1];
                    }
                    if(this.tiles[u - 1][v] != null){
                        this.tiles[u][v].neighbours[3] = this.tiles[u - 1][v];
                    }
                    for (var n = 0; n < 4; n++) {
                        if (this.tiles[u][v].neighbours[n] != null){
                            this.graph.addLink(this.tiles[u][v], this.tiles[u][v].neighbours[n], {weight: 1});
                        }
                    }
                }

            }
        }


        this.pathFinder = aStar(this.graph, {
            distance(a, b, link) {
                return link.data.weight;
            }
        });
        var path = this.pathFinder.find(this.tiles[60][132], this.tiles[98][148]);

        //var dotContent = toDot(graph);

        //console.log(dotContent);
        return path;
    }

    mouse_move(props, indicator, bounds){
        //console.log(props.elementDimensions);
        if(indicator != null && props.elementDimensions) {
            var a = new Victor(0,0);
            var b = new Victor(100,0);
            var c = new Victor(50,120);
            //console.log(props.position);
            a.x += bounds[0] + bounds[2] * (props.position.x) / props.elementDimensions.width;
            a.y += bounds[1] + bounds[3] * (props.position.y) / props.elementDimensions.height;
            b.x += bounds[0] + bounds[2] * (props.position.x) / props.elementDimensions.width;
            b.y += bounds[1] + bounds[3] * (props.position.y) / props.elementDimensions.height;
            c.x += bounds[0] + bounds[2] * (props.position.x) / props.elementDimensions.width;
            c.y += bounds[1] + bounds[3] * (props.position.y) / props.elementDimensions.height;
            //console.log(a.x);
            var mouse_pos = new Victor(bounds[0] + bounds[2] * (props.position.x) / props.elementDimensions.width,
                bounds[1] + bounds[3] * (props.position.y) / props.elementDimensions.height
            );
            if (this.ivecs != null) {
                var tpos = XYtoUV(mouse_pos, this.ivecs);
                //console.log(this.tiles[100 + parseInt(tpos.x)][100 + parseInt(tpos.y)]);
                //console.log(this.tiles);
                var ttile = new Victor(100 + parseInt(tpos.x), 100 + parseInt(tpos.y));
                if (this.tiles[ttile.x]) {
                    if(this.tiles[ttile.x][ttile.y] != null) {
                        var len = this.travel_path.length;
                        var reach = 10;
                        var wavelength = 0.3;
                        try {
                            for (var rad = 0; rad < reach; rad++) {
                                this.travel_path[len - rad - 1].id.me.classList.remove("pulse");
                                //this.travel_path[len - rad - 1].id.me.setAttribute('style', 'animation-delay:0.' + rad);
                            }
                        } catch (err) {
                            console.log("id lost");
                        }
                        //indicator.setAttribute('points', a.x + "," + a.y + " " + b.x + "," + b.y + " " + c.x + "," + c.y);
                        this.travel_path = this.pathFinder.find(this.tiles[ttile.x][ttile.y], this.tiles[98][148]);
                        //reset lights!!
                        setup_route(this.svg_path, this.travel_path);
                        try {
                            len = this.travel_path.length;
                            for (var rad = 0; rad < reach; rad++) {
                                this.travel_path[len - rad - 1].id.me.classList.add("pulse");
                                this.travel_path[len - rad - 1].id.me.setAttribute('style', 'animation-delay:' + (wavelength * rad) + 's');
                            }
                        } catch (err) {
                            console.log("id lost..");
                        }
                        //indicator.classList.add('pulse');
                    }
                }
            }
        }
        //console.log(props.position);
    }
}





class Tile {
    constructor(name, dom, mid){
        this.neighbours = [null, null, null, null];
        this.name = name;
        this.me = dom;
        this.mid = mid;
    }
}

class Bound {

    constructor(){
        this.min_x = +Infinity;
        this.min_y = +Infinity;
        this.max_x = -Infinity;
        this.max_y = -Infinity;
    }

    update(point){
        var coords = point.split(',');
        if (parseFloat(coords[0]) < this.min_x) {
            this.min_x = parseFloat(coords[0]);
        }
        if (parseFloat(coords[1]) < this.min_y) {
            this.min_y = parseFloat(coords[1]);
        }
        if (parseFloat(coords[0]) > this.max_x) {
            this.max_x = parseFloat(coords[0]);
        }
        if (parseFloat(coords[1]) > this.max_y) {
            this.max_y = parseFloat(coords[1]);
        }
    }

    print(){
        console.log(this.min_x);
        console.log(this.max_x);
        console.log(this.min_y);
        console.log(this.max_y);
    }
}

function setup_route(svg_line, path) {
    svg_line = svg_line.childNodes[1];
    //console.log(path);
    var points = [];
    for (var i = 0; i < path.length; i++) {
        //console.log(path[i].id.mid);
        points[i] = path[i].id.mid.x + "," + path[i].id.mid.y;
    }
    svg_line.setAttribute('points', points);
    //console.log("Testout")
    //console.log(line);
}

function beautify_graph(svg) {
    var floor = svg.getElementById('caras_bordes.Plane.001').childNodes;

    var path_color = "rgb(230, 230, 230)";
    var wall_color = "rgb(80, 80, 80)";
    var roof_color = "rgb(130, 130, 130)";

    for (var i = 0; i < floor.length; i++){
        var poly = floor[i * 2 + 1];
        if (poly) {
            if (poly.nodeName == 'polygon') {
                poly.setAttribute('fill', path_color);
            }
        }
    }

    var walls = svg.getElementById('caras_bordes.Plane').childNodes;
    for (var i = 0; i < walls.length; i++){
        var poly = walls[i * 2 + 1];
        if (poly) {
            if (poly.nodeName == 'polygon') {
                poly.setAttribute('fill', wall_color);
                poly.setAttribute('stroke', wall_color);
                poly.setAttribute('opacity', '1.0');
                poly.setAttribute('stroke-opacity', '1.0');
            }
        }
    }

    var roofs = svg.getElementById('caras_bordes.Plane.004').childNodes;
    for (var i = 0; i < roofs.length; i++){
        var poly = roofs[i * 2 + 1];
        if (poly) {
            if (poly.nodeName == 'polygon') {
                poly.setAttribute('fill', roof_color);
                poly.setAttribute('stroke', roof_color);
                poly.setAttribute('opacity', '1.0');
                poly.setAttribute('stroke-opacity', '1.0');

            }
        }
    }
}



function calc_mid(coords) {
    var x = 0;
    var y = 0;
    x += parseFloat(coords[0].split(',')[0]);
    x += parseFloat(coords[1].split(',')[0]);
    x += parseFloat(coords[2].split(',')[0]);
    x += parseFloat(coords[3].split(',')[0]);

    y += parseFloat(coords[0].split(',')[1]);
    y += parseFloat(coords[1].split(',')[1]);
    y += parseFloat(coords[2].split(',')[1]);
    y += parseFloat(coords[3].split(',')[1]);

    return [(x * 0.25), (y * 0.25)];
}

function calc_vectors(points) {
    //var u = new Victor(points[1] - points[0]);
    var u = new Victor(points[1].x - points[0].x, points[1].y - points[0].y);
    //var v = new Victor(points[3] - points[0]);
    var v = new Victor(points[3].x - points[0].x, points[3].y - points[0].y);
    return [u,v];
}

function XYtoUV(inp, ivec) {
    var den = 1.0 / (ivec[0].x * ivec[1].y - ivec[0].y * ivec[1].x);
    var u = ivec[1].y * inp.x - ivec[1].x * inp.y;
    var v = - ivec[0].y * inp.x + ivec[0].x * inp.y;

    return new Victor(Math.floor(den * u), Math.floor(den * v));
}

function sort_point(points) {
    var v = [];
    v[0] = new Victor(parseFloat(points[0].split(',')[0]), parseFloat(points[0].split(',')[1]));
    v[1] = new Victor(parseFloat(points[1].split(',')[0]), parseFloat(points[1].split(',')[1]));
    v[2] = new Victor(parseFloat(points[2].split(',')[0]), parseFloat(points[2].split(',')[1]));
    v[3] = new Victor(parseFloat(points[3].split(',')[0]), parseFloat(points[3].split(',')[1]));
    var sorted = [];
    var xmin = +Infinity;
    var xmax = -Infinity;
    var ymin = +Infinity;
    var ymax = -Infinity;
    for (var i = 0; i < 4; i++){
        if (v[i].x < xmin) {
            xmin = v[i].x;
            sorted[0] = v[i];
        }
        if (v[i].x > xmax) {
            xmax = v[i].x;
            sorted[2] = v[i];
        }
        if (v[i].y < ymin) {
            ymin = v[i].y;
            sorted[1] = v[i];
        }
        if (v[i].y > ymax) {
            ymax = v[i].y;
            sorted[3] = v[i];
        }
    }

    return sorted;
}

export default FloorRenderer;


