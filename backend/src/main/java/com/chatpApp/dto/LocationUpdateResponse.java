package com.chatpApp.dto;

import lombok.AllArgsConstructor;
import lombok.ToString;


public class LocationUpdateResponse {

    private String geohash;
    private String message;
    private double[] boundingBox;

    public LocationUpdateResponse(String geohash, String message, double[] boundingBox) {
        this.geohash = geohash;
        this.message = message;
        this.boundingBox = boundingBox;
    }

   public String getGeohash() {
       return geohash;
   }

   public String getMessage() {
       return message;
   }

   public double[] getBoundingBox() {
        return boundingBox;
   }

   public void setGeohash(String geohash) {
       this.geohash = geohash;
   }

   public void setMessage(String message) {
       this.message = message;
   }

   public void setBoundingBox(double[] boundingBox) {
        this.boundingBox = boundingBox;
   }
}
