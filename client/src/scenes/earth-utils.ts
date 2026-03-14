import * as THREE from "three"

const DEG_TO_RAD = Math.PI / 180

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function latLngToVector3(lat: number, lng: number, radius = 1) {
  const phi = (90 - lat) * DEG_TO_RAD
  const theta = (lng + 180) * DEG_TO_RAD

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

export function outwardQuaternion(position: THREE.Vector3) {
  const up = new THREE.Vector3(0, 0, 1)
  const normal = position.clone().normalize()
  return new THREE.Quaternion().setFromUnitVectors(up, normal)
}
