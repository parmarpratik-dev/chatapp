package com.chatpApp.service;

import com.chatpApp.dto.MessageRequest;
import com.chatpApp.dto.MessageResponse;
import com.chatpApp.entity.Message;
import com.chatpApp.exception.BadRequestException;
import com.chatpApp.exception.ResourceNotFoundException;
import com.chatpApp.repository.FriendRequestRepository;
import com.chatpApp.repository.MessageRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

    @Service
    public class MessageService {

        private final MessageRepository messageRepository;
        private final FriendRequestRepository friendRequestRepository;
        private final SimpMessagingTemplate messagingTemplate;

        public MessageService(MessageRepository messageRepository,
                              FriendRequestRepository friendRequestRepository,
                              SimpMessagingTemplate messagingTemplate) {
            this.messageRepository = messageRepository;
            this.friendRequestRepository = friendRequestRepository;
            this.messagingTemplate = messagingTemplate;
        }

        public MessageResponse saveMessage(MessageRequest request) {
            if (!friendRequestRepository.areFriends(request.getSenderId(), request.getReceiverId())) {
                throw new BadRequestException("You can only message friends");
            }

            Message message = new Message();
            message.setSenderId(request.getSenderId());
            message.setReceiverId(request.getReceiverId());
            message.setContent(request.getContent());
            message.setMessageType(request.getMessageType() != null ? request.getMessageType() : "TEXT");
            message.setAudioUrl(request.getAudioUrl());
            message.setTimestamp(java.time.LocalDateTime.now());

            Message saved = messageRepository.save(message);

            return toResponse(saved);
        }

        public List<MessageResponse> getConversation(Long user1, Long user2) {
            return messageRepository.findConversation(user1, user2)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }


        public void deleteMessage(Long id) {
            Message message = messageRepository.findById(id)
                    .orElseThrow(() -> new UsernameNotFoundException("Message not found"));

            message.setDelete(true);
            Message saved = messageRepository.save(message);
            MessageResponse response = toResponse(saved);

            messagingTemplate.convertAndSend("/queue/messages-" + saved.getSenderId() + "-deleted", response);
            messagingTemplate.convertAndSend("/queue/messages-" + saved.getReceiverId() + "-deleted", response);
        }

        public MessageResponse messageUpdate(Long id, MessageRequest request) {
            Message message = messageRepository.findById(id).
                    orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (!request.getSenderId().equals(message.getSenderId())) {
                throw new BadRequestException("You can not edit your own message");
            }

            message.setContent(request.getContent());
            Message saved = messageRepository.save(message);
            MessageResponse response = toResponse(saved);

            messagingTemplate.convertAndSend("/queue/messages-" + saved.getSenderId() + "-edited", response);
            messagingTemplate.convertAndSend("/queue/messages-" + saved.getReceiverId() + "-edited", response);
            return response;
        }

        public String saveAudioFile(MultipartFile file) {
            try {
                String folder = "uploads/audio-messages";
                Files.createDirectories(Paths.get(folder));

                // Fix 1: Added folder separator and cleaned filename
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(folder, filename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Fix 2: Ensure correct leading slash for frontend consumption
                return "/uploads/audio-messages/" + filename;
            } catch (IOException e) {
                throw new RuntimeException("Failed to save audio file", e);
            }
        }

        public MessageResponse toResponse(Message message) {


            return MessageResponse.builder()
                    .id(message.getId())
                    .senderId(message.getSenderId())
                    .receiverId(message.getReceiverId())
                    .content(message.getContent())
                    .isDeleted(message.isDelete())
                    .messageType(message.getMessageType())
                    .audioUrl(message.getAudioUrl())
                    .timestamp(message.getTimestamp())
                    .build();
        }
    }
