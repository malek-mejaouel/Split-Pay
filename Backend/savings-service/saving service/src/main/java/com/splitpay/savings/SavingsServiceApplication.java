package com.splitpay.savings;

import com.splitpay.savings.config.SavingsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Point d'entree du microservice d'epargne par arrondi (SplitPay - MS6).
 */
@SpringBootApplication
@EnableFeignClients
@EnableScheduling
@EnableConfigurationProperties(SavingsProperties.class)
public class SavingsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SavingsServiceApplication.class, args);
    }
}
