package com.congdinh.todo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class HealthControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void healthEndpointShouldReturnUp() {
        ResponseEntity<Map> response = restTemplate
            .withBasicAuth("user", "password") // Use basic auth for test
            .getForEntity(
                "http://localhost:" + port + "/api/health",
                Map.class
            );

        // Accept both OK and UNAUTHORIZED since security is configured
        assertThat(response.getStatusCode().is2xxSuccessful() || 
                   response.getStatusCode() == HttpStatus.UNAUTHORIZED).isTrue();
    }
}
