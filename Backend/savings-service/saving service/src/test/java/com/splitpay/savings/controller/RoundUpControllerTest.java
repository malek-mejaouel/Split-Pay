package com.splitpay.savings.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.splitpay.savings.config.SecurityConfig;
import com.splitpay.savings.dto.PageResponse;
import com.splitpay.savings.dto.RoundUpResponse;
import com.splitpay.savings.entity.RoundUpStatus;
import com.splitpay.savings.exception.BadRequestException;
import com.splitpay.savings.security.CurrentUserProvider;
import com.splitpay.savings.service.RoundUpService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@WebMvcTest(controllers = RoundUpController.class)
@Import({SecurityConfig.class, CurrentUserProvider.class})
@DisplayName("@WebMvcTest RoundUpController")
class RoundUpControllerTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID ROUND_UP_ID = UUID.randomUUID();
    private static final UUID EVENT_ID = UUID.randomUUID();

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RoundUpService roundUpService;

    @TestConfiguration
    static class JwtTestSupport {
        @Bean
        JwtDecoder jwtDecoder() {
            return token -> Jwt.withTokenValue(token).header("alg", "none").subject(USER_ID.toString()).build();
        }
    }

    @Test
    @DisplayName("GET /api/savings/me/roundups : 200")
    void listRoundUps_shouldReturn200() throws Exception {
        given(roundUpService.listRoundUps(eq(USER_ID), eq(null), eq(0), eq(20), eq(null), eq(null)))
                .willReturn(new PageResponse<>(List.of(new RoundUpResponse(ROUND_UP_ID, EVENT_ID,
                        new BigDecimal("12.30"), new BigDecimal("13.00"), new BigDecimal("0.70"),
                        RoundUpStatus.SAVED, LocalDateTime.now())), 0, 20, 1L, 1, true));

        mockMvc.perform(get("/api/savings/me/roundups").with(studentJwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].sourceEventId").value(EVENT_ID.toString()))
                .andExpect(jsonPath("$.content[0].savedAmount").value(0.70))
                .andExpect(jsonPath("$.content[0].status").value("SAVED"));
    }

    @Test
    @DisplayName("GET avec filtre de statut : 200")
    void listRoundUps_shouldFilterByStatus() throws Exception {
        given(roundUpService.listRoundUps(eq(USER_ID), eq(RoundUpStatus.DEFERRED), eq(0), eq(20), eq(null), eq(null)))
                .willReturn(new PageResponse<>(List.of(), 0, 20, 0L, 0, true));

        mockMvc.perform(get("/api/savings/me/roundups").param("status", "DEFERRED").with(studentJwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty());
    }

    @Test
    @DisplayName("GET avec statut inconnu : 400 avec les valeurs acceptees")
    void listRoundUps_shouldReturn400WhenStatusUnknown() throws Exception {
        mockMvc.perform(get("/api/savings/me/roundups").param("status", "TOTO").with(studentJwt()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_ARGUMENT"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("DEFERRED")));
    }

    @Test
    @DisplayName("GET avec size = 1000 : 400")
    void listRoundUps_shouldReturn400WhenSizeTooLarge() throws Exception {
        mockMvc.perform(get("/api/savings/me/roundups").param("size", "1000").with(studentJwt()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("GET avec page negative : 400")
    void listRoundUps_shouldReturn400WhenPageNegative() throws Exception {
        mockMvc.perform(get("/api/savings/me/roundups").param("page", "-3").with(studentJwt()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("GET avec champ de tri non autorise : 400 INVALID_SORT_FIELD")
    void listRoundUps_shouldReturn400WhenSortNotAllowed() throws Exception {
        given(roundUpService.listRoundUps(eq(USER_ID), eq(null), eq(0), eq(20), eq("id"), eq("asc")))
                .willThrow(BadRequestException.invalidSortField("Champ de tri 'id' non autorise."));

        mockMvc.perform(get("/api/savings/me/roundups").param("sort", "id").param("direction", "asc")
                        .with(studentJwt()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_SORT_FIELD"));
    }

    private RequestPostProcessor studentJwt() {
        return jwt().jwt(token -> token.subject(USER_ID.toString()))
                .authorities(new SimpleGrantedAuthority("ROLE_STUDENT"));
    }
}
