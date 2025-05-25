import { LatLng } from 'leaflet';

import Area from './area';

export default interface Location {
  address: Area;
  coordinates: LatLng;
}