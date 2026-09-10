package com.chatpApp.repository;

import com.chatpApp.entity.GroupMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {
    List<GroupMessage> findByGeohashOrderByTimestampAsc(String geohash);

    List<GroupMessage> findByTimestampBefore(LocalDateTime cutoff);
}
