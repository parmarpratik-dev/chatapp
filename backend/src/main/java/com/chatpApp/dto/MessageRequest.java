package com.chatpApp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageRequest {

    private Long senderId;
    private Long receiverId;
    private String content;
    private String messageType;
    private String audioUrl;
}
