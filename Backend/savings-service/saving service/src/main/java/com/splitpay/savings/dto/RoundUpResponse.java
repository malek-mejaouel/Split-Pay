package com.splitpay.savings.dto;

import com.splitpay.savings.entity.RoundUpStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "RoundUpResponse", description = "Arrondi d'epargne (lecture seule)")
public record RoundUpResponse(
        UUID id,
        UUID sourceEventId,
        BigDecimal originalAmount,
        BigDecimal roundedAmount,
        BigDecimal savedAmount,
        RoundUpStatus status,
        LocalDateTime createdAt
) {
}
