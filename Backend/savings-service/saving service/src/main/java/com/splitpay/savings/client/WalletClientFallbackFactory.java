package com.splitpay.savings.client;

import com.splitpay.savings.client.dto.WalletTransferResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

/**
 * Fallback du {@link WalletClient} : retourne une reponse "indisponible" au lieu de propager l'erreur.
 */
@Component
@Slf4j
public class WalletClientFallbackFactory implements FallbackFactory<WalletClient> {

    @Override
    public WalletClient create(Throwable cause) {
        return (request, idempotencyKey) -> {
            log.warn("wallet-service indisponible (idempotencyKey={}) : {}", idempotencyKey, cause.getMessage());
            return WalletTransferResponse.unavailable();
        };
    }
}
