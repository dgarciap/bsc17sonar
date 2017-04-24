var soundSphereVS =
classicNoise3D +
`varying vec2 vUv;
varying float noise;
uniform float time;

float turbulence( vec3 p ) {
  float w = 100.0;
  float t = -.5;

  for (float f = 1.0 ; f <= 10.0 ; f++ ){
    float power = pow( 2.0, f );
    t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
  }
  return t;
}

void main() {
  vUv = uv;

  // get a turbulent 3d noise using the normal, normal to high freq
  noise = 10.0 *  -.10 * turbulence( .5 * normal + time);
  float b = 0.2 * pnoise( 0.05 * position + vec3( 2.0 * time ), vec3( 100.0 ) );
  // compose both noises
  float displacement = - 10. * noise + b;

  // move the position along the normal and transform it
  vec3 newPosition = position + normal * displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}`;