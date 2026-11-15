package com.splitpay.savings.validation;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("Test unitaire du validateur @AllowedStep")
class AllowedStepValidatorTest {

    private final AllowedStepValidator validator = new AllowedStepValidator();

    @ParameterizedTest(name = "pas {0} accepte")
    @ValueSource(strings = {"0.50", "1.00", "2.00", "5.00", "1.0", "0.500"})
    void shouldAcceptAllowedStep(String value) {
        assertThat(validator.isValid(new BigDecimal(value), null)).isTrue();
    }

    @ParameterizedTest(name = "pas {0} refuse")
    @ValueSource(strings = {"0.00", "0.25", "3.00", "1.50", "10.00", "-1.00"})
    void shouldRejectNotAllowedStep(String value) {
        assertThat(validator.isValid(new BigDecimal(value), null)).isFalse();
    }

    @Test
    @DisplayName("null est delegue aux autres contraintes (@NotNull)")
    void shouldAcceptNull() {
        assertThat(validator.isValid(null, null)).isTrue();
    }

    @Test
    @DisplayName("La comparaison utilise compareTo et non equals")
    void shouldCompareWithCompareTo() {
        // BigDecimal("1.0").equals(BigDecimal("1.00")) == false, mais compareTo == 0
        assertThat(new BigDecimal("1.0").equals(new BigDecimal("1.00"))).isFalse();
        assertThat(AllowedStepValidator.isAllowed(new BigDecimal("1.0"))).isTrue();
    }
}
