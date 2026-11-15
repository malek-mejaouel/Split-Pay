package com.splitpay.savings.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
import org.hibernate.annotations.Check;

/**
 * Compte d'epargne d'un utilisateur (un seul compte par utilisateur).
 */
@Entity
@Table(
        name = "savings_accounts",
        uniqueConstraints = @UniqueConstraint(name = "uk_savings_accounts_user_id", columnNames = "user_id")
)
@Check(constraints = "balance >= 0 AND round_up_step > 0")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /** Identifiant de l'utilisateur proprietaire (claim `sub` du JWT). Non modifiable. */
    @Column(name = "user_id", nullable = false, updatable = false, unique = true)
    private UUID userId;

    @Column(name = "balance", nullable = false, precision = 19, scale = 2)
    private BigDecimal balance;

    @Column(name = "round_up_enabled", nullable = false)
    private boolean roundUpEnabled;

    @Column(name = "round_up_step", nullable = false, precision = 19, scale = 2)
    private BigDecimal roundUpStep;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
