package com.splitpay.savings.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Documentation OpenAPI (Swagger UI : /swagger-ui.html).
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI savingsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SplitPay - savings-service")
                        .version("v1")
                        .description("Microservice d'epargne par arrondi (MS6). Authentification Keycloak (JWT, role STUDENT).")
                        .contact(new Contact().name("SplitPay")))
                .components(new Components().addSecuritySchemes("bearerAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
