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
};

interface IMapDataState extends IGenericState {
  markers: Object[];
  locations: any[];
}

export default class MapData extends GenericComponent<IMapDataProps, IMapDataState> {

  static defaultProps = {
    center: [14.704929, -25.210251],
    zoom: 1.4,
    maxZoom: 8,
  };

  state = {
    markers: [],
    locations: [],
  };

  constructor(props: IMapDataProps) {
    super(props);
  }

  componentWillMount() {
    L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.0.2/dist/images/';
  }

  compareMarkers(markers1: any[], markers2: any[]): boolean { 

    if (markers1 == markers2) { return true; } /* tslint:disable-line */
    if (!markers1 || !markers2) { return false; }
    if (markers1.length !== markers2.length) { return false; }
    return _.isEqualWith(markers1, markers2, (a, b) => a.lat === b.lat && a.lng === b.lng);
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    if (this.compareMarkers(this.state.locations, nextState.locations) &&
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
        markers.push({ lat: results[0].y, lng: results[0].x, popup: markupPopup });
      });
    });

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
    const { markers } = this.state;
    const { title, subtitle, props, mapProps } = this.props;

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
      <Card title={title} subtitle={subtitle}>
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
            wrapperOptions={{ enableDefaultStyle: true }}
          />
        </Map>
      </Card>
    );
  }
}