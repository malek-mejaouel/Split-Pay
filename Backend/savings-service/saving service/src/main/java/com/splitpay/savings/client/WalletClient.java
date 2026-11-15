package com.splitpay.savings.client;

import com.splitpay.savings.client.dto.TransferRequest;
import com.splitpay.savings.client.dto.WalletTransferResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * Client OpenFeign vers le wallet-service, protege par Resilience4j (circuit breaker + retry)
 * avec un fallback.
 */
@FeignClient(name = "wallet-service", fallbackFactory = WalletClientFallbackFactory.class)
public interface WalletClient {

    @PostMapping("/api/wallets/transfers")
    @CircuitBreaker(name = "walletService")
    @Retry(name = "walletService")
    WalletTransferResponse transfer(@RequestBody TransferRequest request,
                                    @RequestHeader("Idempotency-Key") String key);
}
