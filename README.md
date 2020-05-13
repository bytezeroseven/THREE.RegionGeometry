# THREE.RegionGeometry
Region based edge detection using Three.js

## Documentation
The geometry adds `Face3.regionIndex` for interactivity. The faces of a region can be accessed using `RegionGeometry.regions[ regionIndex ]`. 

The regions and edges can be updated using `RegionGeometry.update( thresholdAngle )`.

IMPORTANT: This will only work with geometries that don't have duplicate vertices. You can remove duplicates by calling `Geometry.mergeVertices`.

## Demo
https://bytezeroseven.github.io/THREE.RegionGeometry/
