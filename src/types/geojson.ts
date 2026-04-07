// GeoJSON type definitions
export namespace GeoJSON {
  export interface Position extends Array<number> {
    0: number; // longitude
    1: number; // latitude
    2?: number; // elevation (optional)
  }

  export interface Point {
    type: 'Point';
    coordinates: Position;
  }

  export interface LineString {
    type: 'LineString';
    coordinates: Position[];
  }

  export interface Polygon {
    type: 'Polygon';
    coordinates: Position[][];
  }

  export interface MultiPoint {
    type: 'MultiPoint';
    coordinates: Position[];
  }

  export interface MultiLineString {
    type: 'MultiLineString';
    coordinates: Position[][];
  }

  export interface MultiPolygon {
    type: 'MultiPolygon';
    coordinates: Position[][][];
  }

  export type Geometry = Point | LineString | Polygon | MultiPoint | MultiLineString | MultiPolygon;

  export interface Feature<G extends Geometry = Geometry, P extends Record<string, any> = Record<string, any>> {
    type: 'Feature';
    geometry: G;
    properties: P;
  }

  export interface FeatureCollection<G extends Geometry = Geometry, P extends Record<string, any> = Record<string, any>> {
    type: 'FeatureCollection';
    features: Feature<G, P>[];
  }
}
