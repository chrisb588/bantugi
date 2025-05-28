import Area from './area';

export default interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}