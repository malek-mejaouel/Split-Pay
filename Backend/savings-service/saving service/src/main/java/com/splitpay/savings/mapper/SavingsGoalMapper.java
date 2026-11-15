package com.splitpay.savings.mapper;

import com.splitpay.savings.dto.GoalCreateRequest;
import com.splitpay.savings.dto.GoalResponse;
import com.splitpay.savings.dto.GoalUpdateRequest;
import com.splitpay.savings.entity.SavingsGoal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SavingsGoalMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "accountId", ignore = true)
    @Mapping(target = "currentAmount", ignore = true)
    @Mapping(target = "status", ignore = true)
    SavingsGoal toEntity(GoalCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "accountId", ignore = true)
    @Mapping(target = "currentAmount", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateEntity(GoalUpdateRequest request, @MappingTarget SavingsGoal goal);

    GoalResponse toResponse(SavingsGoal goal);
}
