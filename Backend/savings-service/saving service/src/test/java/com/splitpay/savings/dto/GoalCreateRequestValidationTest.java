package com.splitpay.savings.dto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

@DisplayName("Validation de GoalCreateRequest")
class GoalCreateRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("invalidRequests")
    void shouldRejectInvalidRequest(String label, GoalCreateRequest request, String expectedField) {
        Set<ConstraintViolation<GoalCreateRequest>> violations = validator.validate(request);

        assertThat(violations)
                .as("violations attendues pour : " + label)
                .isNotEmpty();
        assertThat(violations)
                .as("champ fautif attendu : " + expectedField)
                .anyMatch(v -> v.getPropertyPath().toString().equals(expectedField));
        assertThat(violations)
                .allMatch(v -> v.getMessage() != null && !v.getMessage().isBlank());
    }

    static Stream<Arguments> invalidRequests() {
        BigDecimal validAmount = new BigDecimal("1500.00");
        LocalDate future = LocalDate.now().plusMonths(1);

        return Stream.of(
                arguments("name null", new GoalCreateRequest(null, validAmount, future), "name"),
                arguments("name vide", new GoalCreateRequest("    ", validAmount, future), "name"),
                arguments("name trop court", new GoalCreateRequest("ab", validAmount, future), "name"),
                arguments("name trop long", new GoalCreateRequest("a".repeat(51), validAmount, future), "name"),
                arguments("name avec balise HTML",
                        new GoalCreateRequest("Voyage <script>", validAmount, future), "name"),
                arguments("name avec caractere interdit",
                        new GoalCreateRequest("Voyage #2027", validAmount, future), "name"),
                arguments("targetAmount null", new GoalCreateRequest("Voyage a Paris", null, future), "targetAmount"),
                arguments("targetAmount negatif",
                        new GoalCreateRequest("Voyage a Paris", new BigDecimal("-10.00"), future), "targetAmount"),
                arguments("targetAmount nul",
                        new GoalCreateRequest("Voyage a Paris", new BigDecimal("0.00"), future), "targetAmount"),
                arguments("targetAmount 3 decimales",
                        new GoalCreateRequest("Voyage a Paris", new BigDecimal("10.005"), future), "targetAmount"),
                arguments("targetAmount trop grand",
                        new GoalCreateRequest("Voyage a Paris", new BigDecimal("1000000.01"), future), "targetAmount"),
                arguments("deadline null", new GoalCreateRequest("Voyage a Paris", validAmount, null), "deadline"),
                arguments("deadline passee",
                        new GoalCreateRequest("Voyage a Paris", validAmount, LocalDate.now().minusDays(1)), "deadline")
        );
    }

    @Test
    @DisplayName("Accepte une requete valide")
    void shouldAcceptValidRequest() {
        GoalCreateRequest request = new GoalCreateRequest(
                "Voyage à Paris", new BigDecimal("1500.00"), LocalDate.now().plusMonths(2));

        assertThat(validator.validate(request)).isEmpty();
    }
}
