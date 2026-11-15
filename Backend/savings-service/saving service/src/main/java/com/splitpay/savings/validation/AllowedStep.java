package com.splitpay.savings.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Verifie qu'un montant correspond a un pas d'arrondi autorise : 0.50, 1.00, 2.00 ou 5.00.
 */
@Documented
@Constraint(validatedBy = AllowedStepValidator.class)
@Target({ElementType.FIELD, ElementType.RECORD_COMPONENT, ElementType.PARAMETER, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface AllowedStep {

    String message() default "Le pas d'arrondi autorise est 0.50, 1.00, 2.00 ou 5.00.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
