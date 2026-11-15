package com.splitpay.savings.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Proprietes de configuration specifiques au service d'epargne.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "savings")
public class SavingsProperties {

    private Rabbit rabbitmq = new Rabbit();
    private Goal goal = new Goal();
    private RoundUp roundup = new RoundUp();

    @Getter
    @Setter
    public static class Rabbit {
        private String exchange = "splitpay.events";
        private String queue = "savings.queue";
        private String routingKey = "wallet.debited";
        private String deadLetterExchange = "splitpay.events.dlx";
        private String deadLetterQueue = "savings.queue.dlq";
        private String deadLetterRoutingKey = "savings.dead";
    }

    @Getter
    @Setter
    public static class Goal {
        /** Nombre maximum d'objectifs IN_PROGRESS par compte. */
        private int maxInProgressPerAccount = 10;
    }

    @Getter
    @Setter
    public static class RoundUp {
        /** Delai entre deux tentatives de rejeu des arrondis DEFERRED (ms). */
        private long retryDelayMs = 60_000L;
    }
}
