import * as React from 'react';
import { GenericComponent, IGenericProps, IGenericState } from './GenericComponent';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AreaChart, Area as AreaFill, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, defs } from 'recharts';
import Card from '../Card';
import { render } from 'react-dom';
import * as L from 'leaflet';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import DivIcon from 'react-leaflet-div-icon';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { EsriProvider } from 'leaflet-geosearch';

const mapCenter = [ 34.704929,  -81.210251];
const maxZoom= 8;
const zoomLevel = 2;
const bounds = [5,5];


const provider = new EsriProvider(); // does the search from address to lng and lat 



interface IMapDataState extends IGenericState {
  markers:  Object[];
  locations: string[];
  count_in_location: string[];
}

interface IMapDataProps extends IGenericProps {
  props: {
  }
};
export default class MapData extends GenericComponent<IMapDataProps, IMapDataState>{

  state = {
     markers:  [],
     locations: [],
     count_in_location:[]
  }

  constructor(props: IMapDataProps) {
    super(props);
  }

  componentWillMount() {
    L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.0.2/dist/images/"; 
  }

  componentDidUpdate() {
    let { locations,count_in_location } = this.state;

    if (!locations || !locations.length) { return; }

    let promises = [];
    let markers = [];
    for (var i = 0; i < locations.length; i++) {
      let location = locations[i];
      let count = count_in_location[i];
      let promise = provider.search({ query: location});
      promises.push(promise);
      promise.then(results=> { 
        markers.push({lat: results[0].y, lng:  results[0].x, tooltip: count});
      });
    }
    Promise.all(promises).then(() => {

      let oldMarkers = this.state.markers;
      markers = markers.sort((a, b) => 
        a.lat > b.lat ? 1 : 
        a.lat < b.lat ? -1 : 
        a.lng > b.lng ? 1 : 
        a.lng < b.lng ? -1 : 0);
      if (!_.isEqual(oldMarkers, markers)) { 
        this.setState({ markers });
      }
    });
  }

  render() { 
      var { markers } = this.state;
      var { title, subtitle, props } = this.props;

      if(!markers){
        return(
          null
        )
      }
        return (
            <Card title={title} subtitle={subtitle}>          
              <Map className="markercluster-map" center={mapCenter} zoom={zoomLevel} maxZoom={maxZoom}  boundsOptions={bounds} style={{width: '100%', height: '100%'}} >
                <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
                 <MarkerClusterGroup
                  markers={markers}
                  wrapperOptions={{enableDefaultStyle: true}}/>
              </Map>
            </Card>
        );
    }
}