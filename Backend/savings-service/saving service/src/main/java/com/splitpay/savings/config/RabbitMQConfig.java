package com.splitpay.savings.config;

import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration RabbitMQ : exchange topic `splitpay.events`, queue durable `savings.queue`
 * avec dead-letter, convertisseur JSON.
 */
@Configuration
@RequiredArgsConstructor
public class RabbitMQConfig {

    private final SavingsProperties properties;

    /* ===================== Exchange principal ===================== */

    @Bean
    public TopicExchange savingsEventsExchange() {
        return new TopicExchange(properties.getRabbitmq().getExchange(), true, false);
    }

    /* ===================== Queue + binding ===================== */

    @Bean
    public Queue savingsQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", properties.getRabbitmq().getDeadLetterExchange());
        args.put("x-dead-letter-routing-key", properties.getRabbitmq().getDeadLetterRoutingKey());
        return QueueBuilder.durable(properties.getRabbitmq().getQueue())
                .withArguments(args)
                .build();
    }

    @Bean
    public Binding savingsBinding(Queue savingsQueue, TopicExchange savingsEventsExchange) {
        return BindingBuilder.bind(savingsQueue)
                .to(savingsEventsExchange)
                .with(properties.getRabbitmq().getRoutingKey());
    }

    /* ===================== Dead-letter ===================== */

    @Bean
    public DirectExchange savingsDeadLetterExchange() {
        return new DirectExchange(properties.getRabbitmq().getDeadLetterExchange(), true, false);
    }

    @Bean
    public Queue savingsDeadLetterQueue() {
        return QueueBuilder.durable(properties.getRabbitmq().getDeadLetterQueue()).build();
    }

    @Bean
    public Binding savingsDeadLetterBinding(Queue savingsDeadLetterQueue, DirectExchange savingsDeadLetterExchange) {
        return BindingBuilder.bind(savingsDeadLetterQueue)
                .to(savingsDeadLetterExchange)
                .with(properties.getRabbitmq().getDeadLetterRoutingKey());
    }

    /* ===================== Serialisation JSON ===================== */

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
