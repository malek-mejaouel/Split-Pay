package com.splitpay.savings.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.splitpay.savings.config.SavingsProperties;
import com.splitpay.savings.dto.GoalCreateRequest;
import com.splitpay.savings.dto.GoalResponse;
import com.splitpay.savings.dto.GoalUpdateRequest;
import com.splitpay.savings.dto.PageResponse;
import com.splitpay.savings.entity.GoalStatus;
import com.splitpay.savings.entity.SavingsAccount;
import com.splitpay.savings.entity.SavingsGoal;
import com.splitpay.savings.exception.BadRequestException;
import com.splitpay.savings.exception.ConflictException;
import com.splitpay.savings.exception.ErrorCode;
import com.splitpay.savings.exception.ResourceNotFoundException;
import com.splitpay.savings.mapper.SavingsGoalMapper;
import com.splitpay.savings.repository.SavingsGoalRepository;
import com.splitpay.savings.util.Money;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
@DisplayName("SavingsGoalService")
class SavingsGoalServiceTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID ACCOUNT_ID = UUID.randomUUID();
    private static final UUID GOAL_ID = UUID.randomUUID();

    @Mock
    private SavingsGoalRepository goalRepository;

    @Mock
    private SavingsAccountService accountService;

    private SavingsProperties properties;
    private SavingsGoalService service;

    @BeforeEach
    void setUp() {
        properties = new SavingsProperties();
        service = new SavingsGoalService(goalRepository, Mappers.getMapper(SavingsGoalMapper.class),
                accountService, properties);
    }

    /* ===================== Creation ===================== */

    @Nested
    @DisplayName("createGoal")
    class CreateGoal {

        @Test
        @DisplayName("Initialise currentAmount=0.00, status=IN_PROGRESS et trim le nom")
        void shouldCreateGoalWithDefaults() {
            when(accountService.findOrCreateEntity(USER_ID)).thenReturn(account());
            when(goalRepository.countByAccountIdAndStatus(ACCOUNT_ID, GoalStatus.IN_PROGRESS)).thenReturn(0L);
            when(goalRepository.existsByAccountIdAndNameIgnoreCase(ACCOUNT_ID, "Voyage a Paris")).thenReturn(false);
            when(goalRepository.save(any(SavingsGoal.class))).thenAnswer(invocation -> {
                SavingsGoal goal = invocation.getArgument(0);
                goal.setId(GOAL_ID);
                return goal;
            });

            GoalResponse response = service.createGoal(USER_ID,
                    new GoalCreateRequest("  Voyage a Paris  ", new BigDecimal("1500.00"),
                            LocalDate.now().plusMonths(3)));

            assertThat(response.id()).isEqualTo(GOAL_ID);
            assertThat(response.name()).isEqualTo("Voyage a Paris");
            assertThat(response.currentAmount()).isEqualByComparingTo("0.00");
            assertThat(response.targetAmount()).isEqualByComparingTo("1500.00");
            assertThat(response.status()).isEqualTo(GoalStatus.IN_PROGRESS);

            ArgumentCaptor<SavingsGoal> captor = ArgumentCaptor.forClass(SavingsGoal.class);
            verify(goalRepository).save(captor.capture());
            assertThat(captor.getValue().getAccountId()).isEqualTo(ACCOUNT_ID);
        }

        @Test
        @DisplayName("Maximum 10 objectifs IN_PROGRESS => 409 GOAL_LIMIT_REACHED")
        void shouldThrowWhenLimitReached() {
            when(accountService.findOrCreateEntity(USER_ID)).thenReturn(account());
            when(goalRepository.countByAccountIdAndStatus(ACCOUNT_ID, GoalStatus.IN_PROGRESS)).thenReturn(10L);

            assertThatThrownBy(() -> service.createGoal(USER_ID, createRequest("Vacances 2027")))
                    .isInstanceOf(ConflictException.class)
                    .extracting(ex -> ((ConflictException) ex).getCode())
                    .isEqualTo(ErrorCode.GOAL_LIMIT_REACHED);

            verify(goalRepository, never()).save(any(SavingsGoal.class));
        }

        @Test
        @DisplayName("Nom deja utilise par le meme compte (casse ignoree) => 409 GOAL_NAME_DUPLICATE")
        void shouldThrowWhenNameDuplicated() {
            when(accountService.findOrCreateEntity(USER_ID)).thenReturn(account());
            when(goalRepository.countByAccountIdAndStatus(ACCOUNT_ID, GoalStatus.IN_PROGRESS)).thenReturn(1L);
            when(goalRepository.existsByAccountIdAndNameIgnoreCase(ACCOUNT_ID, "Vacances 2027")).thenReturn(true);

            assertThatThrownBy(() -> service.createGoal(USER_ID, createRequest("Vacances 2027")))
                    .isInstanceOf(ConflictException.class)
                    .extracting(ex -> ((ConflictException) ex).getCode())
                    .isEqualTo(ErrorCode.GOAL_NAME_DUPLICATE);
        }

        @Test
        @DisplayName("Montant negatif => 400 INVALID_AMOUNT")
        void shouldThrowWhenAmountIsNegative() {
            GoalCreateRequest request = new GoalCreateRequest("Vacances 2027", new BigDecimal("-5.00"),
                    LocalDate.now().plusMonths(1));

            assertThatThrownBy(() -> service.createGoal(USER_ID, request))
                    .isInstanceOf(BadRequestException.class)
                    .extracting(ex -> ((BadRequestException) ex).getCode())
                    .isEqualTo(ErrorCode.INVALID_AMOUNT);
        }

        @Test
        @DisplayName("Montant a 3 decimales => 400 INVALID_AMOUNT")
        void shouldThrowWhenAmountHasThreeDecimals() {
            GoalCreateRequest request = new GoalCreateRequest("Vacances 2027", new BigDecimal("10.005"),
                    LocalDate.now().plusMonths(1));

            assertThatThrownBy(() -> service.createGoal(USER_ID, request))
                    .isInstanceOf(BadRequestException.class)
                    .extracting(ex -> ((BadRequestException) ex).getCode())
                    .isEqualTo(ErrorCode.INVALID_AMOUNT);
        }

        @Test
        @DisplayName("Nom vide apres trim => 400")
        void shouldThrowWhenNameIsBlankAfterTrim() {
            GoalCreateRequest request = new GoalCreateRequest("   ", new BigDecimal("10.00"),
                    LocalDate.now().plusMonths(1));

            assertThatThrownBy(() -> service.createGoal(USER_ID, request))
                    .isInstanceOf(BadRequestException.class);
        }
    }

    /* ===================== Modification ===================== */

    @Nested
    @DisplayName("updateGoal")
    class UpdateGoal {

        @Test
        @DisplayName("Objectif non IN_PROGRESS => 409 GOAL_NOT_EDITABLE")
        void shouldThrowWhenGoalNotEditable() {
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.of(account()));
            when(goalRepository.findByIdAndAccountId(GOAL_ID, ACCOUNT_ID))
                    .thenReturn(Optional.of(goal(GoalStatus.CANCELLED, "1500.00", "100.00")));

            assertThatThrownBy(() -> service.updateGoal(USER_ID, GOAL_ID, updateRequest("Nouveau nom", "2000.00")))
                    .isInstanceOf(ConflictException.class)
                    .extracting(ex -> ((ConflictException) ex).getCode())
                    .isEqualTo(ErrorCode.GOAL_NOT_EDITABLE);

            verify(goalRepository, never()).save(any(SavingsGoal.class));
        }

        @Test
        @DisplayName("targetAmount < currentAmount => 400 TARGET_BELOW_CURRENT")
        void shouldThrowWhenTargetBelowCurrent() {
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.of(account()));
            when(goalRepository.findByIdAndAccountId(GOAL_ID, ACCOUNT_ID))
                    .thenReturn(Optional.of(goal(GoalStatus.IN_PROGRESS, "1500.00", "900.00")));

            assertThatThrownBy(() -> service.updateGoal(USER_ID, GOAL_ID, updateRequest("Nouveau nom", "500.00")))
                    .isInstanceOf(BadRequestException.class)
                    .extracting(ex -> ((BadRequestException) ex).getCode())
                    .isEqualTo(ErrorCode.TARGET_BELOW_CURRENT);
        }

        @Test
        @DisplayName("Nom deja utilise par un autre objectif => 409 GOAL_NAME_DUPLICATE")
        void shouldThrowWhenNameDuplicated() {
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.of(account()));
            when(goalRepository.findByIdAndAccountId(GOAL_ID, ACCOUNT_ID))
                    .thenReturn(Optional.of(goal(GoalStatus.IN_PROGRESS, "1500.00", "100.00")));
            when(goalRepository.existsByAccountIdAndNameIgnoreCaseAndIdNot(ACCOUNT_ID, "Nouveau nom", GOAL_ID))
                    .thenReturn(true);

            assertThatThrownBy(() -> service.updateGoal(USER_ID, GOAL_ID, updateRequest("Nouveau nom", "2000.00")))
                    .isInstanceOf(ConflictException.class)
                    .extracting(ex -> ((ConflictException) ex).getCode())
                    .isEqualTo(ErrorCode.GOAL_NAME_DUPLICATE);
        }

        @Test
        @DisplayName("Objectif d'un autre utilisateur => 404 (jamais 403)")
        void shouldThrowNotFoundWhenGoalBelongsToAnotherUser() {
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.of(account()));
            when(goalRepository.findByIdAndAccountId(GOAL_ID, ACCOUNT_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.updateGoal(USER_ID, GOAL_ID, updateRequest("Nouveau nom", "2000.00")))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Utilisateur sans compte d'epargne => 404")
        void shouldThrowNotFoundWhenNoAccount() {
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.getGoal(USER_ID, GOAL_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Met a jour les champs autorises")
        void shouldUpdateGoal() {
            SavingsGoal existing = goal(GoalStatus.IN_PROGRESS, "1500.00", "100.00");
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.of(account()));
            when(goalRepository.findByIdAndAccountId(GOAL_ID, ACCOUNT_ID)).thenReturn(Optional.of(existing));
            when(goalRepository.existsByAccountIdAndNameIgnoreCaseAndIdNot(ACCOUNT_ID, "Voyage a Rome", GOAL_ID))
                    .thenReturn(false);
            when(goalRepository.save(any(SavingsGoal.class))).thenAnswer(invocation -> invocation.getArgument(0));

            GoalResponse response = service.updateGoal(USER_ID, GOAL_ID,
                    new GoalUpdateRequest(" Voyage a Rome ", new BigDecimal("2000.00"),
                            LocalDate.now().plusMonths(6)));

            assertThat(response.name()).isEqualTo("Voyage a Rome");
            assertThat(response.targetAmount()).isEqualByComparingTo("2000.00");
            assertThat(response.currentAmount()).isEqualByComparingTo("100.00");
            assertThat(response.status()).isEqualTo(GoalStatus.IN_PROGRESS);
        }
    }

    /* ===================== Suppression logique ===================== */

    @Nested
    @DisplayName("deleteGoal")
    class DeleteGoal {

        @Test
        @DisplayName("Passe le statut a CANCELLED")
        void shouldCancelGoal() {
            SavingsGoal existing = goal(GoalStatus.IN_PROGRESS, "1500.00", "100.00");
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.of(account()));
            when(goalRepository.findByIdAndAccountId(GOAL_ID, ACCOUNT_ID)).thenReturn(Optional.of(existing));
            when(goalRepository.save(any(SavingsGoal.class))).thenAnswer(invocation -> invocation.getArgument(0));

            service.deleteGoal(USER_ID, GOAL_ID);

            assertThat(existing.getStatus()).isEqualTo(GoalStatus.CANCELLED);
        }

        @Test
        @DisplayName("Objectif deja annule : operation idempotente")
        void shouldBeIdempotentWhenAlreadyCancelled() {
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.of(account()));
            when(goalRepository.findByIdAndAccountId(GOAL_ID, ACCOUNT_ID))
                    .thenReturn(Optional.of(goal(GoalStatus.CANCELLED, "1500.00", "100.00")));

            service.deleteGoal(USER_ID, GOAL_ID);

            verify(goalRepository, never()).save(any(SavingsGoal.class));
        }

        @Test
        @DisplayName("Objectif inexistant => 404")
        void shouldThrowNotFound() {
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.of(account()));
            when(goalRepository.findByIdAndAccountId(GOAL_ID, ACCOUNT_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.deleteGoal(USER_ID, GOAL_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    /* ===================== Listing ===================== */

    @Nested
    @DisplayName("listGoals")
    class ListGoals {

        @Test
        @DisplayName("Sans filtre : exclut les objectifs CANCELLED")
        void shouldExcludeCancelledByDefault() {
            Page<SavingsGoal> page = new PageImpl<>(List.of(goal(GoalStatus.IN_PROGRESS, "1500.00", "100.00")),
                    PageRequest.of(0, 20), 1);
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.of(account()));
            when(goalRepository.findByAccountIdAndStatusNot(eq(ACCOUNT_ID), eq(GoalStatus.CANCELLED), any(Pageable.class)))
                    .thenReturn(page);

            PageResponse<GoalResponse> response = service.listGoals(USER_ID, null, 0, 20, null, null);

            assertThat(response.content()).hasSize(1);
            assertThat(response.totalElements()).isEqualTo(1);
            verify(goalRepository, never()).findByAccountIdAndStatus(any(), any(), any());
        }

        @Test
        @DisplayName("Avec ?status=CANCELLED : utilise le filtre de statut")
        void shouldFilterByStatus() {
            Page<SavingsGoal> page = new PageImpl<>(List.of(goal(GoalStatus.CANCELLED, "1500.00", "100.00")),
                    PageRequest.of(0, 20), 1);
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.of(account()));
            when(goalRepository.findByAccountIdAndStatus(eq(ACCOUNT_ID), eq(GoalStatus.CANCELLED), any(Pageable.class)))
                    .thenReturn(page);

            PageResponse<GoalResponse> response = service.listGoals(USER_ID, GoalStatus.CANCELLED, 0, 20, null, null);

            assertThat(response.content()).singleElement()
                    .extracting(GoalResponse::status)
                    .isEqualTo(GoalStatus.CANCELLED);
        }

        @Test
        @DisplayName("Champ de tri hors liste blanche => 400 INVALID_SORT_FIELD")
        void shouldThrowWhenSortFieldNotAllowed() {
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.of(account()));

            assertThatThrownBy(() -> service.listGoals(USER_ID, null, 0, 20, "name", "asc"))
                    .isInstanceOf(BadRequestException.class)
                    .extracting(ex -> ((BadRequestException) ex).getCode())
                    .isEqualTo(ErrorCode.INVALID_SORT_FIELD);
        }

        @Test
        @DisplayName("Aucun compte d'epargne => page vide")
        void shouldReturnEmptyPageWhenNoAccount() {
            when(accountService.findByUserId(USER_ID)).thenReturn(Optional.empty());

            PageResponse<GoalResponse> response = service.listGoals(USER_ID, null, 0, 20, null, null);

            assertThat(response.content()).isEmpty();
            assertThat(response.totalElements()).isZero();
            assertThat(response.last()).isTrue();
        }
    }

    /* ===================== Helpers ===================== */

    private SavingsAccount account() {
        return SavingsAccount.builder()
                .id(ACCOUNT_ID)
                .userId(USER_ID)
                .balance(Money.ZERO)
                .roundUpEnabled(true)
                .roundUpStep(Money.DEFAULT_ROUND_UP_STEP)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private SavingsGoal goal(GoalStatus status, String target, String current) {
        return SavingsGoal.builder()
                .id(GOAL_ID)
                .accountId(ACCOUNT_ID)
                .name("Voyage a Paris")
                .targetAmount(new BigDecimal(target))
                .currentAmount(new BigDecimal(current))
                .deadline(LocalDate.now().plusMonths(3))
                .status(status)
                .build();
    }

    private GoalCreateRequest createRequest(String name) {
        return new GoalCreateRequest(name, new BigDecimal("1000.00"), LocalDate.now().plusMonths(3));
    }

    private GoalUpdateRequest updateRequest(String name, String target) {
        return new GoalUpdateRequest(name, new BigDecimal(target), LocalDate.now().plusMonths(3));
    }
}
