package com.splitpay.savings.validation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("Test unitaire du validateur @NoHtml")
class NoHtmlValidatorTest {

    private final NoHtmlValidator validator = new NoHtmlValidator();

    @ParameterizedTest(name = "texte autorise : {0}")
    @ValueSource(strings = {"Voyage a Paris", "Epargne d'ete", "Objectif - 2027", "Fonds 'urgence'"})
    void shouldAcceptPlainText(String value) {
        assertThat(validator.isValid(value, null)).isTrue();
    }

    @ParameterizedTest(name = "texte refuse : {0}")
    @ValueSource(strings = {"<script>alert(1)</script>", "a<b", "a>b", "<div>", ">>"})
    void shouldRejectHtmlCharacters(String value) {
        assertThat(validator.isValid(value, null)).isFalse();
    }

    @Test
    @DisplayName("null est autorise")
    void shouldAcceptNull() {
        assertThat(validator.isValid(null, null)).isTrue();
    }
}
