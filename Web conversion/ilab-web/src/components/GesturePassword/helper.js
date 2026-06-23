export function isPointInCircle(point, center, radius) {
  const distance = getDistance(point, center);

  return distance <= radius;
}

export function getDistance(pointA, pointB) {
  const a = Math.pow((pointA.x - pointB.x), 2);
  const b = Math.pow((pointA.y - pointB.y), 2);

  return Math.sqrt(a + b);
}

export function getTransform(pointA, pointB) {
  const distance = getDistance(pointA, pointB);

  const c = (pointB.x - pointA.x) / distance;
  let a = Math.acos(c);

  if (pointA.y > pointB.y) {
    a = 2 * Math.PI - a;
  }

  const c1 = {
    x: pointA.x + distance / 2,
    y: pointA.y,
  };

  const c2 = {
    x: (pointB.x + pointA.x) / 2,
    y: (pointB.y + pointA.y) / 2,
  };

  const x = c2.x - c1.x;
  const y = c2.y - c1.y;

  return {
    d: distance, a, x, y,
  };
}

export function isEquals(pointA, pointB) {
  return (Math.ceil(pointA.x) === Math.ceil(pointB.x) && Math.ceil(pointA.y) === Math.ceil(pointB.y));
}

export function getMiddlePoint(pointA, pointB) {
  return {
    x: (pointB.x + pointA.x) / 2,
    y: (pointB.y + pointA.y) / 2,
  };
}

export function getRealPassword(str) {
  return str.replace(/\d/g, $0 => Number($0) + 1);
}
