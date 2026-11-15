package com.splitpay.savings.client.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Reponse du wallet-service suite a un transfert.
 * A adapter au contrat exact expose par le microservice wallet.
 */
public record WalletTransferResponse(
        String status,
        UUID transactionId,
        BigDecimal newBalance
) {

    public static WalletTransferResponse unavailable() {
        return new WalletTransferResponse("UNAVAILABLE", null, null);
    }
}
