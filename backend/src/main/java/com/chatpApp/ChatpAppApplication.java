package com.chatpApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class  ChatpAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChatpAppApplication.class, args);
	}

}
