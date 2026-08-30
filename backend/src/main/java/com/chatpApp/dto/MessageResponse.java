package com.chatpApp.dto;

import lombok.*;


import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@ToString
@Builder
public class MessageResponse {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String receiverUsername;
    private String content;
    private boolean isDeleted;
    private LocalDateTime timestamp;
    private String messageType;
    private String audioUrl;


}
