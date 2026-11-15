package com.splitpay.savings.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.math.BigDecimal;
import java.util.List;

/**
 * Validateur de {@link AllowedStep}.
 * La comparaison se fait avec {@code compareTo} (jamais {@code equals})
 * car BigDecimal porte une echelle (1.0 n'est pas egal a 1.00 pour equals).
 */
public class AllowedStepValidator implements ConstraintValidator<AllowedStep, BigDecimal> {

    private static final List<BigDecimal> ALLOWED_STEPS = List.of(
            new BigDecimal("0.50"),
            new BigDecimal("1.00"),
            new BigDecimal("2.00"),
            new BigDecimal("5.00"));

    @Override
    public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {
        return value == null || isAllowed(value);
    }

    /** Reutilisation cote service (revalidation metier). */
    public static boolean isAllowed(BigDecimal value) {
        return value != null && ALLOWED_STEPS.stream().anyMatch(step -> step.compareTo(value) == 0);
    }

    public static String allowedValuesAsText() {
        return ALLOWED_STEPS.stream().map(BigDecimal::toPlainString).reduce((a, b) -> a + ", " + b).orElse("");
    }
}
