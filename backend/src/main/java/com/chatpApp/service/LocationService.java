package com.chatpApp.service;


import com.chatpApp.dto.LiveLocationUpdate;
import com.chatpApp.dto.LocationUpdateRequest;
import com.chatpApp.dto.LocationUpdateResponse;
import com.chatpApp.dto.UserSearchResponse;
import com.chatpApp.util.GeoHashUtil;
import com.chatpApp.entity.User;
import com.chatpApp.repository.UserRepository;
import com.chatpApp.util.GeoUtils;
import org.locationtech.jts.geom.Point;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final UserRepository userRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;


    public LocationService(UserRepository userRepository,
                           SimpMessagingTemplate simpMessagingTemplate) {
        this.userRepository = userRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    public LocationUpdateResponse updateLocation(Long userId, LocationUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Point point = GeoUtils.createPoint(request.getLatitude(), request.getLongitude());
        String newGeohash = GeoHashUtil.getGeohash(request.getLatitude(), request.getLongitude());

        user.setLocation(point);
        user.setLocationUpdatedAt(LocalDateTime.now());
        user.setCurrentGeohash(newGeohash);
        userRepository.save(user);

        LiveLocationUpdate update = new LiveLocationUpdate(
                user.getId(), user.getUsername(), request.getLatitude(), request.getLongitude()
        );

        simpMessagingTemplate.convertAndSend("/topic/group-" + newGeohash + "-locations", update);
        double[] boundingBox = GeoHashUtil.getBoundingBox(newGeohash);
        return new LocationUpdateResponse(newGeohash, "Location updated successfully", boundingBox);
    }

    public List<UserSearchResponse> getUsersInZone(String geohash, Long excludeUserId) {
        return userRepository.findByCurrentGeohash(geohash)
                .stream()
                .map(u -> new UserSearchResponse(u.getId(), u.getUsername()))
                .collect(Collectors.toList());
    }
}
