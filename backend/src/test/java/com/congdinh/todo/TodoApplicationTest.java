package com.congdinh.todo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class TodoApplicationTest {

    @Test
    public void contextLoads() {
        // This test ensures the Spring context loads successfully
        assertThat(true).isTrue();
    }
}
