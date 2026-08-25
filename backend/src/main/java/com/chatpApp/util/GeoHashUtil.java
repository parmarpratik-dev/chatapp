package com.chatpApp.util;

import com.github.davidmoten.geo.GeoHash;
import com.github.davidmoten.geo.LatLong;

public class GeoHashUtil {

    private static final int PRECISION = 4; // matches your existing zone size setting

    public static String getGeohash(double latitude, double longitude) {
        return GeoHash.encodeHash(latitude, longitude, PRECISION);
    }

        public static double[] getBoundingBox(String geohash) {
        LatLong center = GeoHash.decodeHash(geohash);

        double heightDegrees = GeoHash.heightDegrees(geohash.length());
        double widthDegrees = GeoHash.widthDegrees(geohash.length());

        double minLat = center.getLat() - (heightDegrees / 2);
        double maxLat = center.getLat() + (heightDegrees / 2);
        double minLon = center.getLon() - (widthDegrees / 2);
        double maxLon = center.getLon() + (widthDegrees / 2);

        return new double[] { minLat, minLon, maxLat, maxLon };
    }
}