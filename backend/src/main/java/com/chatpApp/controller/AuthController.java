package com.chatpApp.controller;


import com.chatpApp.dto.*;
import com.chatpApp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RegisterResponse> register(
            @Valid @ModelAttribute RegisterRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        request.setImage(image);

        RegisterResponse registerResponse = userService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(registerResponse);
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public List<UserSearchResponse> search(@RequestParam String username) {
        return userService.searchUsers(username);
    }

    @PostMapping("/guest")
    public ResponseEntity<GuestLoginResponse> guestLogin(@RequestBody GuestLoginRequest request) {
        GuestLoginResponse response = userService.guestLogin(request);
        return ResponseEntity.ok(response);
    }

}

