const quadPoint = (p0, p1, p2, t) => {
    const u = 1 - t;
    return {
        x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    };
}

export default function piecewiseQuadPoint(p0, mid, p2, h1, h2, t) {
    if (t <= 0.5) {
        const tt = t * 2; // 0..1
        return quadPoint(p0, h1, mid, tt);
    } else {
        const tt = (t - 0.5) * 2; // 0..1
        return quadPoint(mid, h2, p2, tt);
    }
}