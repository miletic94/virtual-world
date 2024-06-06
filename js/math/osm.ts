const Osm = {
  parseRoads: (data: any): { points: Point[]; segments: Segment[] } => {
    const nodes = data.elements.filter((n: any) => n.type == "node");
    console.log(nodes);

    const lats = nodes.map((n: any) => n.lat);
    const lons = nodes.map((n: any) => n.lon);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const deltaLat = maxLat - minLat;
    const deltaLon = maxLon - minLon;
    const ar = deltaLon / deltaLat;
    // 111000 is because 1deg in latitude is 11.1km;
    // We are scaling by 10 to express 1 deg in hundreds of meters to make the road relatively thinner.
    const height = deltaLat * 111000 * 10;
    const width = height * ar * Math.cos(degToRad(maxLat));

    const points: Point[] = [];
    const segments: Segment[] = [];
    for (const node of nodes) {
      const y = invLerp(maxLat, minLat, node.lat) * height;
      const x = invLerp(minLon, maxLon, node.lon) * width;

      points.push(new Point(x, y, node.id));
    }

    const ways = data.elements.filter((w: any) => w.type == "way");
    for (const way of ways) {
      const ids = way.nodes;
      for (let i = 1; i < ids.length; i++) {
        const prev = points.find((p: Point) => p.id == ids[i - 1]);
        const cur = points.find((p: Point) => p.id == ids[i]);
        segments.push(new Segment(prev!, cur!));
      }
    }

    return { points, segments };
  },
};
