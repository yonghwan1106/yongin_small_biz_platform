declare module 'leaflet.heat' {
  import * as L from 'leaflet';

  export function heatLayer(latlngs: [number, number, number][], options?: any): L.Layer;
}
