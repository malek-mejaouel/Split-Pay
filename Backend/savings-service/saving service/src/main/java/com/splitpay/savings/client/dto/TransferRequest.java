package com.splitpay.savings.client.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Corps de la requete de transfert vers le wallet-service.
 * A adapter au contrat exact expose par le microservice wallet.
 */
public record TransferRequest(
        UUID walletId,
        BigDecimal amount,
        String currency,
        String reference
) {
}
