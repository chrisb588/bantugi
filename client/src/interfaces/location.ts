import Area from './area';

export default interface Location {
  address: Area;
  coordinates: { 
    lat: number;
    lng: number;
  };
}