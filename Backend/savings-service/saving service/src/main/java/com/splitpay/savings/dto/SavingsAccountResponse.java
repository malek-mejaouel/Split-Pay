package com.splitpay.savings.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "SavingsAccountResponse", description = "Compte d'epargne de l'utilisateur connecte")
public record SavingsAccountResponse(
        UUID id,
        UUID userId,
        BigDecimal balance,
        boolean roundUpEnabled,
        BigDecimal roundUpStep,
        LocalDateTime createdAt
) {
}
