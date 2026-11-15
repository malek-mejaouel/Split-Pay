package com.splitpay.savings.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.splitpay.savings.config.SecurityConfig;
import com.splitpay.savings.dto.SavingsAccountResponse;
import com.splitpay.savings.exception.BadRequestException;
import com.splitpay.savings.exception.ErrorCode;
import com.splitpay.savings.security.CurrentUserProvider;
import com.splitpay.savings.service.SavingsAccountService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@WebMvcTest(controllers = SavingsAccountController.class)
@Import({SecurityConfig.class, CurrentUserProvider.class})
@DisplayName("@WebMvcTest SavingsAccountController")
class SavingsAccountControllerTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID ACCOUNT_ID = UUID.randomUUID();

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SavingsAccountService accountService;

    @TestConfiguration
    static class JwtTestSupport {
        @Bean
        JwtDecoder jwtDecoder() {
            return token -> Jwt.withTokenValue(token).header("alg", "none").subject(USER_ID.toString()).build();
        }
    }

    @Test
    @DisplayName("GET /api/savings/me : 200 (compte cree a la demande)")
    void getMyAccount_shouldReturn200() throws Exception {
        given(accountService.getOrCreateAccount(USER_ID)).willReturn(new SavingsAccountResponse(
                ACCOUNT_ID, USER_ID, new BigDecimal("0.00"), false, new BigDecimal("1.00"), LocalDateTime.now()));

        mockMvc.perform(get("/api/savings/me").with(studentJwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ACCOUNT_ID.toString()))
                .andExpect(jsonPath("$.roundUpEnabled").value(false))
                .andExpect(jsonPath("$.roundUpStep").value(1.00))
                .andExpect(jsonPath("$.balance").value(0.00));
    }

    @Test
    @DisplayName("GET /api/savings/me : 404 si l'utilisateur est introuvable")
    void getMyAccount_shouldReturn404() throws Exception {
        given(accountService.getOrCreateAccount(USER_ID)).willThrow(
                new com.splitpay.savings.exception.ResourceNotFoundException("Utilisateur introuvable."));

        mockMvc.perform(get("/api/savings/me").with(studentJwt()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("PUT /api/savings/me/settings : 200")
    void updateSettings_shouldReturn200() throws Exception {
        given(accountService.updateSettings(eq(USER_ID), any())).willReturn(new SavingsAccountResponse(
                ACCOUNT_ID, USER_ID, new BigDecimal("12.50"), true, new BigDecimal("2.00"), LocalDateTime.now()));

        mockMvc.perform(put("/api/savings/me/settings")
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"roundUpEnabled": true, "roundUpStep": 2.00}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roundUpEnabled").value(true))
                .andExpect(jsonPath("$.roundUpStep").value(2.00));
    }

    @Test
    @DisplayName("PUT reglages avec pas non autorise : 400 avec le champ fautif")
    void updateSettings_shouldReturn400WhenStepNotAllowed() throws Exception {
        mockMvc.perform(put("/api/savings/me/settings")
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"roundUpEnabled": true, "roundUpStep": 3.00}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors[0].field").value("roundUpStep"))
                .andExpect(jsonPath("$.errors[0].message").value(
                        org.hamcrest.Matchers.containsString("0.50")));
    }

    @Test
    @DisplayName("PUT reglages avec roundUpEnabled manquant : 400")
    void updateSettings_shouldReturn400WhenEnabledMissing() throws Exception {
        mockMvc.perform(put("/api/savings/me/settings")
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"roundUpStep": 1.00}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("roundUpEnabled"));
    }

    @Test
    @DisplayName("PUT reglages avec JSON malforme : 400 MALFORMED_REQUEST")
    void updateSettings_shouldReturn400WhenJsonMalformed() throws Exception {
        mockMvc.perform(put("/api/savings/me/settings")
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ roundUpEnabled: "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
    }

    @Test
    @DisplayName("PUT reglages refuse par le service : 400 INVALID_ARGUMENT")
    void updateSettings_shouldReturn400WhenServiceRejects() throws Exception {
        given(accountService.updateSettings(eq(USER_ID), any()))
                .willThrow(new BadRequestException(ErrorCode.INVALID_ARGUMENT, "Le pas d'arrondi autorise est 0.50, 1.00, 2.00, 5.00."));

        mockMvc.perform(put("/api/savings/me/settings")
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"roundUpEnabled": true, "roundUpStep": 1.00}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_ARGUMENT"));
    }

    private RequestPostProcessor studentJwt() {
        return jwt().jwt(token -> token.subject(USER_ID.toString()))
                .authorities(new SimpleGrantedAuthority("ROLE_STUDENT"));
    }
}
