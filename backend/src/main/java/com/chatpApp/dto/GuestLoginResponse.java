package com.chatpApp.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GuestLoginResponse {

    private Long id;
    private String username;
}
