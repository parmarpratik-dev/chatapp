package com.chatpApp.dto;


import com.chatpApp.entity.Gender;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 80)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter valid email")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 20)
    private String password;

    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private MultipartFile image;

}
