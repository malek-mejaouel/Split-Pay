package com.splitpay.savings.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Refuse les caracteres HTML (&lt; et &gt;) dans un champ texte (protection anti-XSS).
 */
@Documented
@Constraint(validatedBy = NoHtmlValidator.class)
@Target({ElementType.FIELD, ElementType.RECORD_COMPONENT, ElementType.PARAMETER, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface NoHtml {

    String message() default "Le champ ne doit pas contenir les caracteres '<' ou '>'.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
