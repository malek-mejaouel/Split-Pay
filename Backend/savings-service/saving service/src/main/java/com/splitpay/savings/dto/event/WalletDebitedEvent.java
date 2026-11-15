package com.splitpay.savings.dto.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;
import java.util.UUID;

/**
 * Enveloppe standard des evenements publies sur `splitpay.events` :
 * { eventId, type, occurredAt, producer, data }.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record WalletDebitedEvent(
        UUID eventId,
        String type,
        Instant occurredAt,
        String producer,
        WalletDebitedData data
) {

    public static final String TYPE_PURCHASE = "PURCHASE";

    public boolean isPurchase() {
        return TYPE_PURCHASE.equalsIgnoreCase(type);
    }
}
