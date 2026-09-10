package com.chatpApp.service;

import com.chatpApp.entity.GroupMessage;
import com.chatpApp.repository.GroupMessageRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GroupMessageCleanupService {

    private final GroupMessageRepository groupMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public GroupMessageCleanupService(
            GroupMessageRepository groupMessageRepository,
            SimpMessagingTemplate messagingTemplate) {

        this.groupMessageRepository = groupMessageRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void cleanupOldGroupMessage() {

        LocalDateTime cutoff =
                LocalDateTime.now().minusMinutes(1);

        // 1. Find messages older than 1 minute
        List<GroupMessage> oldMessages =
                groupMessageRepository.findByTimestampBefore(cutoff);

        // 2. Delete them from database
        groupMessageRepository.deleteAll(oldMessages);

        // 3. Tell connected frontend clients
        for (GroupMessage message : oldMessages) {

            Map<String, Object> deleteEvent = new HashMap<>();

            deleteEvent.put("type", "MESSAGE_DELETED");
            deleteEvent.put("messageId", message.getId());

            messagingTemplate.convertAndSend(
                    "/topic/group-" + message.getGeohash(),
                    (Object) deleteEvent
            );
        }

        System.out.println(
                "Deleted " + oldMessages.size() +
                        " messages older than: " + cutoff
        );
    }
}