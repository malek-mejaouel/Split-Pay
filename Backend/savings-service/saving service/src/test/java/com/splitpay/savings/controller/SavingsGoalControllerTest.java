package com.splitpay.savings.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.splitpay.savings.config.SecurityConfig;
import com.splitpay.savings.dto.GoalResponse;
import com.splitpay.savings.dto.PageResponse;
import com.splitpay.savings.entity.GoalStatus;
import com.splitpay.savings.exception.BadRequestException;
import com.splitpay.savings.exception.ErrorCode;
import com.splitpay.savings.exception.ConflictException;
import com.splitpay.savings.exception.ResourceNotFoundException;
import com.splitpay.savings.security.CurrentUserProvider;
import com.splitpay.savings.service.SavingsGoalService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
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

@WebMvcTest(controllers = SavingsGoalController.class)
@Import({SecurityConfig.class, CurrentUserProvider.class})
@DisplayName("@WebMvcTest SavingsGoalController")
class SavingsGoalControllerTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID GOAL_ID = UUID.randomUUID();

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SavingsGoalService goalService;

    @TestConfiguration
    static class JwtTestSupport {
        @Bean
        JwtDecoder jwtDecoder() {
            return token -> Jwt.withTokenValue(token).header("alg", "none").subject(USER_ID.toString()).build();
        }
    }

    /* ===================== POST /api/savings/goals ===================== */

    @Test
    @DisplayName("POST cree un objectif : 201")
    void create_shouldReturn201() throws Exception {
        given(goalService.createGoal(eq(USER_ID), any())).willReturn(new GoalResponse(
                GOAL_ID, "Voyage a Paris", new BigDecimal("1500.00"), new BigDecimal("0.00"),
                LocalDate.now().plusMonths(3), GoalStatus.IN_PROGRESS));

        mockMvc.perform(post("/api/savings/goals")
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Voyage a Paris",
                                  "targetAmount": 1500.00,
                                  "deadline": "2027-06-30"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/savings/goals/" + GOAL_ID))
                .andExpect(jsonPath("$.id").value(GOAL_ID.toString()))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.currentAmount").value(0.00));
    }

    @Test
    @DisplayName("POST avec donnees invalides : 400 VALIDATION_ERROR avec le champ fautif")
    void create_shouldReturn400WhenBodyInvalid() throws Exception {
        mockMvc.perform(post("/api/savings/goals")
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "ab",
                                  "targetAmount": -5.00,
                                  "deadline": "2020-01-01"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.path").value("/api/savings/goals"))
                .andExpect(jsonPath("$.errors[*].field").value(
                        org.hamcrest.Matchers.hasItems("name", "targetAmount", "deadline")));
    }

    @Test
    @DisplayName("POST avec JSON malforme : 400 MALFORMED_REQUEST")
    void create_shouldReturn400WhenJsonMalformed() throws Exception {
        mockMvc.perform(post("/api/savings/goals")
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"name\": "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
    }

    @Test
    @DisplayName("POST avec nom deja utilise : 409 GOAL_NAME_DUPLICATE")
    void create_shouldReturn409WhenNameDuplicated() throws Exception {
        given(goalService.createGoal(eq(USER_ID), any()))
                .willThrow(new ConflictException(ErrorCode.GOAL_NAME_DUPLICATE, "Nom deja utilise."));

        mockMvc.perform(post("/api/savings/goals")
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Voyage a Paris", "targetAmount": 100.00, "deadline": "2027-01-31"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("GOAL_NAME_DUPLICATE"));
    }

    /* ===================== GET /api/savings/goals ===================== */

    @Test
    @DisplayName("GET liste paginee : 200")
    void list_shouldReturn200() throws Exception {
        given(goalService.listGoals(eq(USER_ID), eq(null), eq(0), eq(20), eq(null), eq(null)))
                .willReturn(new PageResponse<>(List.of(new GoalResponse(GOAL_ID, "Voyage a Paris",
                        new BigDecimal("1500.00"), new BigDecimal("0.00"), LocalDate.now().plusMonths(3),
                        GoalStatus.IN_PROGRESS)), 0, 20, 1L, 1, true));

        mockMvc.perform(get("/api/savings/goals").with(studentJwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(GOAL_ID.toString()))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET avec size > 100 : 400")
    void list_shouldReturn400WhenSizeTooLarge() throws Exception {
        mockMvc.perform(get("/api/savings/goals").param("size", "1000").with(studentJwt()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("GET avec page negative : 400")
    void list_shouldReturn400WhenPageNegative() throws Exception {
        mockMvc.perform(get("/api/savings/goals").param("page", "-1").with(studentJwt()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("GET avec statut inconnu : 400 avec les valeurs acceptees")
    void list_shouldReturn400WhenStatusUnknown() throws Exception {
        mockMvc.perform(get("/api/savings/goals").param("status", "UNKNOWN").with(studentJwt()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_ARGUMENT"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("IN_PROGRESS")));
    }

    @Test
    @DisplayName("GET avec champ de tri non autorise : 400 INVALID_SORT_FIELD")
    void list_shouldReturn400WhenSortFieldNotAllowed() throws Exception {
        given(goalService.listGoals(eq(USER_ID), eq(null), eq(0), eq(20), eq("name"), eq(null)))
                .willThrow(BadRequestException.invalidSortField("Champ de tri 'name' non autorise."));

        mockMvc.perform(get("/api/savings/goals").param("sort", "name").with(studentJwt()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_SORT_FIELD"));
    }

    /* ===================== GET /api/savings/goals/{id} ===================== */

    @Test
    @DisplayName("GET detail : 200")
    void getOne_shouldReturn200() throws Exception {
        given(goalService.getGoal(eq(USER_ID), eq(GOAL_ID))).willReturn(new GoalResponse(GOAL_ID, "Voyage a Paris",
                new BigDecimal("1500.00"), new BigDecimal("10.00"), LocalDate.now().plusMonths(3),
                GoalStatus.IN_PROGRESS));

        mockMvc.perform(get("/api/savings/goals/{id}", GOAL_ID).with(studentJwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Voyage a Paris"));
    }

    @Test
    @DisplayName("GET detail avec UUID invalide : 400 (jamais 500)")
    void getOne_shouldReturn400WhenUuidInvalid() throws Exception {
        mockMvc.perform(get("/api/savings/goals/{id}", "not-a-uuid").with(studentJwt()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_ARGUMENT"));
    }

    @Test
    @DisplayName("GET detail d'un objectif d'un autre utilisateur : 404")
    void getOne_shouldReturn404WhenNotFound() throws Exception {
        given(goalService.getGoal(eq(USER_ID), eq(GOAL_ID)))
                .willThrow(new ResourceNotFoundException("Aucun objectif d'epargne trouve."));

        mockMvc.perform(get("/api/savings/goals/{id}", GOAL_ID).with(studentJwt()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.status").value(404));
    }

    /* ===================== PUT /api/savings/goals/{id} ===================== */

    @Test
    @DisplayName("PUT modifie un objectif : 200")
    void update_shouldReturn200() throws Exception {
        given(goalService.updateGoal(eq(USER_ID), eq(GOAL_ID), any())).willReturn(new GoalResponse(GOAL_ID,
                "Voyage a Rome", new BigDecimal("2000.00"), new BigDecimal("10.00"),
                LocalDate.now().plusMonths(6), GoalStatus.IN_PROGRESS));

        mockMvc.perform(put("/api/savings/goals/{id}", GOAL_ID)
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Voyage a Rome", "targetAmount": 2000.00, "deadline": "2027-12-31"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Voyage a Rome"));
    }

    @Test
    @DisplayName("PUT avec targetAmount < currentAmount : 400 TARGET_BELOW_CURRENT")
    void update_shouldReturn400WhenTargetBelowCurrent() throws Exception {
        given(goalService.updateGoal(eq(USER_ID), eq(GOAL_ID), any()))
                .willThrow(new BadRequestException(ErrorCode.TARGET_BELOW_CURRENT, "Montant cible trop faible."));

        mockMvc.perform(put("/api/savings/goals/{id}", GOAL_ID)
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Voyage a Rome", "targetAmount": 50.00, "deadline": "2027-12-31"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TARGET_BELOW_CURRENT"));
    }

    @Test
    @DisplayName("PUT sur un objectif non modifiable : 409 GOAL_NOT_EDITABLE")
    void update_shouldReturn409WhenNotEditable() throws Exception {
        given(goalService.updateGoal(eq(USER_ID), eq(GOAL_ID), any()))
                .willThrow(new ConflictException(ErrorCode.GOAL_NOT_EDITABLE, "Objectif non modifiable."));

        mockMvc.perform(put("/api/savings/goals/{id}", GOAL_ID)
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Voyage a Rome", "targetAmount": 2000.00, "deadline": "2027-12-31"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("GOAL_NOT_EDITABLE"));
    }

    @Test
    @DisplayName("PUT sur un objectif inexistant : 404")
    void update_shouldReturn404() throws Exception {
        given(goalService.updateGoal(eq(USER_ID), eq(GOAL_ID), any()))
                .willThrow(new ResourceNotFoundException("Aucun objectif d'epargne trouve."));

        mockMvc.perform(put("/api/savings/goals/{id}", GOAL_ID)
                        .with(studentJwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Voyage a Rome", "targetAmount": 2000.00, "deadline": "2027-12-31"}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }

    /* ===================== DELETE /api/savings/goals/{id} ===================== */

    @Test
    @DisplayName("DELETE (suppression logique) : 204")
    void delete_shouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/savings/goals/{id}", GOAL_ID).with(studentJwt()))
                .andExpect(status().isNoContent());

        verify(goalService).deleteGoal(USER_ID, GOAL_ID);
    }

    @Test
    @DisplayName("DELETE sur un objectif inexistant : 404")
    void delete_shouldReturn404() throws Exception {
        willThrow(new ResourceNotFoundException("Aucun objectif d'epargne trouve."))
                .given(goalService).deleteGoal(USER_ID, GOAL_ID);

        mockMvc.perform(delete("/api/savings/goals/{id}", GOAL_ID).with(studentJwt()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }

    private RequestPostProcessor studentJwt() {
        return jwt().jwt(token -> token.subject(USER_ID.toString()))
                .authorities(new SimpleGrantedAuthority("ROLE_STUDENT"));
    }
}
