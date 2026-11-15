package com.splitpay.savings.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.splitpay.savings.entity.RoundUp;
import com.splitpay.savings.entity.RoundUpStatus;
import com.splitpay.savings.entity.SavingsAccount;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Tests d'integration (Testcontainers PostgreSQL) des contraintes de la base savings_db.
 * <p>
 * Verifie les deux contraintes d'unicite critiques du service :
 * <ul>
 *     <li>{@code savings_accounts.user_id} : un seul compte d'epargne par utilisateur.</li>
 *     <li>{@code round_ups.source_event_id} : idempotence du traitement des evenements.</li>
 * </ul>
 * Nomme {@code *IT} pour etre execute par le plugin maven-failsafe (phase verify).
 */
@Testcontainers
@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "spring.rabbitmq.listener.simple.auto-startup=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class SavingsRepositoryIT {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private SavingsAccountRepository accountRepository;

    @Autowired
    private RoundUpRepository roundUpRepository;

    @Test
    @DisplayName("L'unicite de user_id est garantie par la base")
    void shouldRejectDuplicateUserId() {
        UUID userId = UUID.randomUUID();
        accountRepository.saveAndFlush(newAccount(userId));

        SavingsAccount duplicate = newAccount(userId);

        assertThatThrownBy(() -> accountRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);

        assertThat(accountRepository.findByUserId(userId)).isPresent();
    }

    @Test
    @DisplayName("L'unicite de source_event_id est garantie par la base (idempotence)")
    void shouldRejectDuplicateSourceEventId() {
        SavingsAccount account = accountRepository.saveAndFlush(newAccount(UUID.randomUUID()));
        UUID eventId = UUID.randomUUID();
        roundUpRepository.saveAndFlush(newRoundUp(account.getId(), eventId));

        RoundUp duplicate = newRoundUp(account.getId(), eventId);

        assertThatThrownBy(() -> roundUpRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);

        assertThat(roundUpRepository.existsBySourceEventId(eventId)).isTrue();
    }

    private SavingsAccount newAccount(UUID userId) {
        return SavingsAccount.builder()
                .userId(userId)
                .balance(new BigDecimal("0.00"))
                .roundUpEnabled(false)
                .roundUpStep(new BigDecimal("1.00"))
                .createdAt(LocalDateTime.now())
                .build();
    }

    private RoundUp newRoundUp(UUID accountId, UUID sourceEventId) {
        return RoundUp.builder()
                .accountId(accountId)
                .sourceEventId(sourceEventId)
                .originalAmount(new BigDecimal("12.30"))
                .roundedAmount(new BigDecimal("13.00"))
                .savedAmount(new BigDecimal("0.70"))
                .status(RoundUpStatus.SAVED)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
