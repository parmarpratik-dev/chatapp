package com.chatpApp.service;

import com.chatpApp.dto.FriendRequestResponse;
import com.chatpApp.entity.FriendRequest;
import com.chatpApp.entity.User;
import com.chatpApp.exception.BadRequestException;
import com.chatpApp.exception.ConflictException;
import com.chatpApp.exception.ResourceNotFoundException;
import com.chatpApp.repository.FriendRequestRepository;
import com.chatpApp.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FriendRequestService {
    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public FriendRequestService(FriendRequestRepository friendRequestRepository,
                                UserRepository userRepository,
                                SimpMessagingTemplate messagingTemplate) {
        this.friendRequestRepository = friendRequestRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public FriendRequestResponse sendRequest(Long senderId, Long receiverId) {
        if(senderId.equals(receiverId)) {
            throw new BadRequestException("Cannot send request to yourself");
        }
        Optional<FriendRequest> existing = friendRequestRepository.findBetweenUsers(senderId, receiverId);
        if(existing.isPresent()) {
            FriendRequest request = existing.get();
            if(request.getStatus() == FriendRequest.RequestStatus.PENDING ||
            request.getStatus() == FriendRequest.RequestStatus.ACCEPTED) {
                throw new ConflictException("Request already exist between this users");
            }
            request.setSenderId(senderId);
            request.setReceiverId(receiverId);
            request.setStatus(FriendRequest.RequestStatus.PENDING);
            FriendRequest updated = friendRequestRepository.save(request);
            return toResponse(updated);
        }
        FriendRequest request = new FriendRequest();
        request.setSenderId(senderId);
        request.setReceiverId(receiverId);
        FriendRequest saved = friendRequestRepository.save(request);
        return toResponse(saved);
    }

    @Transactional
    public void sendUnfollowRequest(Long senderId, Long receiverId) {
        if(senderId.equals(receiverId)) {
            throw new BadRequestException("Cannot send request to yourself");
        }

        FriendRequest request = friendRequestRepository
                .findBetweenUsers(senderId,receiverId)
                .orElseThrow(() -> new BadRequestException("No friend request found between the user"));

        if(request.getStatus() != FriendRequest.RequestStatus.ACCEPTED) {
            throw new BadRequestException("User are not frineds");
        }

        request.setStatus(FriendRequest.RequestStatus.UNFLLOW);
        friendRequestRepository.save(request);

        messagingTemplate.convertAndSend(
                receiverId.toString(),
                "/queue/friend-updates",
                Map.of("type", "UNFOLLOWED", "friendId", senderId)

        );

    }


    public FriendRequestResponse respondToRequest(Long requestId, boolean accept) {

        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend request not found"));

        request.setStatus(accept ? FriendRequest.RequestStatus.ACCEPTED
                : FriendRequest.RequestStatus.REJECTED);

        FriendRequest saved = friendRequestRepository.save(request);
        return toResponse(saved);
    }

    public List<FriendRequestResponse> getPendingRequests(Long userId) {
        return friendRequestRepository.findByReceiverIdAndStatus(userId, FriendRequest.RequestStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<FriendRequestResponse> getFriends(Long userId) {
        return friendRequestRepository.findAcceptedFriend(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public FriendRequestResponse getStatusBetween(Long user1, Long user2) {
        return friendRequestRepository.findBetweenUsers(user1, user2)
                .map(this::toResponse)
                .orElse(null);
    }

    public void cancelRequest(Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId).
                orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        friendRequestRepository.delete(request);

    }

    private FriendRequestResponse toResponse(FriendRequest fr) {

        User sender = userRepository.findById(fr.getSenderId())
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        User receiver = userRepository.findById(fr.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        return new FriendRequestResponse(
                fr.getId(),
                fr.getSenderId(),
                sender.getUsername(),
                fr.getReceiverId(),
                receiver.getUsername(),
                sender.getImgUrl(),
                receiver.getImgUrl(),
                fr.getStatus().name(),
                fr.getCreatedAt()
        );
    }

}
