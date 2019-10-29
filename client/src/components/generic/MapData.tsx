import * as React from 'react';
import { GenericComponent, IGenericProps, IGenericState } from './GenericComponent';
import * as moment from 'moment';
import * as _ from 'lodash';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';
import Card from '../Card';

import * as L from 'leaflet';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { EsriProvider } from 'leaflet-geosearch';

import 'react-leaflet-markercluster/dist/styles.min.css';

const styles = {
  map: {
    width: '100%',
    height: '100%',
    position: 'relative',
  } as React.CSSProperties,
  wrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  } as React.CSSProperties,
  center: {
    width: '50px',
    height: '50px',
    position: 'relative',
    top: 'calc(50% - 80px)',
    left: 'calc(50% - 25px)',
  } as React.CSSProperties,
  spinner: {
    margin: 0,
    padding: 0,
  } as React.CSSProperties
};

const provider = new EsriProvider(); // does the search from address to lng and lat 

interface IMapDataProps extends IGenericProps {
  mapProps: any;
  props: {
    searchLocations: boolean;
  };
}

interface IMapDataState extends IGenericState {
  markers: Array<{ position: string[] }>;
  locations: any[];
}

export default class MapData extends GenericComponent<IMapDataProps, IMapDataState> {

  static defaultProps = {
    center: [14.704929, -25.210251],
    zoom: 1.4,
    maxZoom: 8,
  };

  static fromSource(source: string) {
    return {
      locations: source
    };
  }

  constructor(props: IMapDataProps) {
    super(props);

    this.state = {
      markers: [],
      locations: [],
    };
  }

  componentWillMount() {
    L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.0.2/dist/images/';
  }

  compareMarkers(markers1: Array<{ position: string[] }>, markers2: Array<{ position: string[] }>): boolean { 

    if (markers1 == markers2) { return true; } /* tslint:disable-line */
    if (!markers1 || !markers2) { return false; }
    if (markers1.length !== markers2.length) { return false; }
    return markers1.every(
      (a, i) => markers2.length > i && 
                a.position[0] === markers2[i].position[0] &&
                a.position[1] === markers2[i].position[1]);
  }

  compareLocations(location1: any[], location2: any[]) {
    if (location1 == location2) { return true; } /* tslint:disable-line */
    if (!location1 || !location2) { return false; }
    if (location1.length !== location2.length) { return false; }
    return location1.every(
      (a, i) => location2.length > i && 
                a.location === location2[i].location &&
                a.location_count === location2[i].location_count);
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    if (this.compareLocations(this.state.locations, nextState.locations) &&
        this.compareMarkers(this.state.markers, nextState.markers)) {
      return false;
    }
    return true;
  }

  componentDidUpdate() {
    const { searchLocations } = this.props.props;
    const { locations } = this.state;

    if (!locations || !locations.length) { return; }

    if (!searchLocations) {
      this.setState({ markers: locations });
      return;
    }

    let promises = [];
    let markers = [];
    locations.forEach(loc => {
      let { location, popup } = loc;
      
      let promise = provider.search({ query: location });
      promises.push(promise);
      promise.then(results => {
        let markupPopup = (popup && L.popup().setContent(popup)) || null;

        if (results.length) {
          markers.push({ position: [ results[0].y, results[0].x], popup: markupPopup });
        }
      });
    });

    Promise.all(promises).then(() => {
      let oldMarkers = this.state.markers;
      markers = markers.sort((a, b) =>
        a.position[0] > b.position[0] ? 1 :
          a.position[0] < b.position[0] ? -1 :
            a.position[1] > b.position[1] ? 1 :
              a.position[1] < b.position[1] ? -1 : 0);
      if (!_.isEqual(oldMarkers, markers)) {
        this.setState({ markers });
      }
    });
  }

  render() {
    const { markers } = this.state;
    const { id, title, subtitle, props, mapProps } = this.props;

    if (!markers) {
      return null;
    }

    if (markers.length === 0) {
      return (
        <Card title={title} subtitle={subtitle}>
          <div style={styles.wrapper}>
            <div style={styles.center}>
              <CircularProgress key="loading" id="spinner" style={styles.spinner} />
            </div>
          </div>
        </Card>
      );
    }

    const mapProperties = { ...MapData.defaultProps, ...mapProps };

    return (
      <Card id={id} title={title} subtitle={subtitle}>
        <Map
          className="markercluster-map"
          style={styles.map}
          {...mapProperties}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
          />
          <MarkerClusterGroup
            markers={markers}
            options={{
              maxClusterRadius: 10,
            }}
          />
        </Map>
      </Card>
    );
  }
}