package com.chatpApp.service;

//import com.chatpApp.dto.*;
import com.chatpApp.dto.*;
import org.locationtech.jts.geom.Point;
import com.chatpApp.util.GeoHashUtil;
import com.chatpApp.entity.User;
import com.chatpApp.repository.UserRepository;
import com.chatpApp.util.GeoUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public RegisterResponse register(RegisterRequest request) {

        String imageUrl = resolveImageUrl(request);

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .dob(request.getDob())
                .imgUrl(imageUrl)
                .gender(request.getGender())
                .build();

        User savedUser = userRepository.save(user);

        return RegisterResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .dob(savedUser.getDob())
                .imageUrl(savedUser.getImgUrl())
                .gender(savedUser.getGender())
                .build();
    }

    private String resolveImageUrl(RegisterRequest request) {
        if(request.getImage() != null && !request.getImage().isEmpty()) {
            return saveProductImage(request.getImage());
        }
        throw new IllegalArgumentException("Image filed is required");
    }

    public String saveProductImage(MultipartFile file) {
        try {
            String folder = "uploads/product-images/";
            Files.createDirectories(Paths.get(folder));

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(folder + filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return "uploads/product-images/" + filename;

        } catch(IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Fail to save to the product image", e);
        }
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return LoginResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .profileImage(user.getImgUrl())
                .message("Login successful")
                .build();
    }


    public List<UserSearchResponse> searchUsers(String username) {
        return userRepository.findByUsernameContainingIgnoreCase(username)
                .stream()
                .map(u -> new UserSearchResponse(u.getId(), u.getUsername()))
                .collect(Collectors.toList());
    }

    public GuestLoginResponse guestLogin(GuestLoginRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setIsGuest(true);

        User saved = userRepository.save(user);
        return GuestLoginResponse.builder()
                .id(saved.getId())
                .username(saved.getUsername())
                .build();
    }
}