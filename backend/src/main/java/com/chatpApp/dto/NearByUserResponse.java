package com.chatpApp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class NearByUserResponse {
    private Long id;
    private String username;

    private String imgUrl;
}
