package com.chatpApp.controller;

import com.chatpApp.dto.LocationUpdateRequest;
import com.chatpApp.dto.LocationUpdateResponse;
import com.chatpApp.dto.NearByUserResponse;
import com.chatpApp.dto.UserSearchResponse;
import com.chatpApp.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PutMapping("/location")
    public ResponseEntity<LocationUpdateResponse> updateLocation(@RequestParam Long userId,
                                                                 @RequestBody LocationUpdateRequest request) {


        LocationUpdateResponse response = locationService.updateLocation(userId, request);

        return ResponseEntity.ok(response);
   }

   @GetMapping("/zone-users")
   public List<NearByUserResponse> getZoneUsers(@RequestParam String geohash, @RequestParam Long userId) {
        return locationService.getUsersInZone(geohash, userId);
   }
}
