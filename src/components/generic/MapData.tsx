import * as React from 'react';
import { GenericComponent, IGenericProps, IGenericState } from './GenericComponent';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AreaChart, Area as AreaFill, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, defs } from 'recharts';
import Card from '../Card';
import { render } from 'react-dom';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import DivIcon from 'react-leaflet-div-icon';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'react-leaflet-markercluster/dist/style.css'

var map = new L.Map("map");


const mapCenter = [51.0, 19.0];
const maxZoom= 18;
const zoomLevel = 4;


  const markers = [
    {lat: 49.8397, lng: 24.0297},
    {lat: 50.4501, lng: 30.5234},
    {lat: 52.2297, lng: 21.0122},
    {lat: 50.0647, lng: 19.9450},
    {lat: 48.9226, lng: 24.7111},
    {lat: 48.7164, lng: 21.2611},
    {lat: 51.5, lng: -0.09},
    {lat: 51.5, lng: -0.09},
    {lat: 51.5, lng: -0.09},
  ];


export default class MapData extends GenericComponent<any, any>{


  componentDidMount(){
   // L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.0.2/dist/images/"; 
  }
  
  render() { 
      
      var { timeFormat, values, lines } = this.state;
      var { title, subtitle, theme, props } = this.props;

        return (
            <Card title={title} subtitle={subtitle}>               
              <Map className="markercluster-map" center={mapCenter} zoom={zoomLevel} maxZoom={maxZoom}>
                <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
              <MarkerClusterGroup
              markers={markers}
              wrapperOptions={{enableDefaultStyle: true}}/>
              </Map>
            </Card>
        );
    }
}