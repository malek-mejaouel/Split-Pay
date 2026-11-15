package com.splitpay.savings.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.splitpay.savings.dto.SavingsAccountResponse;
import com.splitpay.savings.dto.SettingsRequest;
import com.splitpay.savings.entity.SavingsAccount;
import com.splitpay.savings.exception.BadRequestException;
import com.splitpay.savings.exception.ErrorCode;
import com.splitpay.savings.mapper.SavingsAccountMapper;
import com.splitpay.savings.repository.SavingsAccountRepository;
import com.splitpay.savings.util.Money;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("SavingsAccountService")
class SavingsAccountServiceTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID ACCOUNT_ID = UUID.randomUUID();

    @Mock
    private SavingsAccountRepository accountRepository;

    private SavingsAccountService service;

    @BeforeEach
    void setUp() {
        service = new SavingsAccountService(accountRepository, Mappers.getMapper(SavingsAccountMapper.class));
    }

    @Test
    @DisplayName("getOrCreate : cree le compte avec les valeurs par defaut au premier acces")
    void getOrCreate_shouldCreateAccountWithDefaults() {
        when(accountRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(accountRepository.save(any(SavingsAccount.class))).thenAnswer(invocation -> {
            SavingsAccount account = invocation.getArgument(0);
            account.setId(ACCOUNT_ID);
            return account;
        });

        SavingsAccountResponse response = service.getOrCreateAccount(USER_ID);

        assertThat(response.id()).isEqualTo(ACCOUNT_ID);
        assertThat(response.userId()).isEqualTo(USER_ID);
        assertThat(response.balance()).isEqualByComparingTo("0.00");
        assertThat(response.roundUpStep()).isEqualByComparingTo("1.00");
        assertThat(response.roundUpEnabled()).isFalse();
        assertThat(response.createdAt()).isNotNull();
    }

    @Test
    @DisplayName("getOrCreate : retourne le compte existant sans le recreer")
    void getOrCreate_shouldReturnExistingAccount() {
        SavingsAccount existing = existingAccount();
        when(accountRepository.findByUserId(USER_ID)).thenReturn(Optional.of(existing));

        SavingsAccountResponse response = service.getOrCreateAccount(USER_ID);

        assertThat(response.id()).isEqualTo(ACCOUNT_ID);
        verify(accountRepository, never()).save(any(SavingsAccount.class));
    }

    @Test
    @DisplayName("updateSettings : met a jour l'activation et le pas d'arrondi")
    void updateSettings_shouldUpdateAccount() {
        when(accountRepository.findByUserId(USER_ID)).thenReturn(Optional.of(existingAccount()));
        when(accountRepository.save(any(SavingsAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SavingsAccountResponse response = service.updateSettings(USER_ID,
                new SettingsRequest(true, new BigDecimal("2.00")));

        assertThat(response.roundUpEnabled()).isTrue();
        assertThat(response.roundUpStep()).isEqualByComparingTo("2.00");
    }

    @Test
    @DisplayName("updateSettings : pas d'arrondi non autorise => 400")
    void updateSettings_withNotAllowedStep_shouldThrowBadRequest() {
        SettingsRequest request = new SettingsRequest(true, new BigDecimal("3.00"));

        assertThatThrownBy(() -> service.updateSettings(USER_ID, request))
                .isInstanceOf(BadRequestException.class)
                .extracting(ex -> ((BadRequestException) ex).getCode())
                .isEqualTo(ErrorCode.INVALID_ARGUMENT);

        verify(accountRepository, never()).save(any(SavingsAccount.class));
    }

    @Test
    @DisplayName("updateSettings : roundUpEnabled absent => 400")
    void updateSettings_withNullEnabled_shouldThrowBadRequest() {
        SettingsRequest request = new SettingsRequest(null, new BigDecimal("1.00"));

        assertThatThrownBy(() -> service.updateSettings(USER_ID, request))
                .isInstanceOf(BadRequestException.class);
    }

    private SavingsAccount existingAccount() {
        return SavingsAccount.builder()
                .id(ACCOUNT_ID)
                .userId(USER_ID)
                .balance(Money.ZERO)
                .roundUpEnabled(false)
                .roundUpStep(Money.DEFAULT_ROUND_UP_STEP)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
