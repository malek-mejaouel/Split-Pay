package com.splitpay.savings.dto.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Charge utile de l'evenement `wallet.debited`.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record WalletDebitedData(
        UUID userId,
        UUID walletId,
        BigDecimal amount,
        String currency,
        String type
) {
}
