package com.chatpApp.controller;


import com.chatpApp.dto.MessageRequest;
import com.chatpApp.dto.MessageResponse;

import com.chatpApp.service.MessageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
    @RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/{user1}/{user2}")
    public List<MessageResponse> getConversation(@PathVariable Long user1, @PathVariable Long user2) {
        return messageService.getConversation(user1, user2);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.ok("Message deleted successfully");
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MessageResponse> updateMessage(@PathVariable Long id, @RequestBody MessageRequest request) {
        MessageResponse response = messageService.messageUpdate(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload-media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadMedia(@RequestParam("media") MultipartFile media) {
        String mediaUrl = messageService.saveMediaFile(media);
        return ResponseEntity.ok(Map.of("mediaUrl", mediaUrl));
    }
}
