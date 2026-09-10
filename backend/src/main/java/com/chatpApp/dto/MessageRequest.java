package com.chatpApp.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class MessageRequest {
    private Long senderId;
    private Long receiverId;
    private String content;
    private String messageType;
    private String audioUrl;
    private String imageUrl;
}
