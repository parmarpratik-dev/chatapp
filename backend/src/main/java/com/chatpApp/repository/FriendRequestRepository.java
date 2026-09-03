package com.chatpApp.repository;

import com.chatpApp.entity.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
    "(fr.senderId = :user1 AND fr.receiverId = :user2) OR" +
    "(fr.senderId = :user2 AND fr.receiverId = :user1)")
    Optional<FriendRequest> findBetweenUsers(@Param("user1") Long user1, @Param("user2") Long user2);

    List<FriendRequest> findByReceiverIdAndStatus(Long receiverId, FriendRequest.RequestStatus status);

    @Query("""
    SELECT fr
    FROM FriendRequest fr
    WHERE fr.status = 'ACCEPTED'
    AND (
        fr.senderId = :userId
        OR fr.receiverId = :userId
    )
""")
    List<FriendRequest> findAcceptedFriend(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(fr) > 0 THEN true ELSE false END FROM FriendRequest fr WHERE " +
            "((fr.senderId = :user1 AND fr.receiverId = :user2) OR " +
            "(fr.senderId = :user2 AND fr.receiverId = :user1)) AND fr.status = 'ACCEPTED'")
    boolean areFriends(@Param("user1") Long user1, @Param("user2") Long user2);

}
