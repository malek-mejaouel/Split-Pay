package com.splitpay.savings.dto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.math.BigDecimal;
import java.util.Set;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

@DisplayName("Validation de SettingsRequest")
class SettingsRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("invalidRequests")
    void shouldRejectInvalidRequest(String label, SettingsRequest request, String expectedField) {
        Set<ConstraintViolation<SettingsRequest>> violations = validator.validate(request);

        assertThat(violations).as("violations attendues pour : " + label).isNotEmpty();
        assertThat(violations).as("champ fautif attendu : " + expectedField)
                .anyMatch(v -> v.getPropertyPath().toString().equals(expectedField));
    }

    static Stream<Arguments> invalidRequests() {
        return Stream.of(
                arguments("roundUpEnabled null", new SettingsRequest(null, new BigDecimal("1.00")), "roundUpEnabled"),
                arguments("roundUpStep null", new SettingsRequest(true, null), "roundUpStep"),
                arguments("roundUpStep non autorise", new SettingsRequest(true, new BigDecimal("3.00")), "roundUpStep"),
                arguments("roundUpStep 3 decimales", new SettingsRequest(true, new BigDecimal("1.234")), "roundUpStep"),
                arguments("roundUpStep negatif", new SettingsRequest(true, new BigDecimal("-1.00")), "roundUpStep")
        );
    }

    @Test
    @DisplayName("Accepte les pas autorises (comparaison par compareTo, echelle differente)")
    void shouldAcceptAllowedSteps() {
        assertThat(validator.validate(new SettingsRequest(false, new BigDecimal("0.50")))).isEmpty();
        assertThat(validator.validate(new SettingsRequest(true, new BigDecimal("1.00")))).isEmpty();
        assertThat(validator.validate(new SettingsRequest(true, new BigDecimal("1.0")))).isEmpty();
        assertThat(validator.validate(new SettingsRequest(true, new BigDecimal("2.00")))).isEmpty();
        assertThat(validator.validate(new SettingsRequest(true, new BigDecimal("5.00")))).isEmpty();
    }
}
