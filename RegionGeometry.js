
/*
	@author bytezeroseven
 */

THREE.RegionGeometry = function( geometry, thresholdAngle ) {

	THREE.BufferGeometry.apply( this, arguments );

	if ( geometry.isBufferGeometry ) {

		this.geometry = new THREE.Geometry().fromBufferGeometry( geometry );

	} else {

		this.geometry = geometry;

	}

	// assumes geometry doesn't has duplicates
	// this.geometry.mergeVertices();

	var faces = this.geometry.faces;

	var keys = [ 'a', 'b', 'c' ];
	this.cachedEdges = {};

	for ( var i = 0; i < faces.length; i ++ ) {

		var face = faces[ i ];

		for ( var j = 0; j < 3; j ++ ) {

			var i1 = face[ keys[ j ] ];
			var i2 = face[ keys[ ( j + 1 ) % 3 ] ];

			var key = Math.min( i1, i2 ) + ',' + Math.max( i1, i2 );

			if ( this.cachedEdges[ key ] ) {

				this.cachedEdges[ key ].faces.push( i );

			} else {

				this.cachedEdges[ key ] = { vertex1: i1, vertex2: i2, faces: [ i ] };

			}

		}

	}

	this.update( thresholdAngle );

}

THREE.RegionGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.RegionGeometry.constructor = THREE.RegionGeometry;

THREE.RegionGeometry.prototype.update = function( thresholdAngle ) {

	console.time( 'RegionGeometry' );

	this.regions = [];

	thresholdAngle = thresholdAngle === undefined ? 1 : thresholdAngle;
	var thresholdDot = Math.cos( thresholdAngle * Math.PI / 180 );

	var faces = this.geometry.faces;

	var regionIndex = 0;
	var edges = [];
	var keys = [ 'a', 'b', 'c' ];

	for ( var i = 0; i < faces.length; i ++ ) {
		faces[ i ].regionIndex = -1;
	}

	for ( var i = 0; i < faces.length; i ++ ) {

		if ( faces[ i ].regionIndex > -1 ) continue;

		this.regions[ regionIndex ] = [ i ];
		var facesLeft = [ i ];
		faces[ i ].regionIndex = regionIndex;

		while ( facesLeft.length > 0 ) {

			var faceIndex = facesLeft.shift();
			var face = faces[ faceIndex ];

			for ( var j = 0; j < 3; j ++ ) {

				var i1 = face[ keys[ j ] ];
				var i2 = face[ keys[ ( j + 1 ) % 3 ] ];

				var key = Math.min( i1, i2 ) + ',' + Math.max( i1, i2 );

				var edge = this.cachedEdges[ key ];

				if ( edge.faces.length === 1 ) {

					edges.push( { face1: face, face2: undefined, vertex1: edge.vertex1, vertex2: edge.vertex2 } );
					continue;

				}

				for ( var k = 0; k < edge.faces.length; k++ ) {

					var neighborIndex = edge.faces[ k ];
					var neighbor = faces[ neighborIndex ];

					if ( neighbor.regionIndex === -1 ) {

						if ( face.normal.dot( neighbor.normal ) > thresholdDot ) {
							
							facesLeft.push( neighborIndex );
							neighbor.regionIndex = regionIndex;
							this.regions[ regionIndex ].push( neighborIndex );

						} else {
							edges.push( { face1: faceIndex, face2: neighborIndex, vertex1: edge.vertex1, vertex2: edge.vertex2 } );
						}

					}

				}

			}

		}

		regionIndex++;

	}

	var array = [];

	var vertices = this.geometry.vertices;

	for ( var i = 0; i < edges.length; i ++ ) {

		var e = edges[ i ];

		if ( e.face2 !== undefined && faces[ e.face1 ].regionIndex === faces[ e.face2 ].regionIndex ) continue;

		array.push( vertices[ e.vertex1 ].x, vertices[ e.vertex1 ].y, vertices[ e.vertex1 ].z );
		array.push( vertices[ e.vertex2 ].x, vertices[ e.vertex2 ].y, vertices[ e.vertex2 ].z );

	}

	this.setAttribute( 'position', new THREE.Float32BufferAttribute( array, 3 ) );

	console.timeEnd( 'RegionGeometry' );

}

