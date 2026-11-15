package com.splitpay.savings.dto;

import com.splitpay.savings.entity.GoalStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Schema(name = "GoalResponse", description = "Objectif d'epargne")
public record GoalResponse(
        UUID id,
        String name,
        BigDecimal targetAmount,
        BigDecimal currentAmount,
        LocalDate deadline,
        GoalStatus status
) {
}
