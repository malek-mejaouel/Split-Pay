package com.splitpay.savings.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Trace d'un arrondi genere par la consommation d'un evenement `wallet.debited` de type PURCHASE.
 * {@code sourceEventId} est unique : garantit l'idempotence du traitement des evenements.
 */
@Entity
@Table(
        name = "round_ups",
        uniqueConstraints = @UniqueConstraint(name = "uk_round_ups_source_event_id", columnNames = "source_event_id"),
        indexes = @Index(name = "idx_round_ups_account_status", columnList = "account_id, status")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoundUp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "account_id", nullable = false, updatable = false)
    private UUID accountId;

    /** Identifiant de l'evenement source (contrainte d'unicite : idempotence). */
    @Column(name = "source_event_id", nullable = false, updatable = false, unique = true)
    private UUID sourceEventId;

    @Column(name = "original_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal originalAmount;

    @Column(name = "rounded_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal roundedAmount;

    @Column(name = "saved_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal savedAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RoundUpStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
